<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import type { ApiPermission } from '@/common/types/permission'

const emit = defineEmits<{
  (e: 'success', data: ApiPermission): void
}>()

const dialogVisible = ref(false)
const dialogTitle = ref('新增API权限')
const formRef = ref<FormInstance>()

// API权限表单
const form = reactive<ApiPermission>({
  code: '',
  name: '',
  method: 'GET'
})

// 重置表单
const resetForm = (data?: ApiPermission | null) => {
  if (data) {
    Object.assign(form, data)
  } else {
    Object.assign(form, {
      code: '',
      name: '',
      method: 'GET'
    })
  }
}

// 打开对话框
const open = (data?: ApiPermission | null) => {
  if (data) {
    // 编辑模式
    dialogTitle.value = '编辑API权限'
    resetForm(data)
  } else {
    // 新增模式
    dialogTitle.value = '新增API权限'
    resetForm()
  }
  dialogVisible.value = true
}

// 保存
const handleSave = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid) => {
    if (valid) {
      // 构建code：METHOD:/api/path
      const code = `${form.method}:${form.name}`
      dialogVisible.value = false
      emit('success', {
        code,
        name: form.name,
        method: form.method
      })
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
        label="请求方法"
        prop="method"
        :rules="[{ required: true, message: '请选择请求方法', trigger: 'change' }]"
      >
        <el-select v-model="form.method" style="width: 100%">
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
          <el-option label="PUT" value="PUT" />
          <el-option label="DELETE" value="DELETE" />
          <el-option label="PATCH" value="PATCH" />
        </el-select>
      </el-form-item>
      <el-form-item
        label="API路径"
        prop="name"
        :rules="[{ required: true, message: '请输入API路径', trigger: 'blur' }]"
      >
        <el-input v-model="form.name" placeholder="如：/api/user/list" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave(formRef)">确定</el-button>
    </template>
  </el-dialog>
</template>

