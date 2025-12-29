// 按钮权限项
export interface ButtonPermission {
  code: string
  name: string
  hidden: boolean
}

// 按钮权限列表
export type ButtonPermissionList = ButtonPermission[]

// 按钮权限映射表
export type ButtonPermissionMap = Record<string, Omit<ButtonPermission, 'code'>>

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

// ========== RBAC 相关类型定义 ==========

// API权限项
export interface ApiPermission {
  code: string // 全局唯一，如 'GET:/api/user/list'
  name: string // API名称，如 '获取用户列表'
  method: string // HTTP方法，如 'GET', 'POST'
}

// API权限列表
export type ApiPermissionList = ApiPermission[]

// 菜单项（基于RouteConfig扩展）
export interface MenuItem extends RouteConfig {
  id: number
  parentId?: number // 父菜单ID，根菜单为undefined
  sort: number // 排序值
  status: number // 0-禁用，1-启用
  buttonPermissionCodes: string[] // 关联的按钮权限code数组
  apiPermissionCodes: string[] // 关联的API权限code数组
  createTime?: string
  updateTime?: string
  children?: MenuItem[] // 子菜单
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
