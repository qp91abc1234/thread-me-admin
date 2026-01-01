<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'
import { getUserList, deleteUser, updateUser } from '@/common/api/user'
import UserFormDialog from './user-form-dialog.vue'
import { useProvide } from './user-context'
import type { User, UserQueryParams } from '@/common/types/user'

const loading = ref(false)
const userFormDialogRef = ref<InstanceType<typeof UserFormDialog>>()

// 提供角色列表 Context
const { initContext, roleOptions } = useProvide()

// 搜索表单
const searchForm = reactive<UserQueryParams>({
  username: '',
  status: undefined,
  currentPage: 1,
  pageSize: 10
})

// 表格数据
const tableData = ref<User[]>([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const params: UserQueryParams = {
      username: searchForm.username || undefined,
      status: searchForm.status,
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    const res = await getUserList(params)
    tableData.value = res.list
    pagination.total = res.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadUserList()
}

// 重置搜索
const handleReset = () => {
  searchForm.username = ''
  searchForm.status = undefined
  handleSearch()
}

// 新增用户
const handleAdd = () => {
  userFormDialogRef.value?.open()
}

// 编辑用户
const handleEdit = (row: User) => {
  userFormDialogRef.value?.open(row)
}

// 删除用户
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    loadUserList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 切换状态
const handleStatusChange = async (row: User) => {
  try {
    await updateUser(row.id, { status: row.status })
    ElMessage.success(`已${row.status === 1 ? '启用' : '禁用'}该用户`)
  } catch (error: any) {
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error(error.message || '操作失败')
  }
}

// 分页
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.currentPage = 1
  loadUserList()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  loadUserList()
}

// 初始化
const init = async () => {
  await initContext()
  loadUserList()
}

init()
</script>

<template>
  <div class="user-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
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
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增用户</el-button>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="realName" label="真实姓名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="roleIds" label="角色" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag v-for="roleId in row.roleIds" :key="roleId" style="margin-right: 5px">
              {{ roleOptions.find((r) => r.id === roleId)?.name || '未知角色' }}
            </el-tag>
            <span v-if="!row.roleIds || row.roleIds.length === 0" style="color: #999">未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              :disabled="row.isSystem"
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <template v-if="!row.isSystem">
              <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link :icon="Delete" @click="handleDelete(row)"
                >删除
              </el-button>
            </template>
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

    <!-- 用户表单弹窗 -->
    <UserFormDialog ref="userFormDialogRef" @success="loadUserList" />
  </div>
</template>

<style lang="scss" scoped>
.user-page {
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
