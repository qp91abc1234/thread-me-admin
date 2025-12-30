<script setup lang="ts">
import { zhCn } from 'element-plus/es/locales.mjs'
</script>

<template>
  <el-config-provider :locale="zhCn">
    <RouterView></RouterView>
  </el-config-provider>
</template>

<style lang="scss">
#app {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: var(--el-bg-color);
}

::-webkit-scrollbar {
  display: none;
}
</style>
