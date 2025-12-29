<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { createMenu, updateMenu, deleteMenu } from '@/common/api/menu'
import MenuTreePanel from './menu-tree-panel.vue'
import MenuPermissionPanel from './menu-permission-panel.vue'
import { useProvide } from './menu-context'
import type { MenuItem } from '@/common/types/permission'

const dialogVisible = ref(false)
const dialogTitle = ref('新增菜单')
const menuFormRef = ref<FormInstance>()

// 提供菜单树 Context
const { initContext, loadMenuTree, setCurrentNode } = useProvide()

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

// 分割面板大小
const splitSize = ref(0.4)

// 新增菜单
const handleAdd = (parentNode?: MenuItem) => {
  dialogTitle.value = '新增菜单'
  dialogVisible.value = true
  resetForm()
  if (parentNode) {
    menuForm.parentId = parentNode.id
  }
}

// 编辑菜单
const handleEdit = (node: MenuItem) => {
  dialogTitle.value = '编辑菜单'
  dialogVisible.value = true
  Object.assign(menuForm, {
    ...node,
    buttonPermissionCodes: node.buttonPermissionCodes || [],
    apiPermissionCodes: node.apiPermissionCodes || []
  })
}

// 删除菜单
const handleDelete = async (node: MenuItem) => {
  try {
    await deleteMenu(node.id)
    ElMessage.success('删除成功')
    setCurrentNode(null)
    await loadMenuTree()
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败')
  }
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
        await loadMenuTree()
      } catch (error: any) {
        ElMessage.error(error.message || '保存失败')
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  menuForm.id = 0
  menuForm.path = ''
  menuForm.title = ''
  menuForm.icon = ''
  menuForm.compPath = ''
  menuForm.parentId = undefined
  menuForm.sort = 0
  menuForm.status = 1
}

// 初始化
const init = async () => {
  await initContext()
}

init()
</script>

<template>
  <div class="menu-page">
    <el-splitter class="menu-splitter">
      <el-splitter-panel :size="splitSize * 100 + '%'">
        <MenuTreePanel
          @add="handleAdd"
          @edit="handleEdit"
          @delete="handleDelete"
          @node-click="() => {}"
        />
      </el-splitter-panel>
      <el-splitter-panel>
        <MenuPermissionPanel />
      </el-splitter-panel>
    </el-splitter>

    <!-- 菜单表单弹窗 -->
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
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave(menuFormRef)">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.menu-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  overflow: hidden;

  .menu-splitter {
    flex: 1;
    min-height: 0;
    overflow: hidden;

    // stylelint-disable-next-line selector-class-pattern
    :deep(.el-splitter-panel) {
      overflow: hidden;
    }
  }
}
</style>
