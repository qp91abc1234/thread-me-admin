import { requestGet, requestPost } from '../utils/request'
import type {
  Role,
  RoleQueryParams,
  RoleListResponse,
  RolePermission,
  UpdateRole,
  CreateRole
} from '@/common/types/role'

/**
 * 获取角色列表
 * @param params 查询参数
 * @returns 角色列表响应
 */
export function getRoleList(params: RoleQueryParams): Promise<RoleListResponse> {
  return requestPost<RoleListResponse>('/role/list', params).then((res) => res.data)
}

/**
 * 获取角色详情
 * @param id 角色ID
 * @returns 角色信息
 */
export function getRoleDetail(id: number): Promise<Role> {
  return requestGet<Role>(`/role/${id}`).then((res) => res.data)
}

/**
 * 新增角色
 * @param role 角色信息
 * @returns 角色信息
 */
export function createRole(role: CreateRole): Promise<Role> {
  return requestPost<Role>('/role', role).then((res) => res.data)
}

/**
 * 更新角色
 * @param id 角色ID
 * @param role 角色信息
 * @returns 角色信息
 */
export function updateRole(id: number, role: UpdateRole): Promise<Role> {
  return requestPost<Role>(`/role/${id}`, role, { method: 'PUT' }).then((res) => res.data)
}

/**
 * 删除角色
 * @param id 角色ID
 * @returns 是否成功
 */
export function deleteRole(id: number): Promise<boolean> {
  return requestPost<boolean>(`/role/${id}`, {}, { method: 'DELETE' }).then((res) => res.data)
}

/**
 * 获取角色权限
 * @param id 角色ID
 * @returns 角色权限信息
 */
export function getRolePermissions(id: number): Promise<RolePermission> {
  return requestGet<RolePermission>(`/role/${id}/permissions`).then((res) => res.data)
}

/**
 * 分配角色权限
 * @param id 角色ID
 * @param permissions 权限信息
 * @returns 是否成功
 */
export function assignRolePermissions(id: number, permissions: RolePermission): Promise<boolean> {
  return requestPost<boolean>(`/role/${id}/permissions`, permissions).then((res) => res.data)
}
