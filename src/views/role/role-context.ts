import { ref } from 'vue'
import { useContext } from '@/common/hooks/use-context'
import { getMenuTree, getAllApiPermissions } from '@/common/api/permission'
import type { MenuItem, ApiPermission } from '@/common/types/permission'

/**
 * 角色页面 Context
 * 用于在角色页面和弹窗之间共享菜单树数据和API权限列表，避免重复请求
 */
export const { useProvide, useInject } = useContext('RoleContext', () => {
  const menuTree = ref<MenuItem[]>([])
  const allApiPermissions = ref<ApiPermission[]>([])
  const loadingApiPermissions = ref(false)

  // 加载菜单树
  const loadMenuTree = async () => {
    try {
      const res = await getMenuTree()
      menuTree.value = res.tree
    } catch (error) {
      console.error('加载菜单树失败:', error)
    }
  }

  // 加载所有API权限
  const loadAllApiPermissions = async () => {
    loadingApiPermissions.value = true
    try {
      allApiPermissions.value = await getAllApiPermissions()
    } catch (error) {
      console.error('加载API权限列表失败:', error)
    } finally {
      loadingApiPermissions.value = false
    }
  }

  const initContext = async () => {
    await loadMenuTree()
    await loadAllApiPermissions()
  }

  return {
    initContext,
    menuTree,
    allApiPermissions,
    loadingApiPermissions
  }
})
