<template>
  <div class="profile-page">
    <!-- 用户信息卡 -->
    <div class="user-card">
      <div class="avatar-ring">
        <div class="avatar" :style="{ background: avatarGradient }">
          {{ userInitials }}
        </div>
      </div>
      <div class="user-info">
        <h2 class="username">{{ user?.username || '未登录' }}</h2>
        <p class="user-desc" v-if="user">欢迎回来 👋</p>
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
        <span class="menu-arrow">›</span>
      </router-link>

      <div class="menu-item" @click="clearCache">
        <div class="menu-icon" style="background: linear-gradient(135deg, #6b7280, #4b5563)">
          🗑
        </div>
        <div class="menu-content">
          <span class="menu-label">清除缓存</span>
        </div>
        <span class="menu-arrow">›</span>
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
  if (confirm('确定清除本地缓存？收藏和自定义卡片将恢复为默认')) {
    localStorage.removeItem('favorites')
    localStorage.removeItem('user_custom_cards')
    alert('缓存已清除，刷新后恢复默认卡片')
    location.reload()
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
  max-width: 420px;
  margin: 0 auto;
  padding: 28px 16px 80px;
}

/* 用户卡 */
.user-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: rgba(22, 27, 34, 0.55);
  border-radius: 18px;
  margin-bottom: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.avatar-ring {
  margin-right: 16px;
  flex-shrink: 0;
  padding: 3px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #e6edf3;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-desc {
  font-size: 13px;
  color: #8b949e;
}

.login-btn {
  padding: 9px 20px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.login-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 菜单 */
.menu-section {
  margin-bottom: 14px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: rgba(22, 27, 34, 0.5);
  border-radius: 14px;
  margin-bottom: 10px;
  text-decoration: none;
  color: #e6edf3;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.menu-item:hover {
  background: rgba(30, 36, 48, 0.7);
  border-color: rgba(59, 130, 246, 0.45);
  box-shadow: 0 6px 18px rgba(59, 130, 246, 0.18);
  transform: translateY(-2px);
}

.menu-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 13px;
  flex-shrink: 0;
}

.menu-content {
  flex: 1;
  min-width: 0;
}

.menu-label {
  font-size: 15px;
  font-weight: 500;
  display: block;
}

.menu-count {
  font-size: 12px;
  color: #8b949e;
  margin-top: 2px;
  display: block;
}

.menu-arrow {
  color: #484f58;
  font-size: 20px;
  transition: color 0.2s, transform 0.2s;
}

.menu-item:hover .menu-arrow {
  color: #8b949e;
  transform: translateX(2px);
}

/* 退出按钮 */
.logout-btn {
  display: block;
  width: 100%;
  padding: 14px;
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.18);
  border-radius: 14px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 24px;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(239, 68, 68, 0.32);
}

/* 版本信息 */
.app-info {
  text-align: center;
  padding: 24px 16px;
  color: #484f58;
  font-size: 12px;
}

.copyright {
  margin-top: 4px;
}
</style>