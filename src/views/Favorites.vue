<template>
  <div class="favorites-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>⭐ 我的收藏</h1>
      <span class="header-count">{{ favorites.length }} 个</span>
    </div>

    <!-- 收藏列表 -->
    <div class="resource-list" v-if="favorites.length">
      <ResourceCard
        v-for="resource in favorites"
        :key="resource.id"
        :resource="resource"
        @toggle-fav="removeFav"
      />
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <span class="empty-icon">📭</span>
      <p>暂无收藏</p>
      <p class="empty-tip">浏览资源时点击星标收藏</p>
      <button class="browse-btn" @click="goHome">去浏览</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../utils/api'
import ResourceCard from '../components/ResourceCard.vue'

const router = useRouter()
const favorites = ref([])
const isLoading = ref(false)

async function loadFavorites() {
  isLoading.value = true
  try {
    // 优先从后端拉取
    const res = await api.getFavorites()
    favorites.value = Array.isArray(res) ? res : (res.data || [])
  } catch (e) {
    // 后端失败时回退到本地存储
    const favIds = JSON.parse(localStorage.getItem('favorites') || '[]')
    if (!favIds.length) { favorites.value = []; return }
    try {
      const allResources = await api.getResources()
      const resources = Array.isArray(allResources) ? allResources : (allResources.data || [])
      favorites.value = resources.filter(r => favIds.includes(r.id))
    } catch (e2) {
      console.error('加载收藏失败:', e2)
    }
  } finally {
    isLoading.value = false
  }
}

async function removeFav(id) {
  // 同步到后端
  try { await api.removeFavorite(id) } catch (e) { /* 忽略，保持本地可用 */ }
  // 本地同步
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
  const index = favs.indexOf(id)
  if (index > -1) {
    favs.splice(index, 1)
    localStorage.setItem('favorites', JSON.stringify(favs))
  }
  favorites.value = favorites.value.filter(r => r.id !== id)
}

function goHome() {
  router.push('/')
}

onMounted(loadFavorites)
</script>

<style scoped>
.favorites-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* 页面标题 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 22px;
  color: #e6edf3;
  font-weight: 600;
}

.header-count {
  font-size: 14px;
  color: #8b949e;
}

/* 资源列表 */
.resource-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 100px 20px;
  color: #6e7681;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
}

.empty-tip {
  font-size: 15px;
  margin-top: 10px;
  margin-bottom: 28px;
}

.browse-btn {
  padding: 14px 36px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 28px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.browse-btn:hover {
  opacity: 0.9;
}
</style>