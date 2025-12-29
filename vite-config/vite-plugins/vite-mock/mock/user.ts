import { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

// 模拟用户数据存储
const userList = Mock.mock({
  'list|15-20': [
    {
      'id|+1': 1,
      username: '@word(5,10)',
      realName: '@cname',
      email: '@email',
      phone: /^1[3-9]\d{9}$/,
      'roleIds|1-3': [() => Mock.Random.integer(1, 5)],
      'status|1': [0, 1],
      createTime: '@datetime("yyyy-MM-dd HH:mm:ss")'
    }
  ]
}).list

// 初始化默认管理员
if (userList.length > 0) {
  userList[0] = {
    id: 1,
    username: 'admin',
    realName: '系统管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    roleIds: [1], // 超级管理员角色
    status: 1,
    createTime: '2024-01-01 10:00:00'
  }
}

export default [
  // 获取用户列表
  {
    url: '/api/user/list',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const { username, status, currentPage = 1, pageSize = 10 } = body

      // 过滤数据
      let filteredList = [...userList]
      if (username) {
        filteredList = filteredList.filter((user) => user.username.includes(username))
      }
      if (status !== undefined && status !== '') {
        filteredList = filteredList.filter((user) => user.status === status)
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
  // 获取用户详情
  {
    url: '/api/user/:id',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const id = parseInt(query.id)
      const user = userList.find((u) => u.id === id)
      if (!user) {
        return {
          message: '用户不存在',
          data: null
        }
      }
      return {
        message: 'success',
        data: user
      }
    }
  },
  // 新增用户
  {
    url: '/api/user',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const { username, realName, email, phone, roleIds, status } = body

      // 检查用户名是否已存在
      if (userList.some((u) => u.username === username)) {
        return {
          message: '用户名已存在',
          data: null
        }
      }

      const newUser = {
        id: userList.length > 0 ? Math.max(...userList.map((u) => u.id)) + 1 : 1,
        username,
        realName,
        email,
        phone,
        roleIds: roleIds || [],
        status: status ?? 1,
        createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }

      userList.push(newUser)
      return {
        message: 'success',
        data: newUser
      }
    }
  },
  // 更新用户
  {
    url: '/api/user/:id',
    method: 'put',
    response: ({ query, body }: { query: any; body: any }) => {
      const id = parseInt(query.id)
      const index = userList.findIndex((u) => u.id === id)
      if (index === -1) {
        return {
          message: '用户不存在',
          data: null
        }
      }

      // 检查用户名是否已被其他用户使用
      if (body.username && userList.some((u) => u.username === body.username && u.id !== id)) {
        return {
          message: '用户名已存在',
          data: null
        }
      }

      userList[index] = {
        ...userList[index],
        ...body,
        id,
        updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }

      return {
        message: 'success',
        data: userList[index]
      }
    }
  },
  // 删除用户
  {
    url: '/api/user/:id',
    method: 'delete',
    response: ({ query }: { query: any }) => {
      const id = parseInt(query.id)
      const index = userList.findIndex((u) => u.id === id)
      if (index === -1) {
        return {
          message: '用户不存在',
          data: null
        }
      }

      userList.splice(index, 1)
      return {
        message: 'success',
        data: true
      }
    }
  }
] as MockMethod[]

