import { ref } from 'vue'
import { useContext } from '@/common/hooks/use-context'
import { getMenuTree } from '@/common/api/menu'
import type { MenuItem } from '@/common/types/permission'

/**
 * 角色页面 Context
 * 用于在角色页面和弹窗之间共享菜单树数据，避免重复请求
 */
export const { useProvide, useInject } = useContext('RoleContext', () => {
  const menuTree = ref<MenuItem[]>([])
  const allButtonPermissions = ref<Array<{ code: string; name: string }>>([])
  const allApiPermissions = ref<Array<{ code: string; name: string; method: string }>>([])

  // 从菜单树中提取所有按钮权限和API权限
  const extractPermissions = (menus: MenuItem[]) => {
    const buttonSet = new Set<string>()
    const apiSet = new Set<string>()
    const buttonMap = new Map<string, string>()
    const apiMap = new Map<string, { method: string; name: string }>()

    const traverse = (items: MenuItem[]) => {
      items.forEach((menu) => {
        // 提取按钮权限
        if (menu.buttonPermissionCodes && menu.buttonPermissionCodes.length > 0) {
          menu.buttonPermissionCodes.forEach((code) => {
            if (!buttonSet.has(code)) {
              buttonSet.add(code)
              // 从code中提取name（简化处理，实际应该从后端获取）
              const name = code.split(':')[1] || code
              buttonMap.set(code, name.charAt(0).toUpperCase() + name.slice(1))
            }
          })
        }

        // 提取API权限
        if (menu.apiPermissionCodes && menu.apiPermissionCodes.length > 0) {
          menu.apiPermissionCodes.forEach((code) => {
            if (!apiSet.has(code)) {
              apiSet.add(code)
              // 解析API权限code，格式：METHOD:/api/path
              const parts = code.split(':')
              const method = parts[0] || 'GET'
              const path = parts.slice(1).join(':')
              apiMap.set(code, { method, name: path })
            }
          })
        }

        if (menu.children && menu.children.length > 0) {
          traverse(menu.children)
        }
      })
    }

    traverse(menus)

    allButtonPermissions.value = Array.from(buttonMap.entries()).map(([code, name]) => ({
      code,
      name
    }))

    allApiPermissions.value = Array.from(apiMap.entries()).map(([code, { method, name }]) => ({
      code,
      name,
      method
    }))
  }

  // 加载菜单树
  const loadMenuTree = async () => {
    try {
      const res = await getMenuTree()
      menuTree.value = res.tree
      // 提取所有按钮权限和API权限
      extractPermissions(res.tree)
    } catch (error) {
      console.error('加载菜单树失败:', error)
    }
  }

  const initContext = async () => {
    await loadMenuTree()
  }

  return {
    initContext,
    menuTree,
    allButtonPermissions,
    allApiPermissions
  }
})
