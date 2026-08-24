<template>
  <div class="app" :class="{ 'light-theme': !isDark }">
    <!-- 顶部导航栏 -->
    <header class="top-nav" v-if="showNav">
      <div class="nav-content">
        <!-- Logo -->
        <router-link to="/" class="logo-section">
          <img src="/logo.png" alt="Logo" class="logo-img" />
        </router-link>

        <!-- 导航标签 -->
        <nav class="nav-tabs">
          <router-link
            v-for="tab in navTabs"
            :key="tab.path"
            :to="tab.path"
            class="nav-tab"
            :class="{ active: isActiveTab(tab.path) }"
          >
            {{ tab.name }}
          </router-link>
        </nav>

        <!-- 右侧操作区 -->
        <div class="nav-actions">
          <router-link to="/favorites" class="action-btn" title="收藏">
            <span>⭐</span>
            <span class="btn-text">收藏</span>
          </router-link>
          <router-link v-if="!currentUser" to="/profile" class="action-btn" title="登录">
            <span>👤</span>
            <span class="btn-text">登录/注册</span>
          </router-link>
          <router-link v-else to="/profile" class="action-btn user-btn" :title="currentUser.username">
            <span class="user-avatar">{{ userInitials }}</span>
            <span class="btn-text">{{ currentUser.username }}</span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- 页面内容 -->
    <main class="main-content" :class="{ 'no-nav': !showNav }">
      <router-view />
    </main>

    <!-- 页脚免责 -->
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-disclaimer">
          ⚠️ <strong>免责声明：</strong>本站为个人资源导航分享站点，所有资源均来自互联网公开收集，仅供学习交流与个人研究使用，请勿用于商业用途。资源版权归原作者及发布平台所有，如涉及版权问题请及时联系删除。本站不对任何因使用本站资源造成的任何后果承担责任。联系邮箱：<a href="mailto:ss@nodeloc.cc" class="footer-link">ss@nodeloc.cc</a>
        </div>
        <div class="footer-copy">
          <span>🔗 <a href="https://a777.cc.cd" target="_blank" class="footer-link">友情链接</a></span>
          <span class="footer-sep">|</span>
          <span>Copyright © {{ new Date().getFullYear() }} a520.cc.cd | Powered by 资源分享导航</span>
        </div>
      </div>
    </footer>
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

// 当前登录用户
const currentUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
})

const userInitials = computed(() => {
  return currentUser.value?.username?.substring(0, 2).toUpperCase() || '?'
})

// 导航标签
const navTabs = [
  { name: '主页', path: '/' },
  { name: '软件资源', path: '/category/software' },
  { name: '学习资源', path: '/category/learning' },
  { name: '娱乐影视', path: '/movies' }
]

// 判断当前激活的标签
function isActiveTab(path) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

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
  display: flex;
  flex-direction: column;
  background: #0d1117 url('/bg.jpg') center center / 100% auto no-repeat fixed;
  color: #c9d1d9;
  transition: color 0.3s;
}

/* 背景装饰 */
.app::before {
  content: '';
  position: fixed;
  top: -40%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.app::after {
  content: '';
  position: fixed;
  bottom: -30%;
  left: -15%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.app.light-theme::before,
.app.light-theme::after { display: none; }

.app.light-theme { 
  background: #f8fafc;
}
.app.light-theme::before,
.app.light-theme::after { display: none; }

/* 顶部导航栏 */
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.3s;
}

.light-theme .top-nav {
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-content {
  width: 100%;
  padding: 0 0;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0;
}

/* Logo */
.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-img {
  height: 114px;
  width: auto;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

/* 导航标签 */
.nav-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.nav-tab {
  padding: 8px 20px;
  border-radius: 50px;
  color: #8b949e;
  font-size: 28px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
  line-height: 1;
}

.light-theme .nav-tab {
  color: #6b7280;
}

.nav-tab:hover {
  color: #e6edf3;
  background: rgba(255, 255, 255, 0.06);
}

.light-theme .nav-tab:hover {
  color: #1f2937;
  background: rgba(0, 0, 0, 0.04);
}

.nav-tab.active {
  color: #ffffff;
  background: rgba(59, 130, 246, 0.18);
  font-weight: 600;
}

.light-theme .nav-tab.active {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
}

/* 右侧操作区 */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 50px;
  border: 1px solid transparent;
  background: transparent;
  color: #8b949e;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
}

.light-theme .action-btn {
  color: #6b7280;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #c9d1d9;
  border-color: rgba(255, 255, 255, 0.1);
}

.light-theme .action-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #1f2937;
  border-color: rgba(0, 0, 0, 0.08);
}

.user-btn {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.btn-text { font-size: 14px; }

/* 页脚 */
.site-footer {
  margin-top: auto;
  padding: 24px 20px 20px;
  background: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.light-theme .site-footer {
  background: transparent;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  text-align: center;
}

.footer-disclaimer {
  font-size: 13px;
  line-height: 1.7;
  color: #8b949e;
  max-width: 880px;
}

.footer-disclaimer strong { color: #f59e0b; }

.footer-copy {
  font-size: 13px;
  color: #6e7681;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.footer-sep { color: #484f58; }
.footer-link { color: #58a6ff; text-decoration: none; }
.footer-link:hover { text-decoration: underline; }

/* 主内容区 */
.main-content {
  flex: 1;
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 20px 60px;
}

/* 响应式 */
@media (max-width: 768px) {
  .nav-content {
    padding: 0 12px;
    height: 50px;
    gap: 10px;
  }

  .logo-img { height: 30px; }

  .nav-tabs {
    gap: 2px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    justify-content: flex-start;
    padding: 0 4px;
  }

  .nav-tabs::-webkit-scrollbar { display: none; }

  .nav-tab {
    padding: 6px 12px;
    font-size: 13px;
  }

  .action-btn {
    padding: 6px 10px;
    font-size: 12px;
  }

  .btn-text { font-size: 12px; }

  .main-content { padding: 16px 12px 48px; }
}

@media (max-width: 480px) {
  .btn-text { display: none; }
  .action-btn { padding: 6px; }
  .nav-tab { padding: 6px 10px; font-size: 12px; }
}
</style>
