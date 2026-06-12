<template>
  <div class="app" :class="{ 'light-theme': !isDark }">
    <!-- 顶部导航栏 -->
    <header class="top-nav" v-if="showNav">
      <div class="nav-content">
        <!-- Logo -->
        <router-link to="/" class="logo-section">
          <img src="/logo.png" alt="Logo" class="logo-img" />
        </router-link>

        <!-- 右侧操作区 -->
        <div class="nav-actions">
          <router-link to="/favorites" class="action-btn" title="收藏">
            <span>⭐</span>
            <span class="btn-text">收藏</span>
          </router-link>
          <router-link to="/profile" class="action-btn" title="我的">
            <span>👤</span>
            <span class="btn-text">登录/注册</span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- 页面内容 -->
    <main class="main-content" :class="{ 'no-nav': !showNav }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const showNav = computed(() => {
  return route.path !== '/login'
})

// 主题切换
const isDark = ref(true)

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.remove('light-theme')
    document.body.style.background = '#0d1117'
    document.body.style.color = '#c9d1d9'
  } else {
    document.documentElement.classList.add('light-theme')
    document.body.style.background = '#ffffff'
    document.body.style.color = '#1a1a1a'
  }
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'light') {
    isDark.value = false
    document.documentElement.classList.add('light-theme')
    document.body.style.background = '#ffffff'
    document.body.style.color = '#1a1a1a'
  }
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #0d1117;
  color: #c9d1d9;
  transition: background 0.3s, color 0.3s;
}

.app.light-theme {
  background: #ffffff;
  color: #1a1a1a;
}

/* 顶部导航栏 */
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(13, 17, 23, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #21262d;
  transition: background 0.3s, border-color 0.3s;
}

.light-theme .top-nav {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e5e5e5;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.logo-img {
  height: 160px;
  width: auto;
  object-fit: contain;
  display: block;
}

.logo-section {
  margin-left: -140px;
}

/* 右侧操作区 */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #8b949e;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
}

.light-theme .action-btn {
  color: #666;
}

.action-btn:hover {
  background: #1c2128;
  color: #c9d1d9;
}

.light-theme .action-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.btn-text {
  font-size: 14px;
}

/* 主内容区 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .nav-content {
    padding: 0 12px;
    height: 48px;
  }

  .logo-icon {
    font-size: 24px;
  }

  .logo-text {
    font-size: 16px;
  }

  .action-btn {
    padding: 6px 10px;
    font-size: 12px;
  }

  .btn-text {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .btn-text {
    display: none;
  }

  .action-btn {
    padding: 6px;
  }
}
</style>
