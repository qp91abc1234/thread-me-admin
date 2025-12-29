<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { updateMenuSort } from '@/common/api/menu'
import { useInject } from './menu-context'
import type { MenuItem } from '@/common/types/permission'

const emit = defineEmits<{
  (e: 'add', parentNode?: MenuItem): void
  (e: 'edit', node: MenuItem): void
  (e: 'delete', node: MenuItem): void
  (e: 'node-click', node: MenuItem): void
}>()

const menuTreeRef = ref()
const { menuTree, loading, setCurrentNode, loadMenuTree } = useInject()

// 菜单树节点点击
const handleNodeClick = (data: MenuItem) => {
  setCurrentNode(data)
  emit('node-click', data)
}

// 菜单树拖拽结束
const handleDragEnd = async (dragNode: any, dropNode: any, dropType: string) => {
  if (dropType === 'none') return

  // 构建排序数据
  const items: Array<{ id: number; parentId?: number; sort: number }> = []

  const traverse = (nodes: MenuItem[], parentId?: number, startSort = 0) => {
    nodes.forEach((node, index) => {
      items.push({
        id: node.id,
        parentId,
        sort: startSort + index
      })
      if (node.children && node.children.length > 0) {
        traverse(node.children, node.id, 0)
      }
    })
  }

  traverse(menuTree.value)

  try {
    await updateMenuSort(items)
    ElMessage.success('排序更新成功')
    await loadMenuTree()
  } catch (error: any) {
    ElMessage.error(error.message || '排序更新失败')
    // 重新加载以恢复原状态
    await loadMenuTree()
  }
}

// 新增菜单
const handleAdd = (parentNode?: MenuItem) => {
  emit('add', parentNode)
}

// 编辑菜单
const handleEdit = (node: MenuItem) => {
  emit('edit', node)
}

// 删除菜单
const handleDelete = async (node: MenuItem) => {
  try {
    await ElMessageBox.confirm('确定要删除该菜单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    emit('delete', node)
  } catch {
    // 用户取消，不做处理
  }
}
</script>

<template>
  <el-card class="tree-card">
    <template #header>
      <div class="card-header">
        <span>菜单树</span>
        <el-button type="primary" :icon="Plus" size="small" @click="handleAdd()">新增</el-button>
      </div>
    </template>
    <el-tree
      v-loading="loading"
      ref="menuTreeRef"
      :data="menuTree"
      :props="{ children: 'children', label: 'title' }"
      node-key="id"
      default-expand-all
      draggable
      :allow-drop="() => true"
      :allow-drag="() => true"
      @node-click="handleNodeClick"
      @node-drop="handleDragEnd"
    >
      <template #default="{ node, data }">
        <div class="tree-node">
          <span>{{ node.label }}</span>
          <span class="node-actions">
            <el-button type="primary" link size="small" :icon="Plus" @click.stop="handleAdd(data)">
              添加
            </el-button>
            <el-button type="primary" link size="small" :icon="Edit" @click.stop="handleEdit(data)">
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              :icon="Delete"
              @click.stop="handleDelete(data)"
            >
              删除
            </el-button>
          </span>
        </div>
      </template>
    </el-tree>
  </el-card>
</template>

<style lang="scss" scoped>
.tree-card {
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
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  // stylelint-disable-next-line selector-class-pattern
  :deep(.el-tree) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .tree-node {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;

    .node-actions {
      display: none;
    }

    &:hover .node-actions {
      display: block;
    }
  }
}
</style>
