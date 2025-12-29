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
    buttonPermissionCodes: [],
    apiPermissionCodes: [],
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
    buttonPermissionCodes: [],
    apiPermissionCodes: [],
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
        buttonPermissionCodes: ['user:add', 'user:edit', 'user:delete', 'user:view'],
        apiPermissionCodes: [
          'GET:/api/user/list',
          'POST:/api/user',
          'PUT:/api/user/:id',
          'DELETE:/api/user/:id'
        ],
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
        buttonPermissionCodes: [
          'role:add',
          'role:edit',
          'role:delete',
          'role:view',
          'role:permission'
        ],
        apiPermissionCodes: [
          'GET:/api/role/list',
          'POST:/api/role',
          'PUT:/api/role/:id',
          'DELETE:/api/role/:id'
        ],
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
        buttonPermissionCodes: ['menu:add', 'menu:edit', 'menu:delete', 'menu:view'],
        apiPermissionCodes: [
          'GET:/api/menu/tree',
          'POST:/api/menu',
          'PUT:/api/menu/:id',
          'DELETE:/api/menu/:id'
        ],
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
    buttonPermissionCodes: [],
    apiPermissionCodes: [],
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
        buttonPermissionCodes,
        apiPermissionCodes
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
        buttonPermissionCodes: buttonPermissionCodes || [],
        apiPermissionCodes: apiPermissionCodes || [],
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
  }
] as MockMethod[]
