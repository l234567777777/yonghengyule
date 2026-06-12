<template>
  <div class="profile-page">
    <!-- 用户信息卡 -->
    <div class="user-card">
      <div class="avatar" :style="{ background: avatarGradient }">
        {{ userInitials }}
      </div>
      <div class="user-info">
        <h2 class="username">{{ user?.username || '未登录' }}</h2>
        <p class="user-desc" v-if="user">欢迎回来</p>
        <p class="user-desc" v-else>登录后同步收藏数据</p>
      </div>
      <button class="login-btn" v-if="!user" @click="goLogin">登录</button>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <router-link to="/favorites" class="menu-item">
        <div class="menu-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706)">
          ⭐
        </div>
        <div class="menu-content">
          <span class="menu-label">我的收藏</span>
          <span class="menu-count">{{ favCount }} 个</span>
        </div>
        <span class="menu-arrow">→</span>
      </router-link>

      <div class="menu-item" @click="clearCache">
        <div class="menu-icon" style="background: linear-gradient(135deg, #6b7280, #4b5563)">
          🗑
        </div>
        <div class="menu-content">
          <span class="menu-label">清除缓存</span>
        </div>
        <span class="menu-arrow">→</span>
      </div>
    </div>

    <!-- 退出登录 -->
    <button class="logout-btn" v-if="user" @click="logout">
      退出登录
    </button>

    <!-- 版本信息 -->
    <div class="app-info">
      <p>资源分享 v1.0.0</p>
      <p class="copyright">© 2026 资源分享</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const user = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
})

const favCount = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('favorites') || '[]').length
  } catch {
    return 0
  }
})

const userInitials = computed(() => {
  return user.value?.username?.substring(0, 2).toUpperCase() || '?'
})

const avatarGradient = computed(() => {
  const colors = [
    'linear-gradient(135deg, #3b82f6, #2563eb)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'linear-gradient(135deg, #f59e0b, #d97706)'
  ]
  const name = user.value?.username || 'guest'
  return colors[name.length % colors.length]
})

function goLogin() {
  router.push('/login')
}

function clearCache() {
  if (confirm('确定清除本地缓存？收藏数据将丢失')) {
    localStorage.removeItem('favorites')
    alert('缓存已清除')
  }
}

function logout() {
  if (confirm('确定退出登录？')) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('favorites')
    router.replace('/login')
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* 用户卡 */
.user-card {
  display: flex;
  align-items: center;
  padding: 28px 24px;
  background: #161b22;
  border-radius: 20px;
  margin-bottom: 16px;
  border: 1px solid #21262d;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  color: white;
  margin-right: 20px;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.user-info {
  flex: 1;
}

.username {
  font-size: 20px;
  font-weight: 600;
  color: #e6edf3;
  margin-bottom: 6px;
}

.user-desc {
  font-size: 14px;
  color: #8b949e;
}

.login-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-btn:hover {
  opacity: 0.9;
}

/* 菜单 */
.menu-section {
  margin-bottom: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #1c2128;
  border-radius: 14px;
  margin-bottom: 12px;
  text-decoration: none;
  color: #e6edf3;
  cursor: pointer;
  transition: background 0.2s;
  border: 1px solid #21262d;
}

.menu-item:hover {
  background: #21262d;
}

.menu-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 14px;
  flex-shrink: 0;
}

.menu-content {
  flex: 1;
}

.menu-label {
  font-size: 16px;
  font-weight: 500;
  display: block;
}

.menu-count {
  font-size: 13px;
  color: #8b949e;
  margin-top: 4px;
  display: block;
}

.menu-arrow {
  color: #6e7681;
  font-size: 16px;
}

/* 退出按钮 */
.logout-btn {
  display: block;
  width: 100%;
  padding: 16px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 14px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 24px;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* 版本信息 */
.app-info {
  text-align: center;
  padding: 40px 20px;
  color: #6e7681;
  font-size: 14px;
}

.copyright {
  margin-top: 8px;
}
</style>