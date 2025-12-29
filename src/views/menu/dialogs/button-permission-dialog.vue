<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import type { ButtonPermission } from '@/common/types/permission'

const emit = defineEmits<{
  (e: 'success', data: ButtonPermission): void
}>()

const dialogVisible = ref(false)
const dialogTitle = ref('新增按钮权限')
const formRef = ref<FormInstance>()

// 按钮权限表单
const form = reactive<ButtonPermission>({
  code: '',
  name: '',
  hidden: false
})

// 重置表单
const resetForm = (data?: ButtonPermission | null) => {
  if (data) {
    Object.assign(form, data)
  } else {
    Object.assign(form, {
      code: '',
      name: '',
      hidden: false
    })
  }
}

// 打开对话框
const open = (data?: ButtonPermission | null) => {
  if (data) {
    // 编辑模式
    dialogTitle.value = '编辑按钮权限'
    resetForm(data)
  } else {
    // 新增模式
    dialogTitle.value = '新增按钮权限'
    resetForm()
  }
  dialogVisible.value = true
}

// 保存
const handleSave = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid) => {
    if (valid) {
      dialogVisible.value = false
      emit('success', { ...form })
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
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
    <el-form ref="formRef" :model="form" label-width="100px">
      <el-form-item
        label="权限Code"
        prop="code"
        :rules="[{ required: true, message: '请输入权限Code', trigger: 'blur' }]"
      >
        <el-input v-model="form.code" placeholder="如：user:add" />
      </el-form-item>
      <el-form-item
        label="权限名称"
        prop="name"
        :rules="[{ required: true, message: '请输入权限名称', trigger: 'blur' }]"
      >
        <el-input v-model="form.name" placeholder="如：新增用户" />
      </el-form-item>
      <el-form-item label="是否隐藏">
        <el-switch v-model="form.hidden" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave(formRef)">确定</el-button>
    </template>
  </el-dialog>
</template>

