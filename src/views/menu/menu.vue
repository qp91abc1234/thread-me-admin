<script setup lang="ts">
import { ref } from 'vue'
import MenuTreePanel from './menu-tree-panel.vue'
import MenuEditPanel from './menu-edit-panel.vue'
import { useProvide } from './menu-context'

// 提供菜单树 Context
const { initContext } = useProvide()

// 分割面板大小
const splitSize = ref(0.3)

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
        <MenuTreePanel />
      </el-splitter-panel>
      <el-splitter-panel>
        <MenuEditPanel />
      </el-splitter-panel>
    </el-splitter>
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
