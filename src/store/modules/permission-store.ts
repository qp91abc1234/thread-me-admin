import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { RouteRecordRaw } from 'vue-router'
import { getMenuTree } from '@/common/api/permission'
import { useUserStore } from './user-store'
import type { MenuItem } from '@/common/types/permission'

// 视图组件模块映射（用于动态导入）
const viewComponentModules = import.meta.glob('@/views/**/*.vue')

const HOME_ROUTE = {
  path: 'home',
  name: '首页',
  compPath: '/src/views/home/home.vue',
  icon: 'Sunny'
} as MenuItem

const ERROR_ROUTE = {
  path: ':pathMatch(.*)*',
  name: '404',
  compPath: '/src/views/error/error.vue',
  visible: false
} as MenuItem

export const usePermissionStore = defineStore('permission', () => {
  const userStore = useUserStore()
  // 权限是否已初始化
  const isInitialized = ref(false)
  // 路由树
  const routeTree = ref<RouteRecordRaw[]>([])
  // 路由映射表（用于面包屑等场景）
  const routeMap = ref<Record<string, { title: string; jumpPath: string | undefined }>>({})

  /**
   * 初始化权限数据并构建路由树
   */
  async function initPermissions() {
    const res = await getMenuTree(1, userStore.userInfo?.roleIds)
    const menuTree = [HOME_ROUTE].concat(res.tree).concat(ERROR_ROUTE)
    buildRouteTree(menuTree, routeTree.value)
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
   * 重置权限状态
   */
  function reset() {
    isInitialized.value = false
    routeTree.value = []
    routeMap.value = {}
  }

  return {
    isInitialized,
    routeTree,
    routeMap,
    initPermissions,
    reset
  }
})
