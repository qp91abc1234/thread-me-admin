import { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

// 模拟菜单数据存储
let menuList: any[] = [
  {
    id: 1,
    path: 'home',
    title: '首页',
    icon: 'Sunny',
    compPath: '/src/views/home/home.vue',
    parentId: undefined,
    sort: 1,
    status: 1,
    buttonPermissionIds: [],
    apiPermissionIds: [],
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    path: 'rbac',
    title: '权限管理',
    icon: 'Lock',
    parentId: undefined,
    sort: 2,
    status: 1,
    buttonPermissionIds: [],
    apiPermissionIds: [],
    createTime: '2024-01-01 10:00:00',
    children: [
      {
        id: 3,
        path: 'user',
        title: '用户管理',
        compPath: '/src/views/rbac/user/user.vue',
        parentId: 2,
        sort: 1,
        status: 1,
        buttonPermissionIds: [1, 2, 3, 4], // user:add, user:edit, user:delete, user:view
        apiPermissionIds: [1, 3, 4, 5], // GET:/api/user/list, POST:/api/user, PUT:/api/user/:id, DELETE:/api/user/:id
        createTime: '2024-01-01 10:00:00'
      },
      {
        id: 4,
        path: 'role',
        title: '角色管理',
        compPath: '/src/views/rbac/role/role.vue',
        parentId: 2,
        sort: 2,
        status: 1,
        buttonPermissionIds: [5, 6, 7, 8, 9], // role:add, role:edit, role:delete, role:view, role:permission
        apiPermissionIds: [6, 8, 9, 10], // GET:/api/role/list, POST:/api/role, PUT:/api/role/:id, DELETE:/api/role/:id
        createTime: '2024-01-01 10:00:00'
      },
      {
        id: 5,
        path: 'menu',
        title: '菜单管理',
        compPath: '/src/views/rbac/menu/menu.vue',
        parentId: 2,
        sort: 3,
        status: 1,
        buttonPermissionIds: [10, 11, 12, 13], // menu:add, menu:edit, menu:delete, menu:view
        apiPermissionIds: [11, 13, 14, 15], // GET:/api/menu/tree, POST:/api/menu, PUT:/api/menu/:id, DELETE:/api/menu/:id
        createTime: '2024-01-01 10:00:00'
      }
    ]
  },
  {
    id: 6,
    path: 'system',
    title: '系统管理',
    icon: 'Setting',
    parentId: undefined,
    sort: 3,
    status: 1,
    buttonPermissionIds: [],
    apiPermissionIds: [],
    createTime: '2024-01-01 10:00:00',
    children: [
      {
        id: 7,
        path: 'user',
        title: '用户管理',
        compPath: '/src/views/user/user.vue',
        parentId: 6,
        sort: 1,
        status: 1,
        buttonPermissionCodes: [],
        apiPermissionCodes: [],
        createTime: '2024-01-01 10:00:00'
      }
    ]
  }
]

// 扁平化菜单列表（用于CRUD操作）
function flattenMenuList(menus: any[], result: any[] = []): any[] {
  menus.forEach((menu) => {
    const { children, ...rest } = menu
    result.push(rest)
    if (children && children.length > 0) {
      flattenMenuList(children, result)
    }
  })
  return result
}

// 构建菜单树
function buildMenuTree(flatList: any[]): any[] {
  const map = new Map()
  const roots: any[] = []

  // 创建映射
  flatList.forEach((menu) => {
    map.set(menu.id, { ...menu, children: [] })
  })

  // 构建树
  flatList.forEach((menu) => {
    const node = map.get(menu.id)
    if (menu.parentId) {
      const parent = map.get(menu.parentId)
      if (parent) {
        parent.children.push(node)
      }
    } else {
      roots.push(node)
    }
  })

  // 排序
  function sortChildren(nodes: any[]) {
    nodes.sort((a, b) => a.sort - b.sort)
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        sortChildren(node.children)
      }
    })
  }
  sortChildren(roots)

  return roots
}

export default [
  // 获取菜单树
  {
    url: '/api/menu/tree',
    method: 'get',
    response: () => {
      const flatList = flattenMenuList(menuList)
      const tree = buildMenuTree(flatList)
      return {
        message: 'success',
        data: {
          tree
        }
      }
    }
  },
  // 获取菜单详情
  {
    url: '/api/menu/:id',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const id = parseInt(query.id)
      const flatList = flattenMenuList(menuList)
      const menu = flatList.find((m) => m.id === id)
      if (!menu) {
        return {
          message: '菜单不存在',
          data: null
        }
      }
      return {
        message: 'success',
        data: menu
      }
    }
  },
  // 新增菜单
  {
    url: '/api/menu',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const {
        path,
        title,
        icon,
        compPath,
        parentId,
        sort,
        status,
        buttonPermissionIds,
        apiPermissionIds
      } = body

      // 检查同级菜单路径是否重复
      const flatList = flattenMenuList(menuList)
      const siblings = flatList.filter((m) => m.parentId === parentId)
      if (siblings.some((m) => m.path === path)) {
        return {
          message: '同级菜单路径已存在',
          data: null
        }
      }

      const newMenu = {
        id: flatList.length > 0 ? Math.max(...flatList.map((m) => m.id)) + 1 : 1,
        path,
        title,
        icon: icon || '',
        compPath: compPath || '',
        parentId: parentId || undefined,
        sort: sort ?? 0,
        status: status ?? 1,
        buttonPermissionIds: buttonPermissionIds || [],
        apiPermissionIds: apiPermissionIds || [],
        createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }

      // 添加到扁平列表
      flatList.push(newMenu)
      // 重新构建树
      menuList = buildMenuTree(flatList)

      return {
        message: 'success',
        data: newMenu
      }
    }
  },
  // 更新菜单
  {
    url: '/api/menu/:id',
    method: 'put',
    response: ({ query, body }: { query: any; body: any }) => {
      const id = parseInt(query.id)
      const flatList = flattenMenuList(menuList)
      const index = flatList.findIndex((m) => m.id === id)
      if (index === -1) {
        return {
          message: '菜单不存在',
          data: null
        }
      }

      // 检查同级菜单路径是否重复
      const parentId = body.parentId !== undefined ? body.parentId : flatList[index].parentId
      const siblings = flatList.filter((m) => m.parentId === parentId && m.id !== id)
      if (body.path && siblings.some((m) => m.path === body.path)) {
        return {
          message: '同级菜单路径已存在',
          data: null
        }
      }

      // 更新数据
      flatList[index] = {
        ...flatList[index],
        ...body,
        id,
        updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }

      // 重新构建树
      menuList = buildMenuTree(flatList)

      return {
        message: 'success',
        data: flatList[index]
      }
    }
  },
  // 删除菜单
  {
    url: '/api/menu/:id',
    method: 'delete',
    response: ({ query }: { query: any }) => {
      const id = parseInt(query.id)
      const flatList = flattenMenuList(menuList)

      // 检查是否有子菜单
      const hasChildren = flatList.some((m) => m.parentId === id)
      if (hasChildren) {
        return {
          message: '该菜单下有子菜单，无法删除',
          data: null
        }
      }

      // 检查是否被角色使用（简化处理）
      // 实际应该查询角色权限表
      if (id <= 5) {
        return {
          message: '该菜单已被使用，无法删除',
          data: null
        }
      }

      const index = flatList.findIndex((m) => m.id === id)
      if (index === -1) {
        return {
          message: '菜单不存在',
          data: null
        }
      }

      flatList.splice(index, 1)
      menuList = buildMenuTree(flatList)

      return {
        message: 'success',
        data: true
      }
    }
  },
  // 更新菜单排序
  {
    url: '/api/menu/sort',
    method: 'put',
    response: ({ body }: { body: any }) => {
      const { items } = body // items: [{ id, parentId, sort }]
      if (!Array.isArray(items)) {
        return {
          message: '参数错误',
          data: null
        }
      }

      const flatList = flattenMenuList(menuList)
      items.forEach((item: any) => {
        const index = flatList.findIndex((m) => m.id === item.id)
        if (index !== -1) {
          flatList[index].sort = item.sort
          if (item.parentId !== undefined) {
            flatList[index].parentId = item.parentId
          }
        }
      })

      // 重新构建树
      menuList = buildMenuTree(flatList)

      return {
        message: 'success',
        data: true
      }
    }
  },
  // 获取所有API权限列表
  {
    url: '/api/permission/list',
    method: 'get',
    response: () => {
      // 模拟所有可用的API权限列表
      const allApiPermissions = [
        // 用户相关API
        { id: 1, code: 'GET:/api/user/list', name: '/api/user/list', method: 'GET' },
        { id: 2, code: 'GET:/api/user/:id', name: '/api/user/:id', method: 'GET' },
        { id: 3, code: 'POST:/api/user', name: '/api/user', method: 'POST' },
        { id: 4, code: 'PUT:/api/user/:id', name: '/api/user/:id', method: 'PUT' },
        { id: 5, code: 'DELETE:/api/user/:id', name: '/api/user/:id', method: 'DELETE' },
        // 角色相关API
        { id: 6, code: 'GET:/api/role/list', name: '/api/role/list', method: 'GET' },
        { id: 7, code: 'GET:/api/role/:id', name: '/api/role/:id', method: 'GET' },
        { id: 8, code: 'POST:/api/role', name: '/api/role', method: 'POST' },
        { id: 9, code: 'PUT:/api/role/:id', name: '/api/role/:id', method: 'PUT' },
        { id: 10, code: 'DELETE:/api/role/:id', name: '/api/role/:id', method: 'DELETE' },
        // 菜单相关API
        { id: 11, code: 'GET:/api/menu/tree', name: '/api/menu/tree', method: 'GET' },
        { id: 12, code: 'GET:/api/menu/:id', name: '/api/menu/:id', method: 'GET' },
        { id: 13, code: 'POST:/api/menu', name: '/api/menu', method: 'POST' },
        { id: 14, code: 'PUT:/api/menu/:id', name: '/api/menu/:id', method: 'PUT' },
        { id: 15, code: 'DELETE:/api/menu/:id', name: '/api/menu/:id', method: 'DELETE' },
        { id: 16, code: 'PUT:/api/menu/sort', name: '/api/menu/sort', method: 'PUT' },
        // 权限相关API
        { id: 17, code: 'GET:/api/permission/list', name: '/api/permission/list', method: 'GET' },
        { id: 18, code: 'GET:/api/permission/tree', name: '/api/permission/tree', method: 'GET' },
        // 文件上传相关API
        { id: 19, code: 'POST:/api/file/upload', name: '/api/file/upload', method: 'POST' },
        { id: 20, code: 'GET:/api/file/:id', name: '/api/file/:id', method: 'GET' },
        { id: 21, code: 'DELETE:/api/file/:id', name: '/api/file/:id', method: 'DELETE' },
        // 认证相关API
        { id: 22, code: 'POST:/api/auth/login', name: '/api/auth/login', method: 'POST' },
        { id: 23, code: 'POST:/api/auth/logout', name: '/api/auth/logout', method: 'POST' },
        { id: 24, code: 'GET:/api/auth/userinfo', name: '/api/auth/userinfo', method: 'GET' },
        { id: 25, code: 'POST:/api/auth/refresh', name: '/api/auth/refresh', method: 'POST' }
      ]

      return {
        message: 'success',
        data: allApiPermissions
      }
    }
  },
  // 根据按钮权限 id 数组获取按钮权限列表
  {
    url: '/api/permission/button/list',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const { ids } = body
      if (!Array.isArray(ids) || ids.length === 0) {
        return {
          message: 'success',
          data: []
        }
      }

      // 模拟所有可用的按钮权限列表
      const allButtonPermissions = [
        // 用户相关按钮权限
        { id: 1, code: 'user:add', name: '新增用户', hidden: false },
        { id: 2, code: 'user:edit', name: '编辑用户', hidden: false },
        { id: 3, code: 'user:delete', name: '删除用户', hidden: false },
        { id: 4, code: 'user:view', name: '查看用户', hidden: false },
        // 角色相关按钮权限
        { id: 5, code: 'role:add', name: '新增角色', hidden: false },
        { id: 6, code: 'role:edit', name: '编辑角色', hidden: false },
        { id: 7, code: 'role:delete', name: '删除角色', hidden: false },
        { id: 8, code: 'role:view', name: '查看角色', hidden: false },
        { id: 9, code: 'role:permission', name: '分配权限', hidden: false },
        // 菜单相关按钮权限
        { id: 10, code: 'menu:add', name: '新增菜单', hidden: false },
        { id: 11, code: 'menu:edit', name: '编辑菜单', hidden: false },
        { id: 12, code: 'menu:delete', name: '删除菜单', hidden: false },
        { id: 13, code: 'menu:view', name: '查看菜单', hidden: false }
      ]

      // 根据 ids 过滤返回对应的按钮权限
      const buttonPermissions = allButtonPermissions.filter((permission) => ids.includes(permission.id))

      return {
        message: 'success',
        data: buttonPermissions
      }
    }
  },
  // 创建按钮权限
  {
    url: '/api/permission/button',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const { code, name, hidden } = body

      // 模拟所有可用的按钮权限列表（用于生成新 ID）
      const allButtonPermissions = [
        { id: 1, code: 'user:add', name: '新增用户', hidden: false },
        { id: 2, code: 'user:edit', name: '编辑用户', hidden: false },
        { id: 3, code: 'user:delete', name: '删除用户', hidden: false },
        { id: 4, code: 'user:view', name: '查看用户', hidden: false },
        { id: 5, code: 'role:add', name: '新增角色', hidden: false },
        { id: 6, code: 'role:edit', name: '编辑角色', hidden: false },
        { id: 7, code: 'role:delete', name: '删除角色', hidden: false },
        { id: 8, code: 'role:view', name: '查看角色', hidden: false },
        { id: 9, code: 'role:permission', name: '分配权限', hidden: false },
        { id: 10, code: 'menu:add', name: '新增菜单', hidden: false },
        { id: 11, code: 'menu:edit', name: '编辑菜单', hidden: false },
        { id: 12, code: 'menu:delete', name: '删除菜单', hidden: false },
        { id: 13, code: 'menu:view', name: '查看菜单', hidden: false }
      ]

      // 生成新 ID
      const newId = allButtonPermissions.length > 0 ? Math.max(...allButtonPermissions.map((p) => p.id)) + 1 : 1

      const newButtonPermission = {
        id: newId,
        code,
        name,
        hidden: hidden || false
      }

      return {
        message: 'success',
        data: newButtonPermission
      }
    }
  },
  // 更新按钮权限
  {
    url: '/api/permission/button/:id',
    method: 'put',
    response: ({ query, body }: { query: any; body: any }) => {
      const id = parseInt(query.id)
      const { code, name, hidden } = body

      const updatedButtonPermission = {
        id,
        code,
        name,
        hidden: hidden !== undefined ? hidden : false
      }

      return {
        message: 'success',
        data: updatedButtonPermission
      }
    }
  },
  // 删除按钮权限
  {
    url: '/api/permission/button/:id',
    method: 'delete',
    response: ({ query }: { query: any }) => {
      const id = parseInt(query.id)

      // 模拟删除操作：从所有菜单的 buttonPermissionIds 中移除该 id
      const flatList = flattenMenuList(menuList)
      flatList.forEach((menu) => {
        if (menu.buttonPermissionIds && menu.buttonPermissionIds.includes(id)) {
          menu.buttonPermissionIds = menu.buttonPermissionIds.filter((bid) => bid !== id)
        }
      })

      // 重新构建树
      menuList = buildMenuTree(flatList)

      return {
        message: 'success',
        data: true
      }
    }
  }
] as MockMethod[]
