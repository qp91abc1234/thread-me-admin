<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed, nextTick } from 'vue'
import {
  Fold,
  Moon,
  Sunny,
  Expand,
  ArrowLeft,
  ArrowRight,
  User,
  SwitchButton
} from '@element-plus/icons-vue'

import { useAppStore } from '@/store/modules/app-store'
import { usePermissionStore } from '@/store/modules/permission-store'
import { useUserStore } from '@/store/modules/user-store'

import { setCssVar } from '@/common/utils/css'

import UserInfoDialog from './user-info-dialog.vue'

import type { ElDropdown, ElScrollbar } from 'element-plus'
import type { Tab } from '@/store/modules/hooks/use-tabs'

type RightClickData = {
  clientX: string
  clientY: string
  tab: Tab
}

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()
const userStore = useUserStore()

const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const dropdownRef = ref<InstanceType<typeof ElDropdown>>()
const scrollLeft = ref(0)
const scrollOffset = ref(50)
const rightClickData = ref<RightClickData>({} as RightClickData)
const userInfoDialogRef = ref<InstanceType<typeof UserInfoDialog>>()

const breadcrumbList = computed(() => {
  const pathSegments = route.path.split('/').slice(1)
  let currentPath = ''
  return pathSegments
    .map((segment) => {
      currentPath += `/${segment}`
      return permissionStore.routeMap[currentPath]
    })
    .filter(Boolean)
})

// 用户头像文字（realName 的第一个字符）
const avatarText = computed(() => {
  return userStore.userInfo?.realName?.charAt(0)?.toUpperCase() || 'U'
})

function handleClickDarkSwitch({ clientX, clientY }: PointerEvent) {
  const maxRadius = Math.hypot(
    Math.max(clientX, window.innerWidth - clientX),
    Math.max(clientY, window.innerHeight - clientY)
  )
  setCssVar('--v3-theme-x', `${clientX}px`)
  setCssVar('--v3-theme-y', `${clientY}px`)
  setCssVar('--v3-theme-r', `${maxRadius}px`)

  const handler = () => {
    appStore.themeCfg.darkMode = !appStore.themeCfg.darkMode
  }

  if (document.startViewTransition) {
    document.startViewTransition(handler)
  } else {
    handler()
  }
}

function handleRightClick(tab: Tab, { clientX, clientY }: MouseEvent) {
  rightClickData.value = {
    clientX: `${clientX}px`,
    clientY: `${clientY}px`,
    tab
  }
  nextTick(() => {
    dropdownRef.value?.handleOpen()
  })
}

function handleLogout() {
  userStore.logout()
}

function handleShowUserInfo() {
  userInfoDialogRef.value?.open()
}
</script>

<template>
  <g-flex class="header" dir="column">
    <g-flex justify="space-between" align="center">
      <g-flex align="center">
        <el-icon
          class="cursor-pointer"
          :size="20"
          @click="appStore.siderCollapsed = !appStore.siderCollapsed"
        >
          <Expand v-if="appStore.siderCollapsed" />
          <Fold v-else />
        </el-icon>
        <el-breadcrumb class="ml-10px" :separator-icon="ArrowRight">
          <el-breadcrumb-item
            v-for="item in breadcrumbList"
            :key="item.title + item.jumpPath"
            :to="{ path: item.jumpPath }"
          >
            {{ item.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </g-flex>
      <g-flex align="center" class="header-right">
        <el-switch
          class="dark-switch"
          :model-value="!appStore.themeCfg.darkMode"
          :active-action-icon="Sunny"
          :inactive-action-icon="Moon"
          @click="handleClickDarkSwitch"
        />
        <el-dropdown trigger="hover" placement="bottom-end" class="user-dropdown">
          <g-flex align="center" class="user-info">
            <el-avatar class="user-avatar" :size="32">
              {{ avatarText }}
            </el-avatar>
            <g-flex dir="column" class="user-name">
              <span class="username">{{ userStore.userInfo?.username }}</span>
              <span class="realname">{{ userStore.userInfo?.realName }}</span>
            </g-flex>
          </g-flex>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleShowUserInfo">
                <el-icon class="mr-5px"><User /></el-icon>
                用户信息
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon class="mr-5px"><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </g-flex>
    </g-flex>
    <g-flex class="-my-10px" align="center">
      <permission-button text @click="scrollbarRef?.setScrollLeft(scrollLeft - scrollOffset)">
        <el-icon>
          <ArrowLeft />
        </el-icon>
      </permission-button>
      <el-scrollbar
        ref="scrollbarRef"
        class="mx-5px w-full py-10px h-auto!"
        @scroll="({ scrollLeft: val }) => (scrollLeft = val)"
      >
        <g-flex align="center">
          <el-tag
            v-for="tab in appStore.tabs"
            :key="tab.path"
            class="mr-5px cursor-pointer select-none"
            :effect="tab.path === route.path ? 'dark' : 'light'"
            :color="tab.path === route.path ? '' : 'transparent'"
            closable
            disable-transitions
            @click="appStore.openTab(tab)"
            @close="appStore.closeTab(tab)"
            @click.right.prevent="handleRightClick(tab, $event)"
          >
            {{ tab.title }}
          </el-tag>
        </g-flex>
      </el-scrollbar>
      <permission-button text @click="scrollbarRef?.setScrollLeft(scrollLeft + scrollOffset)">
        <el-icon>
          <ArrowRight />
        </el-icon>
      </permission-button>
    </g-flex>
  </g-flex>
  <el-dropdown
    v-if="rightClickData.clientX"
    ref="dropdownRef"
    class="fixed!"
    :style="{
      left: rightClickData.clientX,
      top: rightClickData.clientY
    }"
    trigger="contextmenu"
  >
    <g-flex></g-flex>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="appStore.closeRightTabs(rightClickData.tab)">
          关闭右侧</el-dropdown-item
        >
        <el-dropdown-item @click="appStore.closeOtherTabs(rightClickData.tab)">
          关闭其他</el-dropdown-item
        >
        <el-dropdown-item @click="appStore.closeAllTabs()">关闭所有</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <UserInfoDialog ref="userInfoDialogRef" />
</template>

<style lang="scss" scoped>
.header {
  padding: 10px;
  border-bottom: 1px solid var(--el-border-color);

  .header-right {
    gap: 15px;

    .user-dropdown {
      cursor: pointer;
      outline: none;
      border: none;

      // stylelint-disable-next-line selector-class-pattern
      :deep(.el-dropdown__caret-button) {
        display: none;
      }

      // stylelint-disable-next-line selector-class-pattern
      :deep(.el-dropdown__trigger) {
        outline: none;
        border: none;
      }
    }

    .user-info {
      gap: 8px;
      padding: 4px 8px;
      outline: none;
      border: none;
      border-radius: 4px;
      transition: background-color 0.3s;

      &:hover {
        background-color: var(--el-bg-color-page);
      }

      &:focus {
        outline: none;
        border: none;
      }

      .user-avatar {
        flex-shrink: 0;
      }

      .user-name {
        font-size: 14px;
        line-height: 1.4;

        .username {
          font-weight: 500;
        }

        .realname {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}
</style>

<style lang="scss">
::view-transition-old(root) {
  mix-blend-mode: normal;
  animation: none;
}

::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: 0.5s ease-in clip-animation;
}

@keyframes clip-animation {
  from {
    clip-path: circle(0 at var(--v3-theme-x) var(--v3-theme-y));
  }

  to {
    clip-path: circle(var(--v3-theme-r) at var(--v3-theme-x) var(--v3-theme-y));
  }
}
</style>
