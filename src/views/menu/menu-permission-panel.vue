<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { TransferKey } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { updateMenu, getButtonPermissionsByIds, deleteButtonPermission } from '@/common/api/menu'
import { useInject } from './menu-context'
import ButtonPermissionDialog from './dialogs/button-permission-dialog.vue'
import type { ButtonPermission } from '@/common/types/permission'

// 按钮权限表格数据
const buttonPermissionTable = ref<ButtonPermission[]>([])
const buttonPermissionDialogRef = ref<InstanceType<typeof ButtonPermissionDialog>>()
// 加载按钮权限状态
const loadingButtonPermissions = ref(false)

// 缓存的原始API权限id（按node id存储，用于对比是否有修改）
const cachedApiPermissionIdsMap = ref<Map<number, number[]>>(new Map())
// 保存按钮加载状态
const savingApiPermissions = ref(false)

const { currentNode, allApiPermissions, loadingApiPermissions } = useInject()

// 已选中的API权限id（直接操作缓存）
const selectedApiPermissionIds = computed({
  get: () => {
    if (!currentNode.value) return []
    return cachedApiPermissionIdsMap.value.get(currentNode.value.id) || []
  },
  set: (value: number[]) => {
    if (!currentNode.value) return
    cachedApiPermissionIdsMap.value.set(currentNode.value.id, [...value])
  }
})

// 判断API权限是否有修改（对比当前缓存值与节点原始值）
const hasApiPermissionChanges = computed(() => {
  if (!currentNode.value) return false
  const current = [...selectedApiPermissionIds.value].sort().join(',')
  const original = [...(currentNode.value.apiPermissionIds || [])].sort().join(',')
  return current !== original
})

// 监听当前节点变化，加载权限数据
watch(
  () => currentNode.value,
  async (node) => {
    if (node) {
      // 根据 buttonPermissionIds 加载对应的按钮权限
      const buttonIds = node.buttonPermissionIds || []
      if (buttonIds.length > 0) {
        loadingButtonPermissions.value = true
        try {
          buttonPermissionTable.value = await getButtonPermissionsByIds(buttonIds)
        } catch (error: any) {
          console.error('加载按钮权限失败:', error)
          ElMessage.error(error.message || '加载按钮权限失败')
          buttonPermissionTable.value = []
        } finally {
          loadingButtonPermissions.value = false
        }
      } else {
        buttonPermissionTable.value = []
      }

      // 加载已选中的API权限
      const apiIds = node.apiPermissionIds || []
      // 如果缓存中已有该节点的数据，保持不变；否则使用节点数据并缓存
      if (!cachedApiPermissionIdsMap.value.has(node.id)) {
        // 首次加载，使用节点数据并缓存
        cachedApiPermissionIdsMap.value.set(node.id, [...apiIds])
      }
    } else {
      buttonPermissionTable.value = []
    }
  },
  { immediate: true }
)

// API权限穿梭框变化处理（只更新缓存，不提交）
const handleApiPermissionChange = (value: TransferKey[]) => {
  // 将 TransferKey[] 转换为 number[]
  const ids = value.map((key) => Number(key))
  selectedApiPermissionIds.value = ids
}

// 保存API权限
const handleSaveApiPermissions = async () => {
  if (!currentNode.value) return

  savingApiPermissions.value = true
  try {
    const ids = [...selectedApiPermissionIds.value]
    await updateMenu(currentNode.value.id, {
      apiPermissionIds: ids
    })
    // 更新当前节点的数据
    currentNode.value.apiPermissionIds = ids
    // 更新缓存
    cachedApiPermissionIdsMap.value.set(currentNode.value.id, [...ids])
    ElMessage.success('API权限保存成功')
  } catch (error: any) {
    ElMessage.error(error.message || '保存API权限失败')
  } finally {
    savingApiPermissions.value = false
  }
}

// 添加按钮权限
const handleAddButtonPermission = () => {
  buttonPermissionDialogRef.value?.open(null, buttonPermissionTable, currentNode)
}

// 编辑按钮权限
const handleEditButtonPermission = (row: ButtonPermission) => {
  buttonPermissionDialogRef.value?.open(row, buttonPermissionTable, currentNode)
}

// 删除按钮权限
const handleDeleteButtonPermission = async (row: ButtonPermission) => {
  if (!currentNode.value) return

  try {
    // 调用删除按钮权限的 API（Prisma 会自动处理关联关系）
    await deleteButtonPermission(row.id)

    // 删除成功后，直接从表格中移除该项
    buttonPermissionTable.value = buttonPermissionTable.value.filter((item) => item.id !== row.id)

    // 更新当前节点的 buttonPermissionIds
    const buttonIds = currentNode.value.buttonPermissionIds || []
    currentNode.value.buttonPermissionIds = buttonIds.filter((id) => id !== row.id)

    ElMessage.success('按钮权限删除成功')
  } catch (error: any) {
    ElMessage.error(error.message || '删除按钮权限失败')
  }
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
          <el-table :data="buttonPermissionTable" stripe border :loading="loadingButtonPermissions">
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
          <el-button
            v-if="hasApiPermissionChanges"
            type="primary"
            size="small"
            :loading="savingApiPermissions"
            @click="handleSaveApiPermissions"
          >
            保存
          </el-button>
        </div>
        <div class="section-content section-content-transfer">
          <el-transfer
            v-model="selectedApiPermissionIds"
            :data="allApiPermissions"
            :props="{ key: 'id', label: 'name' }"
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
