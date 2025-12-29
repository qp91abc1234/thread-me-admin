<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { deleteMenu } from '@/common/api/menu'
import MenuTreePanel from './menu-tree-panel.vue'
import MenuPermissionPanel from './menu-permission-panel.vue'
import MenuFormDialog from './dialogs/menu-form-dialog.vue'
import { useProvide } from './menu-context'
import type { MenuItem } from '@/common/types/permission'

const menuFormDialogRef = ref<InstanceType<typeof MenuFormDialog>>()

// 提供菜单树 Context
const { initContext, loadMenuTree, setCurrentNode } = useProvide()

// 分割面板大小
const splitSize = ref(0.3)

// 新增菜单
const handleAdd = (parentNode?: MenuItem) => {
  menuFormDialogRef.value?.open(null, parentNode)
}

// 编辑菜单
const handleEdit = (node: MenuItem) => {
  menuFormDialogRef.value?.open(node)
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
    <MenuFormDialog ref="menuFormDialogRef" @success="loadMenuTree" />
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
