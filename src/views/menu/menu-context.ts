import { ref } from 'vue'
import { useContext } from '@/common/hooks/use-context'
import { getMenuTree } from '@/common/api/permission'
import type { MenuItem } from '@/common/types/permission'

/**
 * 菜单页面 Context
 * 用于在菜单页面和子组件之间共享菜单树数据和当前选中节点，避免重复请求
 */
export const { useProvide, useInject } = useContext('MenuContext', () => {
  const menuTree = ref<MenuItem[]>([])
  const currentNode = ref<MenuItem | null>(null)
  const loading = ref(false)

  // 加载菜单树
  const loadMenuTree = async () => {
    loading.value = true
    try {
      const res = await getMenuTree()
      menuTree.value = res.tree
    } catch (error) {
      console.error('加载菜单树失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 设置当前选中节点
  const setCurrentNode = (node: MenuItem | null) => {
    currentNode.value = node
  }

  const initContext = async () => {
    await loadMenuTree()
    // 默认选中第一个节点
    if (menuTree.value.length > 0 && !currentNode.value) {
      setCurrentNode(menuTree.value[0])
    }
  }

  return {
    initContext,
    menuTree,
    currentNode,
    loading,
    loadMenuTree,
    setCurrentNode
  }
})
