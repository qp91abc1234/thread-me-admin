// 角色信息
export interface Role {
  id: number
  name: string // 角色名称
  status: number // 0-禁用，1-启用
  isSystem: boolean // 是否系统角色
  createTime: string
  updateTime: string
}

// 创建角色
export type CreateRole = Omit<Role, 'id' | 'isSystem' | 'createTime' | 'updateTime'>

// 更新角色
export type UpdateRole = Partial<Omit<Role, 'id' | 'isSystem' | 'createTime' | 'updateTime'>>

// 角色列表查询参数
export interface RoleQueryParams {
  name?: string
  status?: number
  currentPage?: number
  pageSize?: number
}

// 角色列表响应
export interface RoleListResponse {
  list: Role[]
  total: number
}

// 角色权限信息（用于权限配置）
export interface RolePermission {
  menuIds: number[] // 菜单ID数组
  apiPermissionIds: number[] // API权限ID数组
}
