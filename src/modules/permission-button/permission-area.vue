<template>
  <!-- reserveSpace 为 true：占据空间，通过 visibility 控制显示 -->
  <!-- display: contents 让 span 不占据空间，子元素会显示并继承父元素的样式 -->
  <span
    v-if="reserveSpace"
    :style="{
      display: 'contents',
      visibility: hasAccess ? 'visible' : 'hidden'
    }"
  >
    <slot />
  </span>
  <!-- reserveSpace 为 false：不占据空间，有权限才显示 -->
  <slot v-else-if="hasAccess" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useButtonPermission } from './use-button-permission'

interface Props {
  /**
   * 权限 code
   * 可以是单个 code 或 code 数组
   */
  code?: string | string[]
  /**
   * 权限匹配模式
   * - 'any': 有任意一个权限即可显示（默认）
   * - 'all': 必须有所有权限才显示
   */
  mode?: 'any' | 'all'
  /**
   * 是否在无权限时占据空间
   * - false: 不显示且不占据空间（默认，使用 v-if）
   * - true: 不显示但占据空间（使用 visibility: hidden）
   */
  reserveSpace?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'any',
  reserveSpace: false
})

const { hasPermission, hasAnyPermission, hasAllPermissions } = useButtonPermission()

const hasAccess = computed(() => {
  if (!props.code) {
    return true
  }

  if (typeof props.code === 'string') {
    return hasPermission(props.code)
  }

  if (props.mode === 'all') {
    return hasAllPermissions(props.code)
  }

  return hasAnyPermission(props.code)
})
</script>
