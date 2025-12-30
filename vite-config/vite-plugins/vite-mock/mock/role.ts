import { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

// 模拟角色数据存储
const roleList = Mock.mock({
  'list|5-8': [
    {
      'id|+1': 1,
      name: () =>
        `${Mock.Random.pick(['管理员', '编辑', '查看', '运营', '测试'])}${Mock.Random.integer(1, 5)}`,
      'status|1': [0, 1],
      isSystem: false,
      createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
      updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")'
    }
  ]
}).list

// 初始化默认角色
if (roleList.length > 0) {
  roleList[0] = {
    id: 1,
    name: '超级管理员',
    status: 1,
    isSystem: true,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  }
  if (roleList.length > 1) {
    roleList[1] = {
      id: 2,
      name: '普通用户',
      status: 1,
      isSystem: false,
      createTime: '2024-01-01 10:00:00',
      updateTime: '2024-01-01 10:00:00'
    }
  }
}

// 角色权限关联数据
const rolePermissions: Record<
  number,
  { menuIds: number[]; apiPermissionIds: number[] }
> = {}

export default [
  // 获取角色列表
  {
    url: '/api/role/list',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const { name, status, currentPage = 1, pageSize = 10 } = body

      // 过滤数据
      let filteredList = [...roleList]
      if (name) {
        filteredList = filteredList.filter((role) => role.name.includes(name))
      }
      if (status !== undefined && status !== '') {
        filteredList = filteredList.filter((role) => role.status === status)
      }

      // 分页
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      const list = filteredList.slice(start, end)
      const total = filteredList.length

      return {
        message: 'success',
        data: {
          list,
          total
        }
      }
    }
  },
  // 获取角色详情
  {
    url: '/api/role/:id',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const id = parseInt(query.id)
      const role = roleList.find((r) => r.id === id)
      if (!role) {
        return {
          message: '角色不存在',
          data: null
        }
      }
      return {
        message: 'success',
        data: role
      }
    }
  },
  // 新增角色
  {
    url: '/api/role',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const { name, status } = body

      // 检查角色名称是否已存在
      if (roleList.some((r) => r.name === name)) {
        return {
          message: '角色名称已存在',
          data: null
        }
      }

      const newRole = {
        id: roleList.length > 0 ? Math.max(...roleList.map((r) => r.id)) + 1 : 1,
        name,
        status: status ?? 1,
        isSystem: false,
        createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }

      roleList.push(newRole)
      return {
        message: 'success',
        data: newRole
      }
    }
  },
  // 更新角色
  {
    url: '/api/role/:id',
    method: 'put',
    response: ({ query, body }: { query: any; body: any }) => {
      const id = parseInt(query.id)
      const index = roleList.findIndex((r) => r.id === id)
      if (index === -1) {
        return {
          message: '角色不存在',
          data: null
        }
      }

      // 检查角色名称是否已被其他角色使用
      if (body.name && roleList.some((r) => r.name === body.name && r.id !== id)) {
        return {
          message: '角色名称已存在',
          data: null
        }
      }

      roleList[index] = {
        ...roleList[index],
        ...body,
        id,
        updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }
      // 确保 isSystem 字段存在
      if (roleList[index].isSystem === undefined) {
        roleList[index].isSystem = false
      }

      return {
        message: 'success',
        data: roleList[index]
      }
    }
  },
  // 删除角色
  {
    url: '/api/role/:id',
    method: 'delete',
    response: ({ query }: { query: any }) => {
      const id = parseInt(query.id)
      const index = roleList.findIndex((r) => r.id === id)
      if (index === -1) {
        return {
          message: '角色不存在',
          data: null
        }
      }

      // 检查是否有用户使用该角色（简化处理，实际应该查询用户表）
      // 这里假设有用户使用，返回错误
      if (id === 1 || id === 2) {
        return {
          message: '该角色已被使用，无法删除',
          data: null
        }
      }

      roleList.splice(index, 1)
      delete rolePermissions[id]
      return {
        message: 'success',
        data: true
      }
    }
  },
  // 获取角色权限
  {
    url: '/api/role/:id/permissions',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const id = parseInt(query.id)
      const permissions = rolePermissions[id] || {
        menuIds: [],
        apiPermissionIds: []
      }
      return {
        message: 'success',
        data: permissions
      }
    }
  },
  // 分配角色权限
  {
    url: '/api/role/:id/permissions',
    method: 'post',
    response: ({ query, body }: { query: any; body: any }) => {
      const id = parseInt(query.id)
      if (!roleList.some((r) => r.id === id)) {
        return {
          message: '角色不存在',
          data: null
        }
      }

      rolePermissions[id] = {
        menuIds: body.menuIds || [],
        apiPermissionIds: body.apiPermissionIds || []
      }

      return {
        message: 'success',
        data: true
      }
    }
  }
] as MockMethod[]
