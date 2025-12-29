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

  // 加载菜单树
  const loadMenuTree = async () => {
    try {
      const res = await getMenuTree()
      menuTree.value = res.tree
    } catch (error) {
      console.error('加载菜单树失败:', error)
    }
  }

  const initContext = async () => {
    await loadMenuTree()
  }

  return {
    initContext,
    menuTree
  }
})
