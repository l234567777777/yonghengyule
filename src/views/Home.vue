<template>
  <div class="home">
    <!-- 搜索栏 -->
    <div class="search-bar" @click="goSearch">
      <span class="search-icon">🔍</span>
      <span class="search-placeholder">搜索资源名称...</span>
    </div>

    <!-- 分类标签 -->
    <div class="category-section">
      <div class="section-header">
        <h2>资源分类</h2>
        <span class="more" @click="goCategory">更多 →</span>
      </div>
      <div class="category-grid">
        <div
          v-for="cat in categories"
          :key="cat.value"
          class="cat-item"
          @click="filterCategory(cat.value)"
        >
          <div class="cat-icon" :style="{ background: cat.gradient }">
            {{ cat.icon }}
          </div>
          <span class="cat-name">{{ cat.label }}</span>
        </div>
      </div>
    </div>

    <!-- 资源列表 -->
    <div class="resource-section">
      <div class="section-header">
        <h2>🔥 热门资源</h2>
      </div>

      <div class="resource-list" v-if="loading">
        <div class="skeleton-card" v-for="i in 4" :key="i">
          <div class="skeleton-icon"></div>
          <div class="skeleton-info">
            <div class="skeleton-title"></div>
            <div class="skeleton-desc"></div>
          </div>
        </div>
      </div>

      <div class="resource-list" v-else-if="resources.length">
        <ResourceCard
          v-for="resource in resources"
          :key="resource.id"
          :resource="resource"
          @toggle-fav="handleToggleFav"
        />
      </div>

      <div class="empty-state" v-else>
        <span class="empty-icon">📭</span>
        <p>暂无资源</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../utils/api'
import ResourceCard from '../components/ResourceCard.vue'

const router = useRouter()

const categories = [
  { label: '软件工具', value: 'software', icon: '💻', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  { label: '学习资源', value: 'study', icon: '📚', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  { label: '单机游戏', value: 'game', icon: '🎮', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  { label: '格式转换', value: 'convert', icon: '🔄', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' }
]

const resources = ref([])
const loading = ref(true)

async function loadResources() {
  loading.value = true
  try {
    const data = await api.getResources()
    resources.value = Array.isArray(data) ? data : (data.data || [])
  } catch (error) {
    console.error('加载失败:', error)
    resources.value = []
  } finally {
    loading.value = false
  }
}

function filterCategory(value) {
  if (value === 'convert') {
    router.push('/convert')
    return
  }
  router.push({ path: '/', query: { category: value } })
}

function goSearch() {
  router.push('/search')
}

function goCategory() {
  router.push('/category')
}

function handleToggleFav(id) {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
  const index = favs.indexOf(id)
  if (index > -1) {
    favs.splice(index, 1)
  } else {
    favs.push(id)
  }
  localStorage.setItem('favorites', JSON.stringify(favs))
}

onMounted(loadResources)
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  background: #1c2128;
  border-radius: 14px;
  margin-bottom: 24px;
  cursor: pointer;
  border: 1px solid #30363d;
  transition: border-color 0.2s;
}

.search-bar:hover {
  border-color: #3b82f6;
}

.search-icon {
  font-size: 18px;
  margin-right: 10px;
  color: #6e7681;
}

.search-placeholder {
  color: #6e7681;
  font-size: 15px;
}

/* 分类区域 */
.category-section {
  margin-bottom: 28px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 18px;
  color: #e6edf3;
  font-weight: 600;
}

.more {
  font-size: 14px;
  color: #3b82f6;
  cursor: pointer;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.cat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.cat-item:hover {
  transform: translateY(-4px);
}

.cat-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  transition: box-shadow 0.2s;
}

.cat-item:hover .cat-icon {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);
}

.cat-name {
  font-size: 13px;
  color: #c9d1d9;
  font-weight: 500;
}

/* 资源列表 */
.resource-section {
  margin-bottom: 20px;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #1c2128;
  border-radius: 16px;
}

.skeleton-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #21262d;
  margin-right: 14px;
  animation: pulse 1.5s infinite;
}

.skeleton-info {
  flex: 1;
}

.skeleton-title {
  height: 16px;
  background: #21262d;
  border-radius: 4px;
  margin-bottom: 10px;
  width: 50%;
  animation: pulse 1.5s infinite;
}

.skeleton-desc {
  height: 12px;
  background: #21262d;
  border-radius: 4px;
  width: 80%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #6e7681;
}

.empty-icon {
  font-size: 56px;
  display: block;
  margin-bottom: 16px;
}

/* 响应式 */
@media (max-width: 768px) {
  .home {
    padding: 16px;
  }

  .category-grid {
    gap: 12px;
  }

  .cat-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    font-size: 24px;
  }

  .cat-name {
    font-size: 12px;
  }
}
</style>