<template>
  <div class="category-page">
    <h1 class="page-title">📂 资源分类</h1>

    <div class="category-list">
      <div
        v-for="cat in categories"
        :key="cat.value"
        class="category-card"
        @click="goCategory(cat.value)"
      >
        <div class="card-bg" :style="{ background: cat.gradient }">
          <span class="card-icon">{{ cat.icon }}</span>
          <div class="card-info">
            <span class="card-name">{{ cat.label }}</span>
            <span class="card-count">{{ cat.count }} 个资源</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../utils/api'

const router = useRouter()

const categories = ref([
  {
    label: '软件工具',
    value: 'software',
    icon: '💻',
    count: 0,
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
  },
  {
    label: '学习资源',
    value: 'study',
    icon: '📚',
    count: 0,
    gradient: 'linear-gradient(135deg, #10b981, #047857)'
  },
  {
    label: '单机游戏',
    value: 'game',
    icon: '🎮',
    count: 0,
    gradient: 'linear-gradient(135deg, #8b5cf6, #5b21b6)'
  }
])

async function loadStats() {
  try {
    const data = await api.getStats()
    if (data.categories) {
      categories.value.forEach(cat => {
        cat.count = data.categories[cat.value] || 0
      })
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

function goCategory(value) {
  router.push({ path: '/', query: { category: value } })
}

onMounted(loadStats)
</script>

<style scoped>
.category-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  color: #e6edf3;
  margin-bottom: 24px;
  font-weight: 600;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.category-card:hover {
  transform: translateY(-4px);
}

.card-bg {
  display: flex;
  align-items: center;
  padding: 28px 24px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transition: box-shadow 0.2s;
}

.category-card:hover .card-bg {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.card-icon {
  font-size: 44px;
  margin-right: 20px;
}

.card-info {
  flex: 1;
}

.card-name {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-bottom: 6px;
}

.card-count {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
}
</style>