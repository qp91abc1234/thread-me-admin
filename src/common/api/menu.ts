import { requestGet, requestPost } from '../utils/request'
import type {
  MenuItem,
  MenuTreeResponse,
  MenuSortParams,
  ApiPermission,
  ButtonPermission
} from '@/common/types/permission'

/**
 * 获取菜单树
 * @returns 菜单树响应
 */
export function getMenuTree(): Promise<MenuTreeResponse> {
  return requestGet<MenuTreeResponse>('/menu/tree').then((res) => res.data)
}

/**
 * 获取菜单详情
 * @param id 菜单ID
 * @returns 菜单信息
 */
export function getMenuDetail(id: number): Promise<MenuItem> {
  return requestGet<MenuItem>(`/menu/${id}`).then((res) => res.data)
}

/**
 * 新增菜单
 * @param menu 菜单信息
 * @returns 菜单信息
 */
export function createMenu(menu: Partial<MenuItem>): Promise<MenuItem> {
  return requestPost<MenuItem>('/menu', menu).then((res) => res.data)
}

/**
 * 更新菜单
 * @param id 菜单ID
 * @param menu 菜单信息
 * @returns 菜单信息
 */
export function updateMenu(id: number, menu: Partial<MenuItem>): Promise<MenuItem> {
  return requestPost<MenuItem>(`/menu/${id}`, menu, { method: 'PUT' }).then((res) => res.data)
}

/**
 * 删除菜单
 * @param id 菜单ID
 * @returns 是否成功
 */
export function deleteMenu(id: number): Promise<boolean> {
  return requestPost<boolean>(`/menu/${id}`, {}, { method: 'DELETE' }).then((res) => res.data)
}

/**
 * 更新菜单排序
 * @param items 排序项数组
 * @returns 是否成功
 */
export function updateMenuSort(items: MenuSortParams[]): Promise<boolean> {
  return requestPost<boolean>('/menu/sort', { items }, { method: 'PUT' }).then((res) => res.data)
}

/**
 * 获取所有API权限列表
 * @returns API权限列表
 */
export function getAllApiPermissions(): Promise<ApiPermission[]> {
  return requestGet<ApiPermission[]>('/permission/list').then((res) => res.data)
}

/**
 * 根据按钮权限 id 数组获取按钮权限列表
 * @param ids 按钮权限 id 数组
 * @returns 按钮权限列表
 */
export function getButtonPermissionsByIds(ids: number[]): Promise<ButtonPermission[]> {
  if (!ids || ids.length === 0) {
    return Promise.resolve([])
  }
  return requestPost<ButtonPermission[]>('/permission/button/list', { ids }).then((res) => res.data)
}

/**
 * 创建按钮权限
 * @param buttonPermission 按钮权限信息
 * @returns 按钮权限信息
 */
export function createButtonPermission(
  buttonPermission: Omit<ButtonPermission, 'id'>
): Promise<ButtonPermission> {
  return requestPost<ButtonPermission>('/permission/button', buttonPermission).then((res) => res.data)
}

/**
 * 更新按钮权限
 * @param id 按钮权限ID
 * @param buttonPermission 按钮权限信息
 * @returns 按钮权限信息
 */
export function updateButtonPermission(
  id: number,
  buttonPermission: Partial<Omit<ButtonPermission, 'id'>>
): Promise<ButtonPermission> {
  return requestPost<ButtonPermission>(`/permission/button/${id}`, buttonPermission, { method: 'PUT' }).then(
    (res) => res.data
  )
}

/**
 * 删除按钮权限
 * @param id 按钮权限ID
 * @returns 是否成功
 */
export function deleteButtonPermission(id: number): Promise<boolean> {
  return requestPost<boolean>(`/permission/button/${id}`, {}, { method: 'DELETE' }).then((res) => res.data)
}
