<script setup lang="ts">
import { ref, reactive } from 'vue'
import { type FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { ButtonPermission, MenuItem } from '@/common/types/permission'
import { updateMenu, createButtonPermission, updateButtonPermission } from '@/common/api/menu'

const props = defineProps<{
  menuId: number
  tableData: ButtonPermission[]
}>()

const dialogVisible = ref(false)
const dialogTitle = ref('新增按钮权限')
const formRef = ref<FormInstance>()
const editingItem = ref<ButtonPermission | null>(null)
const loading = ref(false)

// 用于更新父组件数据的引用
let buttonPermissionTableRef: { value: ButtonPermission[] } | null = null
let currentNodeRef: { value: MenuItem | null } | null = null

// 按钮权限表单
const form = reactive<ButtonPermission>({
  id: 0,
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
      id: 0,
      code: '',
      name: '',
      hidden: false
    })
  }
}

// 打开对话框
const open = (
  data?: ButtonPermission | null,
  buttonPermissionTable?: { value: ButtonPermission[] },
  currentNode?: { value: MenuItem | null }
) => {
  editingItem.value = data || null
  buttonPermissionTableRef = buttonPermissionTable || null
  currentNodeRef = currentNode || null

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

  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        let savedButtonPermission: ButtonPermission

        // 第一步：创建或更新按钮权限实体
        if (editingItem.value) {
          // 编辑模式：更新按钮权限实体（ID 不变，菜单关联关系不变）
          savedButtonPermission = await updateButtonPermission(editingItem.value.id, {
            code: form.code,
            name: form.name,
            hidden: form.hidden
          })
        } else {
          // 新增模式：创建按钮权限实体
          savedButtonPermission = await createButtonPermission({
            code: form.code,
            name: form.name,
            hidden: form.hidden
          })
        }

        // 第二步：更新菜单的按钮权限关联关系（仅新增模式需要）
        if (editingItem.value) {
          // 编辑模式：直接更新表格中对应项的数据，无需重新请求
          if (buttonPermissionTableRef) {
            const index = buttonPermissionTableRef.value.findIndex(
              (item) => item.id === savedButtonPermission.id
            )
            if (index > -1) {
              buttonPermissionTableRef.value[index] = savedButtonPermission
            }
          }
        } else {
          // 新增模式：将新创建的按钮权限 ID 添加到菜单关联中
          const currentIds = props.tableData.map((item) => item.id)
          const newIds = [...currentIds, savedButtonPermission.id]

          await updateMenu(props.menuId, {
            buttonPermissionIds: newIds
          })

          // 直接将新创建的按钮权限添加到列表中，无需重新请求
          if (buttonPermissionTableRef) {
            buttonPermissionTableRef.value = [...props.tableData, savedButtonPermission]
          }
          if (currentNodeRef?.value) {
            currentNodeRef.value.buttonPermissionIds = newIds
          }
        }

        ElMessage.success(editingItem.value ? '按钮权限更新成功' : '按钮权限添加成功')
        dialogVisible.value = false
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        loading.value = false
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
      <el-button type="primary" :loading="loading" @click="handleSave(formRef)">确定</el-button>
    </template>
  </el-dialog>
</template>
