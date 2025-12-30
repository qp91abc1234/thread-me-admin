<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { TransferKey } from 'element-plus'
import { ElMessage } from 'element-plus'
import { getRolePermissions, assignRolePermissions } from '@/common/api/role'
import { useInject } from './role-context'
import type { RolePermission } from '@/common/types/role'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const dialogVisible = ref(false)
const menuTreeRef = ref()
const currentRoleId = ref<number>(0)
const activeTab = ref('menu') // 默认显示菜单权限标签页

// 从 Context 注入菜单树和API权限列表
const { menuTree, allApiPermissions, loadingApiPermissions } = useInject()

// 权限配置表单（包含菜单ID和API权限ID）
const permissionForm = reactive<RolePermission>({
  menuIds: [],
  apiPermissionIds: []
})

// 打开对话框
const open = async (roleId: number, defaultTab: 'menu' | 'api' = 'menu') => {
  currentRoleId.value = roleId
  activeTab.value = defaultTab
  dialogVisible.value = true

  // 加载角色权限
  try {
    const permissions = await getRolePermissions(roleId)
    permissionForm.menuIds = permissions.menuIds || []
    permissionForm.apiPermissionIds = permissions.apiPermissionIds || []

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

// API权限穿梭框变化处理
const handleApiPermissionChange = (value: TransferKey[]) => {
  // 将 TransferKey[] 转换为 number[]
  const ids = value.map((key) => Number(key))
  permissionForm.apiPermissionIds = ids
}

// 保存权限配置
const handleSave = async () => {
  try {
    await assignRolePermissions(currentRoleId.value, permissionForm)
    ElMessage.success('权限配置成功')
    handleCancel()
    emit('success')
  } catch (error: any) {
    ElMessage.error(error.message || '保存权限失败')
  }
}

// 取消
const handleCancel = () => {
  dialogVisible.value = false
  permissionForm.menuIds = []
  permissionForm.apiPermissionIds = []
  currentRoleId.value = 0
  activeTab.value = 'menu'
}

// 暴露方法给父组件
defineExpose({
  open
})
</script>

<template>
  <el-dialog v-model="dialogVisible" title="角色权限配置" width="800px">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="菜单权限" name="menu">
        <el-scrollbar class="permission-tree" max-height="500px">
          <el-tree
            ref="menuTreeRef"
            :data="menuTree"
            :props="{ children: 'children', label: 'name' }"
            show-checkbox
            node-key="id"
            default-expand-all
            @check="handleMenuTreeCheck"
          />
        </el-scrollbar>
      </el-tab-pane>
      <el-tab-pane label="API权限" name="api">
        <div class="api-permission-container">
          <el-transfer
            style="max-height: 500px"
            v-model="permissionForm.apiPermissionIds"
            :data="allApiPermissions"
            :props="{ key: 'id', label: 'desc' }"
            :titles="['可选API权限', '已选API权限']"
            :loading="loadingApiPermissions"
            filterable
            filter-placeholder="搜索API权限"
            @change="handleApiPermissionChange"
          >
            <template #default="{ option }">
              <div class="transfer-item">
                <el-tag
                  :type="
                    option.method === 'GET'
                      ? 'success'
                      : option.method === 'POST'
                        ? 'primary'
                        : option.method === 'PUT'
                          ? 'warning'
                          : 'danger'
                  "
                  size="small"
                  style="margin-right: 8px"
                >
                  {{ option.method }}
                </el-tag>
                <span style="margin-right: 8px">{{ option.path }}</span>
                <span style="color: #909399">{{ option.desc }}</span>
              </div>
            </template>
          </el-transfer>
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave">确定</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.permission-tree {
  padding: 20px;
}

.api-permission-container {
  min-height: 500px;
  padding: 20px;

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

.transfer-item {
  display: flex;
  align-items: center;
}
</style>
