// 角色信息
export interface Role {
  id: number
  code: string // 角色编码，如 'admin', 'user'
  name: string // 角色名称
  description?: string
  status: number // 0-禁用，1-启用
  createTime: string
  updateTime?: string
}

// 创建角色
export type CreateRole = Omit<Role, 'id' | 'createTime' | 'updateTime'>

// 更新角色
export type UpdateRole = Partial<Omit<Role, 'id' | 'createTime' | 'updateTime'>>

// 角色列表查询参数
export interface RoleQueryParams {
  code?: string
  name?: string
  status?: number
  currentPage: number
  pageSize: number
}

// 角色列表响应
export interface RoleListResponse {
  list: Role[]
  total: number
}

// 角色权限信息（用于权限配置）
export interface RolePermission {
  menuIds: number[] // 菜单ID数组
  buttonPermissionCodes: string[] // 按钮权限code数组
  apiPermissionCodes: string[] // API权限code数组
}
