import { requestGet, requestPost } from '../utils/request'
import type { User, UserQueryParams, UserListResponse } from '@/common/types/permission'

/**
 * 获取用户列表
 * @param params 查询参数
 * @returns 用户列表响应
 */
export function getUserList(params: UserQueryParams): Promise<UserListResponse> {
  return requestPost<UserListResponse>('/user/list', params).then((res) => res.data)
}

/**
 * 获取用户详情
 * @param id 用户ID
 * @returns 用户信息
 */
export function getUserDetail(id: number): Promise<User> {
  return requestGet<User>(`/user/${id}`).then((res) => res.data)
}

/**
 * 新增用户
 * @param user 用户信息
 * @returns 用户信息
 */
export function createUser(user: Partial<User> & { password: string }): Promise<User> {
  return requestPost<User>('/user', user).then((res) => res.data)
}

/**
 * 更新用户
 * @param id 用户ID
 * @param user 用户信息
 * @returns 用户信息
 */
export function updateUser(id: number, user: Partial<User>): Promise<User> {
  return requestPost<User>(`/user/${id}`, user, { method: 'PUT' }).then((res) => res.data)
}

/**
 * 删除用户
 * @param id 用户ID
 * @returns 是否成功
 */
export function deleteUser(id: number): Promise<boolean> {
  return requestPost<boolean>(`/user/${id}`, {}, { method: 'DELETE' }).then((res) => res.data)
}
