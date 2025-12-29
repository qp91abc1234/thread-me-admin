<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { createMenu, updateMenu } from '@/common/api/menu'
import type { MenuItem } from '@/common/types/permission'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const dialogVisible = ref(false)
const dialogTitle = ref('新增菜单')
const menuFormRef = ref<FormInstance>()

// 菜单表单
const menuForm = reactive<Partial<MenuItem>>({
  id: 0,
  path: '',
  title: '',
  icon: '',
  compPath: '',
  parentId: undefined,
  sort: 0,
  status: 1
})

// 重置表单
const resetForm = (menu?: MenuItem | null) => {
  if (menu) {
    Object.assign(menuForm, {
      ...menu,
      buttonPermissionCodes: menu.buttonPermissionCodes || [],
      apiPermissionCodes: menu.apiPermissionCodes || []
    })
  } else {
    Object.assign(menuForm, {
      id: 0,
      path: '',
      title: '',
      icon: '',
      compPath: '',
      parentId: undefined,
      sort: 0,
      status: 1
    })
  }
}

// 打开对话框
const open = (menu?: MenuItem | null, parentNode?: MenuItem | null) => {
  if (menu) {
    // 编辑模式
    dialogTitle.value = '编辑菜单'
    resetForm(menu)
  } else {
    // 新增模式
    dialogTitle.value = '新增菜单'
    resetForm()
    if (parentNode) {
      menuForm.parentId = parentNode.id
    }
  }
  dialogVisible.value = true
}

// 保存菜单
const handleSave = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        if (menuForm.id) {
          // 编辑
          await updateMenu(menuForm.id, menuForm)
          ElMessage.success('编辑成功')
        } else {
          // 新增
          await createMenu(menuForm)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        emit('success')
      } catch (error: any) {
        ElMessage.error(error.message || '保存失败')
      }
    }
  })
}

// 取消
const handleCancel = () => {
  dialogVisible.value = false
}

// 暴露方法给父组件
defineExpose({
  open
})
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
    <el-form ref="menuFormRef" :model="menuForm" label-width="100px">
      <el-form-item
        label="菜单路径"
        prop="path"
        :rules="[{ required: true, message: '请输入菜单路径', trigger: 'blur' }]"
      >
        <el-input v-model="menuForm.path" placeholder="请输入菜单路径，如：user" />
      </el-form-item>
      <el-form-item
        label="菜单名称"
        prop="title"
        :rules="[{ required: true, message: '请输入菜单名称', trigger: 'blur' }]"
      >
        <el-input v-model="menuForm.title" placeholder="请输入菜单名称" />
      </el-form-item>
      <el-form-item label="图标">
        <el-input v-model="menuForm.icon" placeholder="请输入图标名称，如：User" />
      </el-form-item>
      <el-form-item label="组件路径">
        <el-input
          v-model="menuForm.compPath"
          placeholder="请输入组件路径，如：/src/views/user/user.vue"
        />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="menuForm.sort" :min="0" style="width: 100%" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="menuForm.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave(menuFormRef)">确定</el-button>
    </template>
  </el-dialog>
</template>
