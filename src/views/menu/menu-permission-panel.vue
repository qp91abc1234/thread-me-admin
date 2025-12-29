<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TransferKey } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { updateMenu } from '@/common/api/menu'
import { useInject } from './menu-context'
import ButtonPermissionDialog from './dialogs/button-permission-dialog.vue'
import type { ButtonPermission } from '@/common/types/permission'

// 按钮权限表格数据
const buttonPermissionTable = ref<ButtonPermission[]>([])
const buttonPermissionDialogRef = ref<InstanceType<typeof ButtonPermissionDialog>>()

// 已选中的API权限code
const selectedApiPermissionCodes = ref<string[]>([])

const { currentNode, allApiPermissions, loadingApiPermissions } = useInject()

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
      // 加载已选中的API权限
      selectedApiPermissionCodes.value = node.apiPermissionCodes || []
    } else {
      buttonPermissionTable.value = []
      selectedApiPermissionCodes.value = []
    }
  },
  { immediate: true }
)

// API权限穿梭框变化处理
const handleApiPermissionChange = async (value: TransferKey[]) => {
  if (!currentNode.value) return

  // 将 TransferKey[] 转换为 string[]
  const codes = value.map((key) => String(key))
  const oldCodes = currentNode.value.apiPermissionCodes || []

  try {
    await updateMenu(currentNode.value.id, {
      apiPermissionCodes: codes
    })
    // 直接更新当前节点的数据
    currentNode.value.apiPermissionCodes = codes
    selectedApiPermissionCodes.value = codes
    ElMessage.success('API权限更新成功')
  } catch (error: any) {
    ElMessage.error(error.message || '更新API权限失败')
    // 恢复原值
    selectedApiPermissionCodes.value = oldCodes
  }
}

// 添加按钮权限
const handleAddButtonPermission = () => {
  buttonPermissionDialogRef.value?.open()
}

// 编辑按钮权限
const handleEditButtonPermission = (row: ButtonPermission) => {
  buttonPermissionDialogRef.value?.open(row)
}

// 删除按钮权限
const handleDeleteButtonPermission = async (row: ButtonPermission) => {
  if (!currentNode.value) return

  const oldCodes = currentNode.value.buttonPermissionCodes || []

  try {
    const newCodes = buttonPermissionTable.value
      .filter((item) => item.code !== row.code)
      .map((item) => item.code)
    await updateMenu(currentNode.value.id, {
      buttonPermissionCodes: newCodes
    })
    // 直接更新当前节点的数据
    currentNode.value.buttonPermissionCodes = newCodes
    buttonPermissionTable.value = buttonPermissionTable.value.filter(
      (item) => item.code !== row.code
    )
    ElMessage.success('按钮权限删除成功')
  } catch (error: any) {
    ElMessage.error(error.message || '删除按钮权限失败')
    // 恢复表格数据
    buttonPermissionTable.value = (oldCodes || []).map((code) => {
      const name = code.split(':')[1] || code
      return {
        code,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        hidden: false
      }
    })
  }
}

// 按钮权限操作成功后的回调
const handleButtonPermissionSuccess = async () => {
  if (!currentNode.value) return

  // 按钮权限弹窗保存时已经更新了服务端数据
  // 从表格数据获取最新的按钮权限 codes（弹窗保存时已经更新了表格数据）
  const newCodes = buttonPermissionTable.value.map((item) => item.code)
  // 直接更新当前节点的数据，保持同步
  currentNode.value.buttonPermissionCodes = newCodes
}
</script>

<template>
  <el-card v-if="currentNode" class="permission-card">
    <template #header>
      <div class="card-header">
        <span>{{ currentNode.title }} - 权限配置</span>
      </div>
    </template>
    <div class="permission-container">
      <!-- 按钮权限 -->
      <div class="permission-section">
        <div class="section-header">
          <span>按钮权限</span>
          <el-button type="primary" :icon="Plus" size="small" @click="handleAddButtonPermission">
            新增
          </el-button>
        </div>
        <div class="section-content section-content-table">
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
        </div>
      </div>

      <!-- API权限 -->
      <div class="permission-section">
        <div class="section-header">
          <span>API权限</span>
        </div>
        <div class="section-content section-content-transfer">
          <el-transfer
            v-model="selectedApiPermissionCodes"
            :data="allApiPermissions"
            :props="{ key: 'code', label: 'name' }"
            :titles="['可选API权限', '已选API权限']"
            :loading="loadingApiPermissions"
            filterable
            filter-placeholder="搜索API权限"
            @change="handleApiPermissionChange"
          >
            <template #default="{ option }">
              <div class="transfer-item">
                <el-tag
                  :type="option.method === 'GET' ? 'success' : 'primary'"
                  size="small"
                  style="margin-right: 8px"
                >
                  {{ option.method }}
                </el-tag>
                <span>{{ option.name }}</span>
              </div>
            </template>
          </el-transfer>
        </div>
      </div>
    </div>
  </el-card>
  <el-empty v-else class="empty-container" description="请选择菜单节点查看权限配置" />

  <!-- 按钮权限表单弹窗 -->
  <ButtonPermissionDialog
    v-if="currentNode"
    ref="buttonPermissionDialogRef"
    :menu-id="currentNode.id"
    :table-data="buttonPermissionTable"
    @success="handleButtonPermissionSuccess"
  />
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
    padding: 20px;
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .permission-container {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 20px;
    min-height: 0;
  }

  .permission-section {
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
    }

    .section-content {
      flex: 1;
      min-height: 0;
      overflow: hidden;

      &.section-content-table {
        display: flex;
        flex-direction: column;
      }

      &.section-content-transfer {
        // stylelint-disable-next-line selector-class-pattern
        :deep(.el-transfer) {
          display: flex;
          flex-direction: row;
          height: 100%;

          // stylelint-disable-next-line selector-class-pattern
          .el-transfer-panel {
            display: flex;
            flex: 1;
            flex-direction: column;
            min-height: 0;

            // stylelint-disable-next-line selector-class-pattern
            .el-transfer-panel__body {
              flex: 1;
              min-height: 0;
              overflow: hidden;
            }
          }
        }
      }
    }
  }
}

.transfer-item {
  display: flex;
  align-items: center;
}

.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
