import { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

// 模拟菜单数据存储
let menuList: any[] = [
  {
    id: 1,
    name: '首页',
    path: 'home',
    icon: 'Sunny',
    compPath: '/src/views/home/home.vue',
    type: 1,
    parentId: undefined,
    sort: 1,
    visible: true,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: '权限管理',
    path: 'rbac',
    icon: 'Lock',
    type: 0,
    parentId: undefined,
    sort: 2,
    visible: true,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    children: [
      {
        id: 3,
        name: '用户管理',
        path: 'user',
        compPath: '/src/views/user/user.vue',
        type: 1,
        parentId: 2,
        sort: 1,
        visible: true,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00'
      },
      {
        id: 4,
        name: '角色管理',
        path: 'role',
        compPath: '/src/views/role/role.vue',
        type: 1,
        parentId: 2,
        sort: 2,
        visible: true,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00'
      },
      {
        id: 5,
        name: '菜单管理',
        path: 'menu',
        compPath: '/src/views/menu/menu.vue',
        type: 1,
        parentId: 2,
        sort: 3,
        visible: true,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00'
      }
    ]
  },
  {
    id: 6,
    name: '系统管理',
    path: 'system',
    icon: 'Setting',
    type: 0,
    parentId: undefined,
    sort: 3,
    visible: true,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    children: []
  }
]

// 模拟按钮权限数据存储（根据 schema.prisma，Button 表有 menuId 字段）
const buttonPermissionList: any[] = [
  // 用户管理菜单（id: 3）的按钮权限
  {
    id: 1,
    menuId: 3,
    code: 'user:add',
    name: '新增用户',
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    menuId: 3,
    code: 'user:edit',
    name: '编辑用户',
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 3,
    menuId: 3,
    code: 'user:delete',
    name: '删除用户',
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 4,
    menuId: 3,
    code: 'user:view',
    name: '查看用户',
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  // 角色管理菜单（id: 4）的按钮权限
  {
    id: 5,
    menuId: 4,
    code: 'role:add',
    name: '新增角色',
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 6,
    menuId: 4,
    code: 'role:edit',
    name: '编辑角色',
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 7,
    menuId: 4,
    code: 'role:delete',
    name: '删除角色',
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 8,
    menuId: 4,
    code: 'role:view',
    name: '查看角色',
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 9,
    menuId: 4,
    code: 'role:permission',
    name: '分配权限',
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  // 菜单管理菜单（id: 5）的按钮权限
  {
    id: 10,
    menuId: 5,
    code: 'menu:add',
    name: '新增菜单',
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 11,
    menuId: 5,
    code: 'menu:edit',
    name: '编辑菜单',
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 12,
    menuId: 5,
    code: 'menu:delete',
    name: '删除菜单',
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 13,
    menuId: 5,
    code: 'menu:view',
    name: '查看菜单',
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
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
      const { name, path, icon, compPath, parentId, sort, visible, status } = body

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
        name,
        path,
        icon: icon || null,
        compPath: compPath || null,
        parentId: parentId || null,
        sort: sort ?? 0,
        visible: visible !== undefined ? visible : true,
        status: status ?? 1,
        createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
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
      // 确保 visible 字段存在
      if (flatList[index].visible === undefined) {
        flatList[index].visible = true
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
      // 模拟所有可用的API权限列表（根据 schema.prisma）
      const allApiPermissions = [
        // 用户相关API
        {
          id: 1,
          path: '/api/user/list',
          method: 'GET',
          matchType: 'exact',
          desc: '获取用户列表',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 2,
          path: '/api/user/:id',
          method: 'GET',
          matchType: 'exact',
          desc: '获取用户详情',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 3,
          path: '/api/user',
          method: 'POST',
          matchType: 'exact',
          desc: '新增用户',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 4,
          path: '/api/user/:id',
          method: 'PUT',
          matchType: 'exact',
          desc: '更新用户',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 5,
          path: '/api/user/:id',
          method: 'DELETE',
          matchType: 'exact',
          desc: '删除用户',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        // 角色相关API
        {
          id: 6,
          path: '/api/role/list',
          method: 'GET',
          matchType: 'exact',
          desc: '获取角色列表',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 7,
          path: '/api/role/:id',
          method: 'GET',
          matchType: 'exact',
          desc: '获取角色详情',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 8,
          path: '/api/role',
          method: 'POST',
          matchType: 'exact',
          desc: '新增角色',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 9,
          path: '/api/role/:id',
          method: 'PUT',
          matchType: 'exact',
          desc: '更新角色',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 10,
          path: '/api/role/:id',
          method: 'DELETE',
          matchType: 'exact',
          desc: '删除角色',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 11,
          path: '/api/role/:id/permissions',
          method: 'GET',
          matchType: 'exact',
          desc: '获取角色权限',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 12,
          path: '/api/role/:id/permissions',
          method: 'POST',
          matchType: 'exact',
          desc: '分配角色权限',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        // 菜单相关API
        {
          id: 13,
          path: '/api/menu/tree',
          method: 'GET',
          matchType: 'exact',
          desc: '获取菜单树',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 14,
          path: '/api/menu/:id',
          method: 'GET',
          matchType: 'exact',
          desc: '获取菜单详情',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 15,
          path: '/api/menu',
          method: 'POST',
          matchType: 'exact',
          desc: '新增菜单',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 16,
          path: '/api/menu/:id',
          method: 'PUT',
          matchType: 'exact',
          desc: '更新菜单',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 17,
          path: '/api/menu/:id',
          method: 'DELETE',
          matchType: 'exact',
          desc: '删除菜单',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 18,
          path: '/api/menu/sort',
          method: 'PUT',
          matchType: 'exact',
          desc: '更新菜单排序',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        // 权限相关API
        {
          id: 19,
          path: '/api/permission/list',
          method: 'GET',
          matchType: 'exact',
          desc: '获取API权限列表',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        // 文件上传相关API
        {
          id: 20,
          path: '/api/file/upload',
          method: 'POST',
          matchType: 'exact',
          desc: '文件上传',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 21,
          path: '/api/file/:id',
          method: 'GET',
          matchType: 'exact',
          desc: '获取文件',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 22,
          path: '/api/file/:id',
          method: 'DELETE',
          matchType: 'exact',
          desc: '删除文件',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        // 认证相关API
        {
          id: 23,
          path: '/api/auth/login',
          method: 'POST',
          matchType: 'exact',
          desc: '用户登录',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 24,
          path: '/api/auth/logout',
          method: 'POST',
          matchType: 'exact',
          desc: '用户登出',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 25,
          path: '/api/auth/userinfo',
          method: 'GET',
          matchType: 'exact',
          desc: '获取用户信息',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        },
        {
          id: 26,
          path: '/api/auth/refresh',
          method: 'POST',
          matchType: 'exact',
          desc: '刷新Token',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        }
      ]

      return {
        message: 'success',
        data: allApiPermissions
      }
    }
  },
  // 根据菜单ID获取按钮权限列表
  {
    url: '/api/permission/button/menu/:menuId',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const menuId = parseInt(query.menuId)
      const buttons = buttonPermissionList.filter((btn) => btn.menuId === menuId)
      // 转换为前端需要的格式（移除 menuId，添加 hidden 字段）
      const result = buttons.map((btn) => ({
        id: btn.id,
        code: btn.code,
        name: btn.name,
        hidden: false // 默认不隐藏
      }))
      return {
        message: 'success',
        data: result
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

      // 根据 ids 过滤返回对应的按钮权限（移除 menuId，添加 hidden 字段）
      const buttonPermissions = buttonPermissionList
        .filter((permission) => ids.includes(permission.id))
        .map((btn) => ({
          id: btn.id,
          code: btn.code,
          name: btn.name,
          hidden: false
        }))

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
      const { menuId, code, name, status } = body

      if (!menuId) {
        return {
          message: '菜单ID不能为空',
          data: null
        }
      }

      // 检查同一菜单下是否已有相同 code 的按钮权限
      const exists = buttonPermissionList.some((btn) => btn.menuId === menuId && btn.code === code)
      if (exists) {
        return {
          message: '该菜单下已存在相同 code 的按钮权限',
          data: null
        }
      }

      // 生成新 ID
      const newId =
        buttonPermissionList.length > 0 ? Math.max(...buttonPermissionList.map((p) => p.id)) + 1 : 1

      const newButtonPermission = {
        id: newId,
        menuId,
        code,
        name,
        status: status ?? 1,
        createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }

      buttonPermissionList.push(newButtonPermission)

      // 返回前端需要的格式（移除 menuId，添加 hidden 字段）
      return {
        message: 'success',
        data: {
          id: newButtonPermission.id,
          code: newButtonPermission.code,
          name: newButtonPermission.name,
          hidden: false
        }
      }
    }
  },
  // 更新按钮权限
  {
    url: '/api/permission/button/:id',
    method: 'put',
    response: ({ query, body }: { query: any; body: any }) => {
      const id = parseInt(query.id)
      const index = buttonPermissionList.findIndex((btn) => btn.id === id)
      if (index === -1) {
        return {
          message: '按钮权限不存在',
          data: null
        }
      }

      const { code, name, status } = body
      const currentBtn = buttonPermissionList[index]

      // 如果修改了 code，检查同一菜单下是否已有相同 code
      if (code && code !== currentBtn.code) {
        const exists = buttonPermissionList.some(
          (btn) => btn.menuId === currentBtn.menuId && btn.code === code && btn.id !== id
        )
        if (exists) {
          return {
            message: '该菜单下已存在相同 code 的按钮权限',
            data: null
          }
        }
      }

      // 更新按钮权限
      buttonPermissionList[index] = {
        ...buttonPermissionList[index],
        code: code || currentBtn.code,
        name: name || currentBtn.name,
        status: status !== undefined ? status : currentBtn.status,
        updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }

      // 返回前端需要的格式
      return {
        message: 'success',
        data: {
          id: buttonPermissionList[index].id,
          code: buttonPermissionList[index].code,
          name: buttonPermissionList[index].name,
          hidden: false
        }
      }
    }
  },
  // 删除按钮权限
  {
    url: '/api/permission/button/:id',
    method: 'delete',
    response: ({ query }: { query: any }) => {
      const id = parseInt(query.id)
      const index = buttonPermissionList.findIndex((btn) => btn.id === id)
      if (index === -1) {
        return {
          message: '按钮权限不存在',
          data: null
        }
      }

      // 删除按钮权限
      buttonPermissionList.splice(index, 1)

      return {
        message: 'success',
        data: true
      }
    }
  }
] as MockMethod[]
