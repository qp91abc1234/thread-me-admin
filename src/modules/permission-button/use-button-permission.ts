import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '@/store/modules/permission-store'

/**
 * 按钮权限模块
 * 根据当前路由的 meta.id 获取按钮权限，并提供权限判断方法
 */
export function useButtonPermission() {
  const route = useRoute()
  const permissionStore = usePermissionStore()

  // 当前菜单的按钮权限 code 数组
  const buttonPermissionCodes = ref<string[]>([])
  // 按钮权限 code 集合（用于快速查找）
  const buttonPermissionCodesSet = computed(() => {
    return new Set(buttonPermissionCodes.value)
  })
  // 是否正在加载
  const loading = ref(false)

  /**
   * 根据菜单ID加载按钮权限
   * @param menuId 菜单ID，如果不提供则从当前路由的 meta.id 获取
   */
  async function loadButtonPermissions(menuId?: number) {
    const targetMenuId = menuId ?? route.meta.id

    // 如果没有菜单ID，清空权限列表
    if (!targetMenuId || typeof targetMenuId !== 'number') {
      buttonPermissionCodes.value = []
      return
    }

    try {
      loading.value = true
      // 从 store 获取（带缓存，直接返回 code 数组）
      const codes = await permissionStore.getButtonPermissionsByMenuId(targetMenuId)
      buttonPermissionCodes.value = codes
    } catch (error) {
      console.error('加载按钮权限失败:', error)
      buttonPermissionCodes.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 判断是否有指定按钮权限
   * @param code 按钮权限 code
   * @returns 是否有权限
   */
  function hasPermission(code: string): boolean {
    return buttonPermissionCodesSet.value.has(code)
  }

  /**
   * 判断是否有任意一个按钮权限
   * @param codes 按钮权限 code 数组
   * @returns 是否有任意一个权限
   */
  function hasAnyPermission(codes: string[]): boolean {
    return codes.some((code) => buttonPermissionCodesSet.value.has(code))
  }

  /**
   * 判断是否有所有按钮权限
   * @param codes 按钮权限 code 数组
   * @returns 是否有所有权限
   */
  function hasAllPermissions(codes: string[]): boolean {
    return codes.every((code) => buttonPermissionCodesSet.value.has(code))
  }

  // 初始化：如果当前路由有菜单ID，自动加载
  if (route.meta.id && typeof route.meta.id === 'number') {
    loadButtonPermissions()
  }

  return {
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
}
