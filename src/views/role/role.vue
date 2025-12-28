<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Delete, Edit, Plus, Refresh, Search, Key } from '@element-plus/icons-vue'
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  assignRolePermissions
} from '@/common/api/role'
import { getMenuTree } from '@/common/api/menu'
import type { Role, RoleQueryParams } from '@/common/types/permission'
import type { MenuItem, RolePermission } from '@/common/types/permission'

const loading = ref(false)
const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const roleFormRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive<RoleQueryParams>({
  code: '',
  name: '',
  status: undefined,
  currentPage: 1,
  pageSize: 10
})

// 角色表单
const roleForm = reactive<Partial<Role>>({
  id: 0,
  code: '',
  name: '',
  description: '',
  status: 1
})

// 表格数据
const tableData = ref<Role[]>([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 权限配置相关
const currentRoleId = ref<number>(0)
const menuTree = ref<MenuItem[]>([])
const menuTreeRef = ref()
const permissionForm = reactive<RolePermission>({
  menuIds: [],
  buttonPermissionCodes: [],
  apiPermissionCodes: []
})

// 所有按钮权限和API权限（从菜单树中提取）
const allButtonPermissions = ref<Array<{ code: string; name: string }>>([])
const allApiPermissions = ref<Array<{ code: string; name: string; method: string }>>([])

// 权限配置弹窗分割面板大小
const splitSize = ref(0.4)

// 加载角色列表
const loadRoleList = async () => {
  loading.value = true
  try {
    const params: RoleQueryParams = {
      code: searchForm.code || undefined,
      name: searchForm.name || undefined,
      status: searchForm.status,
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    const res = await getRoleList(params)
    tableData.value = res.list
    pagination.total = res.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载角色列表失败')
  } finally {
    loading.value = false
  }
}

// 加载菜单树
const loadMenuTree = async () => {
  try {
    const res = await getMenuTree()
    menuTree.value = res.tree
    // 提取所有按钮权限和API权限
    extractPermissions(res.tree)
  } catch (error: any) {
    ElMessage.error(error.message || '加载菜单树失败')
  }
}

// 从菜单树中提取所有按钮权限和API权限
const extractPermissions = (menus: MenuItem[]) => {
  const buttonSet = new Set<string>()
  const apiSet = new Set<string>()
  const buttonMap = new Map<string, string>()
  const apiMap = new Map<string, { method: string; name: string }>()

  const traverse = (items: MenuItem[]) => {
    items.forEach((menu) => {
      // 提取按钮权限
      if (menu.buttonPermissionCodes && menu.buttonPermissionCodes.length > 0) {
        menu.buttonPermissionCodes.forEach((code) => {
          if (!buttonSet.has(code)) {
            buttonSet.add(code)
            // 从code中提取name（简化处理，实际应该从后端获取）
            const name = code.split(':')[1] || code
            buttonMap.set(code, name.charAt(0).toUpperCase() + name.slice(1))
          }
        })
      }

      // 提取API权限
      if (menu.apiPermissionCodes && menu.apiPermissionCodes.length > 0) {
        menu.apiPermissionCodes.forEach((code) => {
          if (!apiSet.has(code)) {
            apiSet.add(code)
            // 解析API权限code，格式：METHOD:/api/path
            const parts = code.split(':')
            const method = parts[0] || 'GET'
            const path = parts.slice(1).join(':')
            apiMap.set(code, { method, name: path })
          }
        })
      }

      if (menu.children && menu.children.length > 0) {
        traverse(menu.children)
      }
    })
  }

  traverse(menus)

  allButtonPermissions.value = Array.from(buttonMap.entries()).map(([code, name]) => ({
    code,
    name
  }))

  allApiPermissions.value = Array.from(apiMap.entries()).map(([code, { method, name }]) => ({
    code,
    name,
    method
  }))
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadRoleList()
}

// 重置搜索
const handleReset = () => {
  searchForm.code = ''
  searchForm.name = ''
  searchForm.status = undefined
  handleSearch()
}

// 新增角色
const handleAdd = () => {
  dialogTitle.value = '新增角色'
  dialogVisible.value = true
  resetForm()
}

// 编辑角色
const handleEdit = (row: Role) => {
  dialogTitle.value = '编辑角色'
  dialogVisible.value = true
  Object.assign(roleForm, row)
}

// 删除角色
const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    loadRoleList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 保存角色
const handleSave = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        if (roleForm.id) {
          // 编辑
          await updateRole(roleForm.id, roleForm)
          ElMessage.success('编辑成功')
        } else {
          // 新增
          await createRole(roleForm)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        loadRoleList()
      } catch (error: any) {
        ElMessage.error(error.message || '保存失败')
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  roleForm.id = 0
  roleForm.code = ''
  roleForm.name = ''
  roleForm.description = ''
  roleForm.status = 1
}

// 切换状态
const handleStatusChange = async (row: Role) => {
  try {
    await updateRole(row.id, { status: row.status })
    ElMessage.success(`已${row.status === 1 ? '启用' : '禁用'}该角色`)
  } catch (error: any) {
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error(error.message || '操作失败')
  }
}

// 打开权限配置弹窗
const handlePermissionConfig = async (row: Role) => {
  currentRoleId.value = row.id
  permissionDialogVisible.value = true

  // 加载菜单树（如果还没加载）
  if (menuTree.value.length === 0) {
    await loadMenuTree()
  }

  // 加载角色权限
  try {
    const permissions = await getRolePermissions(row.id)
    permissionForm.menuIds = permissions.menuIds || []
    permissionForm.buttonPermissionCodes = permissions.buttonPermissionCodes || []
    permissionForm.apiPermissionCodes = permissions.apiPermissionCodes || []

    // 设置菜单树选中状态
    if (menuTreeRef.value) {
      menuTreeRef.value.setCheckedKeys(permissionForm.menuIds)
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载权限失败')
  }
}

// 菜单树节点选中变化
const handleMenuTreeCheck = () => {
  const checkedKeys = menuTreeRef.value.getCheckedKeys()
  const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys()
  permissionForm.menuIds = [...checkedKeys, ...halfCheckedKeys]
}

// 保存权限配置
const handleSavePermissions = async () => {
  try {
    await assignRolePermissions(currentRoleId.value, permissionForm)
    ElMessage.success('权限配置成功')
    permissionDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '保存权限失败')
  }
}

// 分页
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.currentPage = 1
  loadRoleList()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  loadRoleList()
}

// 初始化
onMounted(() => {
  loadRoleList()
  loadMenuTree()
})
</script>

<template>
  <div class="role-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="角色编码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入角色编码"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="角色名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入角色名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 200px"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="toolbar-card">
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增角色</el-button>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="code" label="角色编码" min-width="150" show-overflow-tooltip />
        <el-table-column prop="name" label="角色名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link :icon="Key" @click="handlePermissionConfig(row)">
              权限配置
            </el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 角色表单弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="roleFormRef" :model="roleForm" label-width="100px">
        <el-form-item
          label="角色编码"
          prop="code"
          :rules="[{ required: true, message: '请输入角色编码', trigger: 'blur' }]"
        >
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item
          label="角色名称"
          prop="name"
          :rules="[{ required: true, message: '请输入角色名称', trigger: 'blur' }]"
        >
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="roleForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave(roleFormRef)">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限配置弹窗 -->
    <el-dialog v-model="permissionDialogVisible" title="权限配置" width="1200px">
      <el-splitter style="height: 600px">
        <el-splitter-panel :size="splitSize * 100 + '%'">
          <div class="permission-tree">
            <div class="tree-header">菜单权限</div>
            <el-tree
              ref="menuTreeRef"
              :data="menuTree"
              :props="{ children: 'children', label: 'title' }"
              show-checkbox
              node-key="id"
              default-expand-all
              @check="handleMenuTreeCheck"
            />
          </div>
        </el-splitter-panel>
        <el-splitter-panel>
          <div class="permission-list">
            <div class="list-header">按钮权限</div>
            <div class="checkbox-group">
              <el-checkbox-group v-model="permissionForm.buttonPermissionCodes">
                <el-checkbox
                  v-for="perm in allButtonPermissions"
                  :key="perm.code"
                  :label="perm.code"
                  style="display: block; margin-bottom: 10px"
                >
                  {{ perm.name }} ({{ perm.code }})
                </el-checkbox>
              </el-checkbox-group>
            </div>
            <div class="list-header" style="margin-top: 30px">API权限</div>
            <div class="checkbox-group">
              <el-checkbox-group v-model="permissionForm.apiPermissionCodes">
                <el-checkbox
                  v-for="perm in allApiPermissions"
                  :key="perm.code"
                  :label="perm.code"
                  style="display: block; margin-bottom: 10px"
                >
                  [{{ perm.method }}] {{ perm.name }} ({{ perm.code }})
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </el-splitter-panel>
      </el-splitter>

      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermissions">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.role-page {
  padding: 20px;

  .search-card,
  .toolbar-card,
  .table-card {
    margin-bottom: 20px;
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .permission-tree {
    height: 100%;
    padding: 20px;
    overflow-y: auto;

    .tree-header {
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: bold;
    }
  }

  .permission-list {
    height: 100%;
    padding: 20px;
    overflow-y: auto;

    .list-header {
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: bold;
    }

    .checkbox-group {
      max-height: 250px;
      overflow-y: auto;
    }
  }
}
</style>
