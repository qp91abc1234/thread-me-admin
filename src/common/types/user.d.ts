// 用户信息
export interface User {
  id: number
  username: string
  realName: string
  email: string
  phone: string
  roleIds: number[] // 角色ID数组（多对多）
  status: number // 0-禁用，1-启用
  isSystem: boolean // 是否系统用户
  createTime: string
  updateTime: string
}

// 创建用户
export type CreateUser = Omit<User, 'id' | 'isSystem' | 'createTime' | 'updateTime'> & {
  password: string
}

// 更新用户
export type UpdateUser = Partial<Omit<User, 'id' | 'isSystem' | 'createTime' | 'updateTime'>>

// 用户列表查询参数
export interface UserQueryParams {
  username?: string
  status?: number
  currentPage?: number
  pageSize?: number
}

// 用户列表响应
export interface UserListResponse {
  list: User[]
  total: number
}
