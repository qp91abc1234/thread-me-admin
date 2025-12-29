<script setup lang="ts">
import { ref, reactive } from 'vue'
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

// 从 Context 注入菜单树
const { menuTree } = useInject()

// 权限配置表单（只包含菜单ID）
const permissionForm = reactive<RolePermission>({
  menuIds: []
})

// 打开对话框
const open = async (roleId: number) => {
  currentRoleId.value = roleId
  dialogVisible.value = true

  // 加载角色权限
  try {
    const permissions = await getRolePermissions(roleId)
    permissionForm.menuIds = permissions.menuIds || []

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
  currentRoleId.value = 0
}

// 暴露方法给父组件
defineExpose({
  open
})
</script>

<template>
  <el-dialog v-model="dialogVisible" title="菜单权限" width="600px">
    <el-scrollbar class="permission-tree" max-height="600px">
      <el-tree
        ref="menuTreeRef"
        :data="menuTree"
        :props="{ children: 'children', label: 'title' }"
        show-checkbox
        node-key="id"
        default-expand-all
        @check="handleMenuTreeCheck"
      />
    </el-scrollbar>

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
</style>
