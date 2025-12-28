import { requestGet, requestPost } from '../utils/request'
import type { MenuItem, MenuTreeResponse, MenuSortParams } from '@/common/types/permission'

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
