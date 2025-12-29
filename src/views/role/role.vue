<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Refresh, Search, Key } from '@element-plus/icons-vue'
import { getRoleList, deleteRole, updateRole } from '@/common/api/role'
import RoleFormDialog from './role-form-dialog.vue'
import RolePermissionDialog from './role-permission-dialog.vue'
import { useProvide } from './role-context'
import type { Role, RoleQueryParams } from '@/common/types/role'

const loading = ref(false)
const roleFormDialogRef = ref<InstanceType<typeof RoleFormDialog>>()
const rolePermissionDialogRef = ref<InstanceType<typeof RolePermissionDialog>>()

// 提供菜单树 Context
const { initContext } = useProvide()

// 搜索表单
const searchForm = reactive<RoleQueryParams>({
  code: '',
  name: '',
  status: undefined,
  currentPage: 1,
  pageSize: 10
})

// 表格数据
const tableData = ref<Role[]>([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

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
  roleFormDialogRef.value?.open()
}

// 编辑角色
const handleEdit = (row: Role) => {
  roleFormDialogRef.value?.open(row)
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
const handlePermissionConfig = (row: Role) => {
  rolePermissionDialogRef.value?.open(row.id)
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
const init = async () => {
  await initContext()
  loadRoleList()
}

init()
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
              菜单权限
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
    <RoleFormDialog ref="roleFormDialogRef" @success="loadRoleList" />

    <!-- 权限配置弹窗 -->
    <RolePermissionDialog ref="rolePermissionDialogRef" @success="loadRoleList" />
  </div>
</template>

<style lang="scss" scoped>
.role-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  overflow: hidden;

  .search-card,
  .toolbar-card {
    display: block;
    flex-shrink: 0;
    margin-bottom: 20px;
  }

  .table-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    margin-bottom: 0;
    overflow: hidden;

    // stylelint-disable-next-line selector-class-pattern
    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }
  }

  // stylelint-disable-next-line selector-class-pattern
  :deep(.el-table) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  // stylelint-disable-next-line selector-class-pattern
  :deep(.el-table__body-wrapper) {
    max-height: 100%;
    overflow-y: auto;
  }

  .pagination {
    display: flex;
    flex-shrink: 0;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
