import { ref } from 'vue'
import { useContext } from '@/common/hooks/use-context'
import { getRoleList } from '@/common/api/role'
import type { Role } from '@/common/types/role'

/**
 * 用户页面 Context
 * 用于在用户页面和弹窗之间共享角色列表，避免重复请求
 */
export const { useProvide, useInject } = useContext('UserContext', () => {
  const roleOptions = ref<Role[]>([])

  // 加载角色列表
  const loadRoleOptions = async () => {
    try {
      const res = await getRoleList()
      roleOptions.value = res.list
    } catch (error) {
      console.error('加载角色列表失败:', error)
    }
  }

  const initContext = async () => {
    await loadRoleOptions()
  }

  return {
    initContext,
    roleOptions
  }
})
