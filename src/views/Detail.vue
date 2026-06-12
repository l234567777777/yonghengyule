<template>
  <div class="detail" v-if="resource">
    <!-- 返回按钮 -->
    <div class="back-section">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span>
        <span>返回</span>
      </button>
    </div>

    <!-- 资源信息卡 -->
    <div class="info-card">
      <div class="info-icon" :style="{ background: gradient }">
        {{ initials }}
      </div>
      <div class="info-content">
        <h1 class="info-title">{{ resource.title || resource.name }}</h1>
        <div class="info-tags">
          <span class="tag category">{{ resource.category }}</span>
          <span class="tag views">👁 {{ resource.views || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- 资源介绍 -->
    <div class="section-card">
      <h3 class="section-title">📝 资源介绍</h3>
      <p class="section-content">{{ resource.description || resource.desc || '暂无介绍' }}</p>
    </div>

    <!-- 应用截图 -->
    <div class="section-card" v-if="resource.screenshot">
      <h3 class="section-title">📸 应用截图</h3>
      <img :src="resource.screenshot" class="screenshot" alt="截图" loading="lazy">
    </div>

    <!-- 下载地址 -->
    <div class="section-card">
      <h3 class="section-title">📥 下载地址</h3>
      <div class="download-list">
        <a
          v-for="(link, index) in panLinks"
          :key="index"
          :href="link.url"
          target="_blank"
          class="download-item"
        >
          <div class="download-icon" :style="{ background: link.gradient }">
            {{ link.name.charAt(0) }}
          </div>
          <div class="download-info">
            <span class="download-name">{{ link.name }}</span>
            <span class="download-url">{{ truncateUrl(link.url) }}</span>
          </div>
          <span class="download-arrow">→</span>
        </a>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-actions">
      <button class="action-btn fav" :class="{ active: isFav }" @click="toggleFav">
        {{ isFav ? '⭐ 已收藏' : '☆ 收藏' }}
      </button>
      <a
        v-if="primaryLink"
        :href="primaryLink.url"
        target="_blank"
        class="action-btn primary"
      >
        立即下载
      </a>
    </div>
  </div>

  <div class="loading" v-else>
    <div class="spinner"></div>
    <p>加载中...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../utils/api'

const route = useRoute()
const router = useRouter()
const resource = ref(null)

const initials = computed(() => {
  const name = resource.value?.title || resource.value?.name || '?'
  return name.substring(0, 2).toUpperCase()
})

const gradient = computed(() => {
  const colors = [
    ['#3b82f6', '#2563eb'],
    ['#10b981', '#059669'],
    ['#8b5cf6', '#7c3aed'],
    ['#f59e0b', '#d97706']
  ]
  const index = (resource.value?.id || '').length % colors.length
  const [c1, c2] = colors[index]
  return `linear-gradient(135deg, ${c1}, ${c2})`
})

const panLinks = computed(() => {
  if (!resource.value) return []
  if (resource.value.panLinks) {
    return resource.value.panLinks.map((link, i) => ({
      ...link,
      gradient: getLinkGradient(i)
    }))
  }
  // 兼容旧格式
  const links = []
  const panTypes = ['baidu', 'lanzou', 'quark', 'xunlei', '123pan', 'yidong']
  const panNames = {
    baidu: '百度网盘',
    lanzou: '蓝奏云',
    quark: '夸克网盘',
    xunlei: '迅雷云盘',
    '123pan': '123网盘',
    yidong: '移动云盘'
  }
  panTypes.forEach((type, i) => {
    if (resource.value[type]) {
      links.push({
        name: panNames[type] || type,
        url: resource.value[type],
        gradient: getLinkGradient(i)
      })
    }
  })
  return links
})

const primaryLink = computed(() => panLinks.value[0])

const isFav = computed(() => {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
  return favs.includes(resource.value?.id)
})

function getLinkGradient(index) {
  const gradients = [
    'linear-gradient(135deg, #3b82f6, #2563eb)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #ef4444, #dc2626)',
    'linear-gradient(135deg, #06b6d4, #0891b2)'
  ]
  return gradients[index % gradients.length]
}

function truncateUrl(url) {
  if (!url) return ''
  return url.length > 40 ? url.substring(0, 40) + '...' : url
}

async function loadResource() {
  try {
    const data = await api.getResource(route.params.id)
    resource.value = data
  } catch (error) {
    console.error('加载失败:', error)
  }
}

function goBack() {
  router.back()
}

function toggleFav() {
  if (!resource.value) return
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
  const index = favs.indexOf(resource.value.id)
  if (index > -1) {
    favs.splice(index, 1)
  } else {
    favs.push(resource.value.id)
  }
  localStorage.setItem('favorites', JSON.stringify(favs))
}

onMounted(loadResource)
</script>

<style scoped>
.detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 100px;
  min-height: 100vh;
  background: #0d1117;
}

/* 返回区域 */
.back-section {
  margin-bottom: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #8b949e;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #c9d1d9;
}

.back-icon {
  font-size: 18px;
}

/* 信息卡 */
.info-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background: #161b22;
  border-radius: 20px;
  margin-bottom: 16px;
  border: 1px solid #21262d;
}

.info-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
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

.info-content {
  flex: 1;
  min-width: 0;
}

.info-title {
  font-size: 20px;
  font-weight: 600;
  color: #e6edf3;
  margin-bottom: 12px;
  word-break: break-all;
}

.info-tags {
  display: flex;
  gap: 10px;
}

.tag {
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 6px;
}

.tag.category {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.15);
}

.tag.views {
  color: #8b949e;
  background: #21262d;
}

/* 内容卡片 */
.section-card {
  background: #161b22;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 16px;
  border: 1px solid #21262d;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #e6edf3;
  margin-bottom: 14px;
}

.section-content {
  color: #c9d1d9;
  line-height: 1.8;
  font-size: 15px;
}

.screenshot {
  width: 100%;
  border-radius: 12px;
  margin-top: 10px;
}

/* 下载列表 */
.download-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.download-item {
  display: flex;
  align-items: center;
  padding: 14px;
  background: #1c2128;
  border-radius: 14px;
  text-decoration: none;
  color: #e6edf3;
  transition: background 0.2s;
}

.download-item:hover {
  background: #21262d;
}

.download-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin-right: 14px;
  flex-shrink: 0;
}

.download-info {
  flex: 1;
  min-width: 0;
}

.download-name {
  display: block;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
}

.download-url {
  display: block;
  font-size: 12px;
  color: #6e7681;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.download-arrow {
  color: #3b82f6;
  font-size: 18px;
  margin-left: 10px;
}

/* 底部操作栏 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(13, 17, 23, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid #21262d;
  z-index: 100;
  max-width: 800px;
  margin: 0 auto;
}

.action-btn {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: all 0.2s;
}

.action-btn.fav {
  background: #1c2128;
  color: #8b949e;
  border: 1px solid #30363d;
}

.action-btn.fav.active {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.3);
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.action-btn.primary:hover {
  opacity: 0.9;
}

/* 加载 */
.loading {
  text-align: center;
  padding: 120px 20px;
  color: #8b949e;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid #21262d;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>