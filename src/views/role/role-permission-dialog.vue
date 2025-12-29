<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
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

// 从 Context 注入菜单树和权限数据
const { menuTree, allButtonPermissions, allApiPermissions } = useInject()

// 权限配置表单
const permissionForm = reactive<RolePermission>({
  menuIds: [],
  buttonPermissionCodes: [],
  apiPermissionCodes: []
})

// 权限配置弹窗分割面板大小
const splitSize = ref(0.4)

// 打开对话框
const open = async (roleId: number) => {
  currentRoleId.value = roleId
  dialogVisible.value = true

  // 加载角色权限
  try {
    const permissions = await getRolePermissions(roleId)
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
const handleSave = async () => {
  try {
    await assignRolePermissions(currentRoleId.value, permissionForm)
    ElMessage.success('权限配置成功')
    dialogVisible.value = false
    emit('success')
  } catch (error: any) {
    ElMessage.error(error.message || '保存权限失败')
  }
}

// 取消
const handleCancel = () => {
  dialogVisible.value = false
}

// 监听对话框关闭，重置表单
watch(dialogVisible, (val) => {
  if (!val) {
    permissionForm.menuIds = []
    permissionForm.buttonPermissionCodes = []
    permissionForm.apiPermissionCodes = []
    currentRoleId.value = 0
  }
})

// 暴露方法给父组件
defineExpose({
  open
})
</script>

<template>
  <el-dialog v-model="dialogVisible" title="权限配置" width="1200px">
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
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave">确定</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
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
</style>

