<template>
  <div class="category-page">
    <!-- 分类标题 -->
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-icon">{{ currentCategory?.icon }}</span>
        {{ currentCategory?.label || '资源分类' }}
      </h1>

    </div>

    <!-- 搜索框 -->
    <div class="search-section" v-if="currentCategory?.hasSearch">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          :placeholder="currentCategory?.searchPlaceholder || '搜索资源...'"
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">搜索</button>
      </div>
      <!-- 站内搜索结果 -->
      <div v-if="showLocalResults" class="local-search-results">
        <div class="search-result-header">
          <span class="result-count">站内找到 {{ localResults.length }} 个结果</span>
          <button class="close-results" @click="closeLocalSearch">✕</button>
        </div>
        <div v-if="localResults.length" class="resource-list">
          <ResourceCard
            v-for="resource in localResults"
            :key="resource.id"
            :resource="resource"
            @click="goToDetail(resource)"
          />
        </div>
      </div>
    </div>

    <!-- 外部搜索链接（站内无结果时） -->
    <div v-if="showExternalLinks" class="external-search-section">
      <p class="external-tip">未找到站内资源，试试这些网站：</p>
      <div class="external-links">
        <a
          v-for="site in externalSearchSites"
          :key="site.name"
          :href="site.url + encodeURIComponent(searchQuery)"
          target="_blank"
          class="external-link"
        >
          <span class="link-icon">{{ site.icon }}</span>
          <span class="link-name">{{ site.name }}</span>
        </a>
      </div>
    </div>

    <!-- 资源列表 -->
    <div class="resource-section" v-if="!showLocalResults">
      <div v-if="loading" class="loading-state">
        <div class="skeleton-card" v-for="i in 6" :key="i">
          <div class="skeleton-icon"></div>
          <div class="skeleton-info">
            <div class="skeleton-title"></div>
            <div class="skeleton-desc"></div>
          </div>
        </div>
      </div>

      <div v-else-if="resources.length" class="resource-list">
        <ResourceCard
          v-for="resource in resources"
          :key="resource.id"
          :resource="resource"
          @click="goToDetail(resource)"
        />
      </div>

      <div v-else-if="!hasSearched" class="empty-state">
        <span class="empty-icon">🔍</span>
        <p>输入关键词搜索资源</p>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1 && !showLocalResults" class="pagination">
      <button
        class="page-btn"
        :disabled="currentPage <= 1"
        @click="changePage(currentPage - 1)"
      >
        上一页
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button
        class="page-btn"
        :disabled="currentPage >= totalPages"
        @click="changePage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../utils/api'
import ResourceCard from '../components/ResourceCard.vue'

const route = useRoute()
const router = useRouter()

// 外部搜索站点
const externalSearchSites = [
  { name: 'DYG影视', url: 'https://dyg2024.com/', icon: '🎬' },
  { name: 'MonkeyFlix', url: 'https://monkey-flix.com/', icon: '🐵' },
  { name: '可可影视', url: 'https://www.keke1.app/', icon: '📺' }
]

// 分类配置
const categoryMap = {
  software: {
    label: '软件资源',
    icon: '💻',
    desc: '精选实用软件工具',
    apiCategory: 'software',
    hasSearch: true,
    searchPlaceholder: '搜索软件资源...'
  },
  learning: {
    label: '学习资源',
    icon: '📚',
    desc: '优质教程与课程',
    apiCategory: 'learning',
    hasSearch: true,
    searchPlaceholder: '搜索学习资源...'
  },
  game: {
    label: '单机游戏',
    icon: '🎮',
    desc: '经典游戏资源',
    apiCategory: 'game'
  },
  study: {
    label: '学习资料',
    icon: '📖',
    desc: '学习资料分享',
    apiCategory: 'study'
  }
}

const categoryType = computed(() => route.params.type || 'software')
const currentCategory = computed(() => categoryMap[categoryType.value])

const searchQuery = ref('')
const hasSearched = ref(false)
const showLocalResults = ref(false)
const localResults = ref([])
const showExternalLinks = ref(false)
const resources = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 10
const total = ref(0)
const totalPages = computed(() => Math.ceil(total.value / pageSize))

async function loadResources() {
  loading.value = true
  try {
    const category = currentCategory.value?.apiCategory || categoryType.value
    const data = await api.getResources({
      category,
      page: currentPage.value,
      limit: pageSize
    })
    resources.value = Array.isArray(data) ? data : (data.data || [])
    total.value = data.total || resources.value.length
  } catch (error) {
    console.error('加载资源失败:', error)
    resources.value = []
  } finally {
    loading.value = false
  }
}

async function handleSearch() {
  if (!searchQuery.value.trim()) return
  
  hasSearched.value = true
  showLocalResults.value = true
  showExternalLinks.value = false
  
  try {
    const results = await api.searchResources(searchQuery.value.trim())
    localResults.value = Array.isArray(results) ? results : (results.data || [])
    
    // 如果站内没有结果，显示外部搜索链接
    if (localResults.value.length === 0) {
      showExternalLinks.value = true
    }
  } catch (error) {
    console.error('搜索失败:', error)
    localResults.value = []
    showExternalLinks.value = true
  }
}

function closeLocalSearch() {
  showLocalResults.value = false
  localResults.value = []
  showExternalLinks.value = false
}

function changePage(page) {
  currentPage.value = page
  loadResources()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goToDetail(resource) {
  router.push(`/detail/${resource.id}`)
}

// 监听分类变化
watch(categoryType, () => {
  currentPage.value = 1
  searchQuery.value = ''
  hasSearched.value = false
  showLocalResults.value = false
  localResults.value = []
  showExternalLinks.value = false
  loadResources()
})

onMounted(loadResources)
</script>

<style scoped>
.category-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  color: #e6edf3;
  margin-bottom: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 32px;
}

.page-desc {
  color: #8b949e;
  font-size: 15px;
}

/* 搜索框 */
.search-section {
  margin-bottom: 24px;
}

.search-box {
  display: flex;
  max-width: 600px;
  margin: 0 auto 16px;
  background: #1c2128;
  border: 1px solid #30363d;
  border-radius: 8px;
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #c9d1d9;
  font-size: 15px;
  outline: none;
}

.search-input::placeholder {
  color: #6e7681;
}

.search-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  color: white;
  font-size: 15px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.search-btn:hover {
  opacity: 0.9;
}

/* 站内搜索结果 */
.local-search-results {
  background: #1c2128;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 16px;
}

.search-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #30363d;
}

.result-count {
  color: #8b949e;
  font-size: 14px;
}

.close-results {
  background: transparent;
  border: none;
  color: #8b949e;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
}

.close-results:hover {
  color: #c9d1d9;
}

/* 外部搜索链接 */
.external-search-section {
  background: #1c2128;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.external-tip {
  color: #8b949e;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
}

.external-links {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.external-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 8px;
  color: #c9d1d9;
  text-decoration: none;
  transition: all 0.2s;
}

.external-link:hover {
  border-color: #3b82f6;
  background: #2d333b;
}

.link-icon {
  font-size: 18px;
}

.link-name {
  font-size: 14px;
}

/* 资源列表 */
.resource-section {
  margin-bottom: 24px;
}

.loading-state {
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

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6e7681;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding: 20px;
}

.page-btn {
  padding: 10px 20px;
  background: #1c2128;
  border: 1px solid #30363d;
  border-radius: 8px;
  color: #c9d1d9;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  background: #21262d;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #8b949e;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 768px) {
  .category-page {
    padding: 16px;
  }

  .page-title {
    font-size: 22px;
  }

  .title-icon {
    font-size: 26px;
  }

  .search-box {
    max-width: 100%;
  }

  .external-links {
    flex-direction: column;
  }

  .external-link {
    justify-content: center;
  }
}
</style>
