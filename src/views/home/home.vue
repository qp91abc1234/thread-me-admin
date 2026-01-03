<script setup lang="ts">
import { formatDateTime } from '@/common/utils'
import { CircleCheck, Moon, Sunny } from '@element-plus/icons-vue'
import { ref, computed } from 'vue'

const currentTime = ref(new Date())

// 更新当前时间
setInterval(() => {
  currentTime.value = new Date()
}, 1000)

// 获取问候语
const greeting = computed(() => {
  const hour = currentTime.value.getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 17) return '下午好'
  if (hour < 19) return '傍晚好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})

// 格式化时间
const formattedTime = computed(() => {
  return formatDateTime(currentTime.value)
})
</script>

<template>
  <div class="home-page">
    <!-- 欢迎卡片 -->
    <el-card class="welcome-card">
      <div class="welcome-content">
        <div class="welcome-text">
          <h2>{{ greeting }}，欢迎回来！</h2>
          <p class="time">{{ formattedTime }}</p>
          <p class="description">这是一个基于 Vue3 + Element Plus + Pinia 的后台管理系统</p>
        </div>
        <div class="welcome-image">
          <el-icon :size="120" color="#409eff">
            <Sunny v-if="greeting.includes('上午')" />
            <Sunny v-else-if="greeting.includes('中午')" />
            <Sunny v-else-if="greeting.includes('下午')" />
            <Moon v-else />
          </el-icon>
        </div>
      </div>
    </el-card>

    <!-- 系统信息 -->
    <div class="info-grid">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>技术栈</span>
          </div>
        </template>
        <div class="tech-stack">
          <div class="tech-section">
            <div class="tech-title">前端</div>
            <div class="tech-tags">
              <el-tag type="primary">Vue 3.5+</el-tag>
              <el-tag type="success">Element Plus 2.9+</el-tag>
              <el-tag type="warning">Pinia 2.3+</el-tag>
              <el-tag type="danger">Vue Router 4.5+</el-tag>
              <el-tag type="info">TypeScript 5.6+</el-tag>
              <el-tag>Vite 6.0+</el-tag>
              <el-tag type="primary">UnoCSS</el-tag>
              <el-tag type="success">Axios</el-tag>
            </div>
          </div>
          <div class="tech-section">
            <div class="tech-title">后端</div>
            <div class="tech-tags">
              <el-tag type="primary">NestJS 10.0+</el-tag>
              <el-tag type="success">Prisma 7.1+</el-tag>
              <el-tag type="warning">TypeScript 5.1+</el-tag>
              <el-tag type="danger">MariaDB</el-tag>
              <el-tag type="info">Redis 4.7+</el-tag>
              <el-tag>JWT</el-tag>
              <el-tag type="primary">Passport</el-tag>
              <el-tag type="success">Swagger</el-tag>
              <el-tag type="warning">Winston</el-tag>
              <el-tag type="danger">bcrypt</el-tag>
              <el-tag type="info">class-validator</el-tag>
              <el-tag>class-transformer</el-tag>
            </div>
          </div>
        </div>
      </el-card>

      <el-card>
        <template #header>
          <div class="card-header">
            <span>功能特性</span>
          </div>
        </template>
        <ul class="feature-list">
          <li>
            <el-icon color="#67c23a"><CircleCheck /></el-icon>
            动态路由和权限管理（菜单权限、按钮权限、API权限）
          </li>
          <li>
            <el-icon color="#67c23a"><CircleCheck /></el-icon> 响应式布局，支持移动端适配
          </li>
          <li>
            <el-icon color="#67c23a"><CircleCheck /></el-icon> 深色/浅色主题切换，支持动画过渡
          </li>
          <li>
            <el-icon color="#67c23a"><CircleCheck /></el-icon> 页面标签导航，支持右键操作
          </li>
          <li>
            <el-icon color="#67c23a"><CircleCheck /></el-icon> JWT 认证，支持 Token 刷新
          </li>
          <li>
            <el-icon color="#67c23a"><CircleCheck /></el-icon> RESTful API 设计，Swagger 文档
          </li>
          <li>
            <el-icon color="#67c23a"><CircleCheck /></el-icon> Prisma ORM，类型安全的数据库操作
          </li>
          <li>
            <el-icon color="#67c23a"><CircleCheck /></el-icon> 请求去重，避免并发重复请求
          </li>
          <li>
            <el-icon color="#67c23a"><CircleCheck /></el-icon> 系统菜单保护，防止误操作
          </li>
          <li>
            <el-icon color="#67c23a"><CircleCheck /></el-icon>
            代码规范检查（ESLint、Prettier、Stylelint）
          </li>
        </ul>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  padding: 20px;

  .welcome-card {
    margin-bottom: 20px;

    .welcome-content {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .welcome-text {
        flex: 1;

        h2 {
          margin: 0 0 12px;
          font-size: 28px;
          color: var(--el-text-color-primary);
        }

        .time {
          margin: 0 0 12px;
          font-size: 16px;
          color: var(--el-text-color-regular);
        }

        .description {
          margin: 0;
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }

      .welcome-image {
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
      }
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;

    .tech-stack {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .tech-section {
        .tech-title {
          margin-bottom: 12px;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
      }
    }

    .feature-list {
      padding: 0;
      margin: 0;
      list-style: none;

      li {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 8px 0;
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
  }
}

@media (width <= 768px) {
  .home-page {
    padding: 12px;

    .welcome-content {
      flex-direction: column;
      text-align: center;

      .welcome-image {
        margin-top: 20px;
      }
    }

    .info-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
