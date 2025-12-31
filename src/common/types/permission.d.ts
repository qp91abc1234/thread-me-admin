// 路由配置项
export interface RouteConfig {
  path: string
  title: string
  icon?: string
  compPath?: string
  disabled?: boolean // 路由是否禁用
  visible?: boolean // 是否显示在菜单树
  children?: RouteConfig[]
}

// 路由配置列表
export type RouteConfigList = RouteConfig[]

// 按钮权限项
export interface ButtonPermission {
  id: number
  code: string
  name: string
  status: number
}

// 按钮权限列表
export type ButtonPermissionList = ButtonPermission[]

// 按钮权限映射表
export type ButtonPermissionMap = Record<string, Omit<ButtonPermission, 'code'>>

// ========== RBAC 相关类型定义 ==========

// API权限项
export interface ApiPermission {
  id: number
  path: string // API路径，如 '/api/user/list'
  method: string // HTTP方法，如 'GET', 'POST'
  matchType: string // 匹配类型：'exact' 或 'prefix'
  desc: string // 描述
  createTime?: string
  updateTime?: string
}

// API权限列表
export type ApiPermissionList = ApiPermission[]

// 菜单项（基于RouteConfig扩展）
export interface MenuItem {
  id: number
  name: string // 菜单名称
  path: string
  icon: string
  compPath: string
  type: number // 类型：0-目录，1-菜单项
  sort: number // 排序值
  visible: boolean // 是否显示
  status: number // 0-禁用，1-启用
  parentId: number | null // 父菜单ID，根菜单为null
  children: MenuItem[] // 子菜单
  createTime: string
  updateTime: string
}

// 菜单树响应
export interface MenuTreeResponse {
  tree: MenuItem[]
}

// 菜单排序参数
export interface MenuSortParams {
  id: number
  parentId?: number
  sort: number
}
