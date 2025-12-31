<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import {
  updateMenu,
  getButtonPermissionsByMenuId,
  deleteButtonPermission
} from '@/common/api/permission'
import { useInject } from './menu-context'
import ButtonPermissionDialog from './dialogs/button-permission-dialog.vue'
import type { ButtonPermission } from '@/common/types/permission'

const { currentNode, setCurrentNode } = useInject()

// 表单引用
const menuFormRef = ref<FormInstance>()

// 菜单表单
const menuForm = reactive({
  id: 0,
  path: '',
  name: '',
  icon: '',
  compPath: '',
  type: 0,
  sort: 0,
  visible: true,
  status: 1
})

// 按钮权限表格数据
const buttonPermissionTable = ref<ButtonPermission[]>([])
const buttonPermissionDialogRef = ref<InstanceType<typeof ButtonPermissionDialog>>()
const loadingButtonPermissions = ref(false)

// 按钮权限搜索
const buttonPermissionSearch = ref('')

// 按钮权限分页
const buttonPermissionPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 过滤后的按钮权限列表（仅过滤，不包含分页）
const filteredButtonPermissionList = computed(() => {
  let filtered = buttonPermissionTable.value

  // 搜索过滤
  if (buttonPermissionSearch.value) {
    const search = buttonPermissionSearch.value.toLowerCase()
    filtered = filtered.filter(
      (item) => item.code.toLowerCase().includes(search) || item.name.toLowerCase().includes(search)
    )
  }

  return filtered
})

// 分页后的按钮权限列表
const filteredButtonPermissionTable = computed(() => {
  const filtered = filteredButtonPermissionList.value

  // 分页
  const start = (buttonPermissionPagination.currentPage - 1) * buttonPermissionPagination.pageSize
  const end = start + buttonPermissionPagination.pageSize
  return filtered.slice(start, end)
})

// 监听过滤结果变化，更新分页总数
watch(
  filteredButtonPermissionList,
  (filtered) => {
    buttonPermissionPagination.total = filtered.length
    buttonPermissionPagination.currentPage = 1
  },
  { immediate: true }
)

// 按钮权限分页变化
const handleButtonPermissionPageChange = (page: number) => {
  buttonPermissionPagination.currentPage = page
}

const handleButtonPermissionSizeChange = (size: number) => {
  buttonPermissionPagination.pageSize = size
  buttonPermissionPagination.currentPage = 1
}

// 监听当前节点变化，加载表单数据和按钮权限
watch(
  () => currentNode.value,
  async (node) => {
    if (!node) return
    // 加载表单数据
    resetForm(node)

    // 加载按钮权限（只有菜单项才有按钮权限）
    if (menuForm.type === 1) {
      await loadButtonPermissions(node.id)
    } else {
      buttonPermissionTable.value = []
    }
    // 重置搜索和分页
    buttonPermissionSearch.value = ''
    buttonPermissionPagination.currentPage = 1
    buttonPermissionPagination.pageSize = 10
  },
  { immediate: true }
)

// 加载按钮权限
const loadButtonPermissions = async (menuId: number) => {
  loadingButtonPermissions.value = true
  try {
    buttonPermissionTable.value = await getButtonPermissionsByMenuId(menuId)
  } catch (error: any) {
    console.error('加载按钮权限失败:', error)
    ElMessage.error(error.message || '加载按钮权限失败')
    buttonPermissionTable.value = []
  } finally {
    loadingButtonPermissions.value = false
  }
}

// 重置表单
const resetForm = (node?) => {
  if (node) {
    Object.assign(menuForm, node)
  } else {
    Object.assign(menuForm, {
      id: 0,
      path: '',
      name: '',
      icon: '',
      compPath: '',
      type: 0,
      sort: 0,
      visible: true,
      status: 1
    })
  }
}

// 保存菜单
const handleSave = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        // 编辑
        const updatedMenu = await updateMenu(menuForm.id, menuForm)
        ElMessage.success('保存成功')
        // 更新当前节点
        setCurrentNode({ ...currentNode.value, ...updatedMenu })
      } catch (error: any) {
        ElMessage.error(error.message || '保存失败')
      }
    }
  })
}

// 添加按钮权限
const handleAddButtonPermission = () => {
  if (!currentNode.value) return
  buttonPermissionDialogRef.value?.open(menuForm.id)
}

// 编辑按钮权限
const handleEditButtonPermission = (row: ButtonPermission) => {
  if (!currentNode.value) return
  buttonPermissionDialogRef.value?.open(menuForm.id, row)
}

// 删除按钮权限
const handleDeleteButtonPermission = async (row: ButtonPermission) => {
  if (!currentNode.value) return

  try {
    await deleteButtonPermission(row.id)
    buttonPermissionTable.value = buttonPermissionTable.value.filter((item) => item.id !== row.id)
    ElMessage.success('按钮权限删除成功')
  } catch (error: any) {
    ElMessage.error(error.message || '删除按钮权限失败')
  }
}
</script>

<template>
  <el-card v-if="currentNode" class="edit-card">
    <template #header>
      <div class="card-header">
        <span>{{ currentNode.name }} - 编辑</span>
      </div>
    </template>
    <div class="edit-container">
      <!-- 上半部分：编辑表单 -->
      <div class="form-section">
        <el-form ref="menuFormRef" :model="menuForm" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item
                label="菜单路径"
                prop="path"
                :rules="[{ required: true, message: '请输入菜单路径', trigger: 'blur' }]"
              >
                <el-input v-model="menuForm.path" placeholder="请输入菜单路径，如：user" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                label="菜单名称"
                prop="name"
                :rules="[{ required: true, message: '请输入菜单名称', trigger: 'blur' }]"
              >
                <el-input v-model="menuForm.name" placeholder="请输入菜单名称" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="图标">
                <el-input v-model="menuForm.icon" placeholder="请输入图标名称，如：User" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="排序">
                <el-input-number v-model="menuForm.sort" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否显示">
                <el-switch
                  v-model="menuForm.visible"
                  :active-value="true"
                  :inactive-value="false"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="状态">
                <el-radio-group v-model="menuForm.status">
                  <el-radio :value="1">启用</el-radio>
                  <el-radio :value="0">禁用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="menuForm.type === 1">
            <el-col :span="24">
              <el-form-item
                label="组件路径"
                prop="compPath"
                :rules="[{ required: true, message: '请输入组件路径', trigger: 'blur' }]"
              >
                <el-input
                  v-model="menuForm.compPath"
                  placeholder="请输入组件路径，如：/src/views/user/user.vue"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button type="primary" @click="handleSave(menuFormRef)">保存</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 分割线 -->
      <div v-if="menuForm.type === 1" class="divider"></div>

      <!-- 下半部分：按钮权限（仅菜单项显示） -->
      <div v-if="menuForm.type === 1" class="button-permission-section">
        <div class="section-header">
          <span>按钮权限</span>
          <div class="header-actions">
            <el-input
              v-model="buttonPermissionSearch"
              placeholder="搜索权限Code或名称"
              clearable
              style="width: 200px; margin-right: 10px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" :icon="Plus" size="small" @click="handleAddButtonPermission">
              新增
            </el-button>
          </div>
        </div>
        <div class="section-content">
          <el-table
            :data="filteredButtonPermissionTable"
            stripe
            border
            :loading="loadingButtonPermissions"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="code" label="权限Code" min-width="150" show-overflow-tooltip />
            <el-table-column prop="name" label="权限名称" min-width="120" show-overflow-tooltip />
            <el-table-column prop="status" label="是否启用" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="handleEditButtonPermission(row)"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="handleDeleteButtonPermission(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination">
            <el-pagination
              v-model:current-page="buttonPermissionPagination.currentPage"
              v-model:page-size="buttonPermissionPagination.pageSize"
              :total="buttonPermissionPagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleButtonPermissionSizeChange"
              @current-change="handleButtonPermissionPageChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 按钮权限表单弹窗 -->
    <ButtonPermissionDialog
      v-if="currentNode"
      ref="buttonPermissionDialogRef"
      @success="loadButtonPermissions(menuForm.id)"
    />
  </el-card>
  <el-empty v-else class="empty-container" description="请选择菜单节点进行编辑" />
</template>

<style lang="scss" scoped>
.edit-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  // stylelint-disable-next-line selector-class-pattern
  :deep(.el-card__body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 20px;
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .edit-container {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 20px;
    min-height: 0;
    overflow: hidden;
  }

  .form-section {
    flex-shrink: 0;
    padding-bottom: 0;
  }

  // 分割线样式参考 splitter（Element Plus splitter 分割线颜色）
  .divider {
    flex-shrink: 0;
    width: 100%;
    height: 1px;
    background-color: var(--el-border-color, #dcdfe6);
  }

  .button-permission-section {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;

    .section-header {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      font-weight: bold;

      .header-actions {
        display: flex;
        align-items: center;
      }
    }

    .section-content {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }

    .pagination {
      display: flex;
      flex-shrink: 0;
      justify-content: flex-end;
      margin-top: 10px;
    }
  }
}

.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
