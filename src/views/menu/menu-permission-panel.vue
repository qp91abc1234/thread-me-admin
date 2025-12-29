<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { updateMenu } from '@/common/api/menu'
import { useInject } from './menu-context'
import ButtonPermissionDialog from './button-permission-dialog.vue'
import ApiPermissionDialog from './api-permission-dialog.vue'
import type { ButtonPermission, ApiPermission } from '@/common/types/permission'

// 按钮权限表格数据
const buttonPermissionTable = ref<ButtonPermission[]>([])
const buttonPermissionDialogRef = ref<InstanceType<typeof ButtonPermissionDialog>>()
const editingButtonPermission = ref<ButtonPermission | null>(null)

// API权限表格数据
const apiPermissionTable = ref<ApiPermission[]>([])
const apiPermissionDialogRef = ref<InstanceType<typeof ApiPermissionDialog>>()
const editingApiPermission = ref<ApiPermission | null>(null)

// 菜单表单（用于保存权限）
const menuForm = reactive({
  buttonPermissionCodes: [] as string[],
  apiPermissionCodes: [] as string[]
})

const { currentNode, menuTree, loadMenuTree, setCurrentNode } = useInject()

// 监听当前节点变化，加载权限数据
watch(
  () => currentNode.value,
  (node) => {
    if (node) {
      // 加载按钮权限
      buttonPermissionTable.value = (node.buttonPermissionCodes || []).map((code) => {
        // 从code中提取name（简化处理）
        const name = code.split(':')[1] || code
        return {
          code,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          hidden: false
        }
      })
      // 加载API权限
      apiPermissionTable.value = (node.apiPermissionCodes || []).map((code) => {
        // 解析API权限code
        const parts = code.split(':')
        const method = parts[0] || 'GET'
        const path = parts.slice(1).join(':')
        return {
          code,
          name: path,
          method
        }
      })
      // 更新表单
      updateMenuPermissionCodes()
    } else {
      buttonPermissionTable.value = []
      apiPermissionTable.value = []
      menuForm.buttonPermissionCodes = []
      menuForm.apiPermissionCodes = []
    }
  },
  { immediate: true }
)

// 更新菜单的权限code数组
const updateMenuPermissionCodes = () => {
  menuForm.buttonPermissionCodes = buttonPermissionTable.value.map((item) => item.code)
  menuForm.apiPermissionCodes = apiPermissionTable.value.map((item) => item.code)
}

// 添加按钮权限
const handleAddButtonPermission = () => {
  editingButtonPermission.value = null
  buttonPermissionDialogRef.value?.open()
}

// 编辑按钮权限
const handleEditButtonPermission = (row: ButtonPermission) => {
  editingButtonPermission.value = row
  buttonPermissionDialogRef.value?.open(row)
}

// 删除按钮权限
const handleDeleteButtonPermission = (row: ButtonPermission) => {
  const index = buttonPermissionTable.value.findIndex((item) => item.code === row.code)
  if (index > -1) {
    buttonPermissionTable.value.splice(index, 1)
    updateMenuPermissionCodes()
  }
}

// 保存按钮权限
const handleButtonPermissionSuccess = (data: ButtonPermission) => {
  if (editingButtonPermission.value) {
    // 编辑模式：更新现有项
    const index = buttonPermissionTable.value.findIndex(
      (item) => item.code === editingButtonPermission.value!.code
    )
    if (index > -1) {
      // 如果 code 改变了，检查新 code 是否已存在
      if (data.code !== editingButtonPermission.value.code) {
        const exists = buttonPermissionTable.value.some((item) => item.code === data.code)
        if (exists) {
          ElMessage.warning('按钮权限code已存在')
          return
        }
      }
      buttonPermissionTable.value[index] = { ...data }
    }
    editingButtonPermission.value = null
  } else {
    // 新增模式：检查 code 是否已存在
    const exists = buttonPermissionTable.value.some((item) => item.code === data.code)
    if (exists) {
      ElMessage.warning('按钮权限code已存在')
      return
    }
    buttonPermissionTable.value.push({ ...data })
  }
  updateMenuPermissionCodes()
}

// 添加API权限
const handleAddApiPermission = () => {
  editingApiPermission.value = null
  apiPermissionDialogRef.value?.open()
}

// 编辑API权限
const handleEditApiPermission = (row: ApiPermission) => {
  editingApiPermission.value = row
  apiPermissionDialogRef.value?.open(row)
}

// 删除API权限
const handleDeleteApiPermission = (row: ApiPermission) => {
  const index = apiPermissionTable.value.findIndex((item) => item.code === row.code)
  if (index > -1) {
    apiPermissionTable.value.splice(index, 1)
    updateMenuPermissionCodes()
  }
}

// 保存API权限
const handleApiPermissionSuccess = (data: ApiPermission) => {
  if (editingApiPermission.value) {
    // 编辑模式：更新现有项
    const index = apiPermissionTable.value.findIndex(
      (item) => item.code === editingApiPermission.value!.code
    )
    if (index > -1) {
      // 如果 code 改变了，检查新 code 是否已存在
      if (data.code !== editingApiPermission.value.code) {
        const exists = apiPermissionTable.value.some((item) => item.code === data.code)
        if (exists) {
          ElMessage.warning('API权限code已存在')
          return
        }
      }
      apiPermissionTable.value[index] = { ...data }
    }
    editingApiPermission.value = null
  } else {
    // 新增模式：检查 code 是否已存在
    const exists = apiPermissionTable.value.some((item) => item.code === data.code)
    if (exists) {
      ElMessage.warning('API权限code已存在')
      return
    }
    apiPermissionTable.value.push({ ...data })
  }
  updateMenuPermissionCodes()
}

// 保存菜单权限（更新当前选中菜单的权限）
const handleSaveMenuPermissions = async () => {
  if (!currentNode.value) {
    ElMessage.warning('请先选择菜单')
    return
  }

  updateMenuPermissionCodes()

  try {
    await updateMenu(currentNode.value.id, {
      buttonPermissionCodes: menuForm.buttonPermissionCodes,
      apiPermissionCodes: menuForm.apiPermissionCodes
    })
    ElMessage.success('权限保存成功')
    await loadMenuTree()
    // 重新选中节点以刷新权限列表
    if (currentNode.value) {
      const findNodeById = (nodes: any[], id: number): any => {
        for (const node of nodes) {
          if (node.id === id) return node
          if (node.children) {
            const found = findNodeById(node.children, id)
            if (found) return found
          }
        }
        return null
      }
      const node = findNodeById(menuTree.value, currentNode.value.id)
      if (node) {
        setCurrentNode(node)
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || '保存权限失败')
  }
}
</script>

<template>
  <el-card v-if="currentNode" class="permission-card">
    <template #header>
      <div class="card-header">
        <span>{{ currentNode.title }} - 权限配置</span>
        <el-button type="primary" size="small" @click="handleSaveMenuPermissions"
          >保存权限</el-button
        >
      </div>
    </template>
    <el-scrollbar>
      <!-- 按钮权限 -->
      <div class="permission-section">
        <div class="section-header">
          <span>按钮权限</span>
          <el-button type="primary" :icon="Plus" size="small" @click="handleAddButtonPermission">
            新增
          </el-button>
        </div>
        <el-table :data="buttonPermissionTable" stripe border>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="code" label="权限Code" min-width="150" show-overflow-tooltip />
          <el-table-column prop="name" label="权限名称" min-width="120" show-overflow-tooltip />
          <el-table-column prop="hidden" label="是否隐藏" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.hidden ? 'danger' : 'success'">
                {{ row.hidden ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEditButtonPermission(row)">
                编辑
              </el-button>
              <el-button type="danger" link size="small" @click="handleDeleteButtonPermission(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- API权限 -->
      <div class="permission-section" style="margin-top: 30px">
        <div class="section-header">
          <span>API权限</span>
          <el-button type="primary" :icon="Plus" size="small" @click="handleAddApiPermission">
            新增
          </el-button>
        </div>
        <el-table :data="apiPermissionTable" stripe border>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="method" label="请求方法" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.method === 'GET' ? 'success' : 'primary'">
                {{ row.method }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="API路径" min-width="200" show-overflow-tooltip />
          <el-table-column prop="code" label="权限Code" min-width="200" show-overflow-tooltip />
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEditApiPermission(row)">
                编辑
              </el-button>
              <el-button type="danger" link size="small" @click="handleDeleteApiPermission(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-scrollbar>
  </el-card>
  <el-empty v-else class="empty-container" description="请选择菜单节点查看权限配置" />

  <!-- 按钮权限表单弹窗 -->
  <ButtonPermissionDialog
    ref="buttonPermissionDialogRef"
    @success="handleButtonPermissionSuccess"
  />

  <!-- API权限表单弹窗 -->
  <ApiPermissionDialog ref="apiPermissionDialogRef" @success="handleApiPermissionSuccess" />
</template>

<style lang="scss" scoped>
.permission-card {
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
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  // stylelint-disable-next-line selector-class-pattern
  :deep(.el-scrollbar) {
    flex: 1;
    min-height: 0;
  }

  .permission-section {
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      font-weight: bold;
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
