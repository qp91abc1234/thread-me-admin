<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Delete, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'
import { getUserList, createUser, updateUser, deleteUser } from '@/common/api/user'
import { getRoleList } from '@/common/api/role'
import type { User, UserQueryParams } from '@/common/types/permission'
import type { Role } from '@/common/types/permission'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const userFormRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive<UserQueryParams>({
  username: '',
  status: undefined,
  currentPage: 1,
  pageSize: 10
})

// 用户表单
const userForm = reactive<Partial<User> & { password: string }>({
  id: 0,
  username: '',
  realName: '',
  email: '',
  phone: '',
  roleIds: [],
  status: 1,
  password: ''
})

// 表格数据
const tableData = ref<User[]>([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 角色列表（用于下拉选择）
const roleOptions = ref<Role[]>([])

// 加载角色列表
const loadRoleOptions = async () => {
  try {
    const res = await getRoleList({
      currentPage: 1,
      pageSize: 1000
    })
    roleOptions.value = res.list
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

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
  dialogTitle.value = '新增用户'
  dialogVisible.value = true
  resetForm()
}

// 编辑用户
const handleEdit = (row: User) => {
  dialogTitle.value = '编辑用户'
  dialogVisible.value = true
  Object.assign(userForm, {
    ...row,
    password: '' // 编辑时不显示密码
  })
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

// 保存用户
const handleSave = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        if (userForm.id) {
          // 编辑
          await updateUser(userForm.id, userForm)
          ElMessage.success('编辑成功')
        } else {
          // 新增
          if (!userForm.password) {
            ElMessage.warning('请输入密码')
            return
          }
          await createUser(userForm)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        loadUserList()
      } catch (error: any) {
        ElMessage.error(error.message || '保存失败')
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  userForm.id = 0
  userForm.username = ''
  userForm.realName = ''
  userForm.email = ''
  userForm.phone = ''
  userForm.roleIds = []
  userForm.status = 1
  userForm.password = ''
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
onMounted(() => {
  loadRoleOptions()
  loadUserList()
})
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
            <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">编辑</el-button>
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

    <!-- 用户表单弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="userFormRef" :model="userForm" label-width="100px">
        <el-form-item
          label="用户名"
          prop="username"
          :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]"
        >
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item
          v-if="!userForm.id"
          label="密码"
          prop="password"
          :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]"
        >
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item
          label="真实姓名"
          prop="realName"
          :rules="[{ required: true, message: '请输入真实姓名', trigger: 'blur' }]"
        >
          <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item
          label="邮箱"
          prop="email"
          :rules="[
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
          ]"
        >
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item
          label="手机号"
          prop="phone"
          :rules="[
            { required: true, message: '请输入手机号', trigger: 'blur' },
            {
              pattern: /^1[3-9]\d{9}$/,
              message: '请输入正确的手机号',
              trigger: 'blur'
            }
          ]"
        >
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select
            v-model="userForm.roleIds"
            multiple
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave(userFormRef)">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.user-page {
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
}
</style>
