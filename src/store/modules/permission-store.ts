import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { RouteRecordRaw } from 'vue-router'
import {
  getMenuTree,
  getButtonPermissionsByMenuId as fetchButtonPermissionsByMenuId
} from '@/common/api/permission'
import { useUserStore } from './user-store'
import type { MenuItem } from '@/common/types/permission'

// 视图组件模块映射（用于动态导入）
const viewComponentModules = import.meta.glob('@/views/**/*.vue')

export const usePermissionStore = defineStore('permission', () => {
  const userStore = useUserStore()
  // 权限是否已初始化
  const isInitialized = ref(false)
  // 路由树
  const routeTree = ref<RouteRecordRaw[]>([])
  // 路由映射表（用于面包屑等场景）
  const routeMap = ref<Record<string, { title: string; jumpPath: string | undefined }>>({})
  // 按钮权限缓存：key 为菜单ID，value 为按钮权限 code 数组
  const buttonPermissionsCache = ref<Record<number, string[]>>({})
  // 正在进行的请求 Promise 缓存：key 为菜单ID，value 为请求 Promise
  const pendingRequests = new Map<number, Promise<string[]>>()

  /**
   * 初始化权限数据并构建路由树
   */
  async function initPermissions() {
    const res = await getMenuTree(1, userStore.userInfo?.roleIds)
    buildRouteTree(res.tree, routeTree.value)
  }

  /**
   * 递归构建路由树
   * @param menuTree 菜单树
   * @param routes 存放路由的容器
   * @param parentPath 父级路径
   * @returns 返回是否所有子路由都被禁用及第一个可见路径
   */
  function buildRouteTree(
    menuTree: MenuItem[],
    routes: RouteRecordRaw[] = [],
    parentPath = '/'
  ): { firstVisiblePath: string } {
    let firstVisiblePath = ''

    for (const menuItem of menuTree) {
      const isVisible = menuItem.visible ?? true

      // 构建完整路由路径
      const routePath = parentPath.endsWith('/')
        ? `${parentPath}${menuItem.path}`
        : `${parentPath}/${menuItem.path}`

      // 构建路由记录对象
      const routeRecord: any = {
        path: routePath,
        name: routePath,
        component: menuItem.compPath ? viewComponentModules[menuItem.compPath] : undefined,
        meta: {
          id: menuItem.id,
          title: menuItem.name,
          icon: menuItem.icon,
          visible: isVisible
        }
      }

      // 记录第一个可见路径
      if (!firstVisiblePath && isVisible) {
        firstVisiblePath = routePath
      }

      // 处理子路由
      if (!menuItem.compPath && menuItem.children && menuItem.children.length > 0) {
        routeRecord.children = []
        const { firstVisiblePath: childFirstVisiblePath } = buildRouteTree(
          menuItem.children,
          routeRecord.children,
          routePath
        )

        // 设置重定向到第一个可见的子路由
        if (childFirstVisiblePath) {
          routeRecord.redirect = childFirstVisiblePath
        } else {
          // 如果没有可见的子路由，隐藏父路由
          routeRecord.meta!.visible = false
        }
      }

      // 使用完整路径作为 key，避免重复
      routeMap.value[routePath] = {
        title: menuItem.name,
        jumpPath: routeRecord.redirect || routeRecord.path
      }

      routes.push(routeRecord)
    }

    return { firstVisiblePath }
  }

  /**
   * 根据菜单ID获取按钮权限 code 数组（带缓存和请求去重）
   * @param menuId 菜单ID
   * @returns 按钮权限 code 数组
   */
  async function getButtonPermissionsByMenuId(menuId: number): Promise<string[]> {
    // 如果缓存中有，直接返回
    if (buttonPermissionsCache.value[menuId]) {
      return buttonPermissionsCache.value[menuId]
    }

    // 如果已经有相同 menuId 的请求正在进行，直接返回该 Promise
    if (pendingRequests.has(menuId)) {
      return pendingRequests.get(menuId)!
    }

    // 创建新的请求 Promise
    const requestPromise = (async () => {
      try {
        // 从API获取
        const buttons = await fetchButtonPermissionsByMenuId(menuId)
        // 只缓存启用的按钮权限的 code 数组
        const codes = buttons.filter((btn) => btn.status === 1).map((btn) => btn.code)
        buttonPermissionsCache.value[menuId] = codes
        return codes
      } finally {
        // 请求完成后，从 pendingRequests 中移除
        pendingRequests.delete(menuId)
      }
    })()

    // 将请求 Promise 存入 Map，避免重复请求
    pendingRequests.set(menuId, requestPromise)

    return requestPromise
  }

  /**
   * 清除按钮权限缓存（用于权限更新后刷新）
   * @param menuId 可选的菜单ID，如果提供则只清除该菜单的缓存，否则清除所有
   */
  function clearButtonPermissionsCache(menuId?: number) {
    if (menuId !== undefined) {
      delete buttonPermissionsCache.value[menuId]
      // 同时清除该菜单的 pending 请求
      pendingRequests.delete(menuId)
    } else {
      buttonPermissionsCache.value = {}
      // 清除所有 pending 请求
      pendingRequests.clear()
    }
  }

  /**
   * 重置权限状态
   */
  function reset() {
    isInitialized.value = false
    routeTree.value = []
    routeMap.value = {}
    buttonPermissionsCache.value = {}
    pendingRequests.clear()
  }

  return {
    isInitialized,
    routeTree,
    routeMap,
    buttonPermissionsCache,
    initPermissions,
    getButtonPermissionsByMenuId,
    clearButtonPermissionsCache,
    reset
  }
})
