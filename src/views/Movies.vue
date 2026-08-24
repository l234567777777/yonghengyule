<template>
  <div class="movies-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-icon">🎬</span>
        娱乐影视
      </h1>

    </div>

    <!-- 搜索框 -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜索电影、电视剧、综艺..."
        @keyup.enter="handleSearch"
      />
      <button class="search-btn" @click="handleSearch">🔍</button>
    </div>

    <!-- 搜索状态 -->
    <div v-if="hasSearched" class="search-status">
      <span v-if="filteredMovies.length || tmdbMovies.length" class="status-found">
        找到 {{ filteredMovies.length }} 部站内资源 · {{ tmdbMovies.length }} 部站外影视
      </span>
      <span v-else class="status-none">
        站内与 TMDB 均未找到「{{ searchQuery }}」，试试以下网站：
      </span>
    </div>

    <!-- 外部搜索链接（全无结果时） -->
    <div v-if="showExternalLinks" class="external-search-section">
      <div class="external-links">
        <a
          v-for="site in externalSearchSites"
          :key="site.name"
          :href="site.buildUrl(searchQuery)"
          target="_blank"
          rel="noopener"
          class="external-link"
        >
          <span class="link-icon">{{ site.icon }}</span>
          <span class="link-name">{{ site.name }}</span>
          <span class="link-arrow">→</span>
        </a>
      </div>
    </div>

    <!-- 站内匹配结果 -->
    <div v-if="filteredMovies.length" class="result-section">
      <h2 class="section-title">📀 站内资源</h2>
      <div class="movie-grid">
        <div
          v-for="movie in filteredMovies"
          :key="'local-' + movie.id"
          class="movie-card"
          @click="openMovieModal(movie)"
        >
          <div class="poster-wrap">
            <img :src="movie.poster" :alt="movie.title" class="poster" loading="lazy" />
            <span v-if="movie.rating" class="rating">⭐ {{ movie.rating }}</span>
          </div>
          <div class="movie-info">
            <div class="movie-title">{{ movie.title }}</div>
            <div class="movie-meta">
              <span v-if="movie.year">{{ movie.year }}</span>
              <span v-if="movie.genres"> · {{ movie.genres }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 站外 TMDB 海报结果 -->
    <div v-if="tmdbMovies.length" class="result-section">
      <h2 class="section-title">🌐 站外影视（点击海报跳转观影）</h2>
      <div class="movie-grid">
        <div v-for="m in tmdbMovies" :key="'tmdb-' + m.tmdbId" class="movie-card tmdb-card" @click="openTmdbModal(m)">
          <div class="poster-wrap">
            <img :src="getPoster(m.poster)" :alt="m.title" class="poster" loading="lazy" />
            <!-- 4个外链按钮 -->
            <div class="external-btns">
              <a
                v-for="site in externalSearchSites"
                :key="site.name"
                :href="site.buildUrl(searchQuery)"
                target="_blank"
                rel="noopener"
                class="ext-btn"
                :title="'去 ' + site.name + ' 观看'"
              >
                {{ site.icon }}
              </a>
            </div>
          </div>
          <div class="movie-info">
            <div class="movie-title">{{ m.title }}</div>
            <div class="movie-meta">
              <span v-if="m.year">{{ m.year }}</span>
              <span v-if="m.mediaType === 'tv'" class="badge">剧集</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 默认：全部站内电影 -->
    <div v-if="!hasSearched && !loading" class="movie-grid">
      <div
        v-for="movie in displayMovies"
        :key="movie.id"
        class="movie-card"
        @click="openMovieModal(movie)"
      >
        <div class="poster-wrap">
          <img :src="movie.poster" :alt="movie.title" class="poster" loading="lazy" />
          <span v-if="movie.rating" class="rating">⭐ {{ movie.rating }}</span>
        </div>
        <div class="movie-info">
          <div class="movie-title">{{ movie.title }}</div>
          <div class="movie-meta">
            <span v-if="movie.year">{{ movie.year }}</span>
            <span v-if="movie.genres"> · {{ movie.genres }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载骨架 -->
    <div v-if="loading" class="loading-grid">
      <div class="skeleton-card" v-for="i in 12" :key="i">
        <div class="skeleton-poster"></div>
        <div class="skeleton-line"></div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1 && !hasSearched" class="pagination">
      <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button class="page-btn" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">下一页</button>
    </div>

    <!-- 弹出模态框 -->
    <ModalCard
      :visible="modalVisible"
      :title="modalData.title"
      :poster="modalData.poster"
      :year="modalData.year"
      :genres="modalData.genres"
      :overview="modalData.overview"
      :rating="modalData.rating"
      :detail-path="modalData.detailPath"
      :external-links="modalData.externalLinks"
      :gradient="modalData.gradient"
      @close="modalVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../utils/api'
import ModalCard from '../components/ModalCard.vue'

// 4个外部影视站
const externalSearchSites = [
  {
    name: '555电影', icon: '🎥',
    buildUrl: (q) => `https://www.55dy7.com/vodsearch/-------------.html?wd=${encodeURIComponent(q)}`
  },
  {
    name: '千千影视', icon: '🎞️',
    buildUrl: (q) => `https://www.qqys01.com/vodsearch/-------------.html?wd=${encodeURIComponent(q)}`
  },
  {
    name: 'MonkeyFlix', icon: '🐵',
    buildUrl: (q) => `https://monkey-flix.com/search?keywords=${encodeURIComponent(q)}`
  },
  {
    name: '可可影视', icon: '📺',
    buildUrl: (q) => `https://www.keke1.app/search?t=2wms93vWn3XjdlvVmF2Fgw%3D%3D&k=${encodeURIComponent(q)}`
  }
]

const searchQuery = ref('')
const hasSearched = ref(false)
const showExternalLinks = ref(false)
const filteredMovies = ref([])
const tmdbMovies = ref([])
const allMovies = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 24
const total = ref(0)
const totalPages = computed(() => Math.ceil(total.value / pageSize))
const displayMovies = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return allMovies.value.slice(start, start + pageSize)
})

// 模态框
const modalVisible = ref(false)
const modalData = ref({})

const gradients = [
  ['#e74c3c','#c0392b'],['#9b59b6','#8e44ad'],['#3498db','#2980b9'],
  ['#1abc9c','#16a085'],['#f39c12','#e67e22'],['#2ecc71','#27ae60']
]

function getMovieGradient(id) {
  const [c1, c2] = gradients[(id || '').length % gradients.length]
  return `linear-gradient(135deg, ${c1}, ${c2})`
}

function openMovieModal(movie) {
  const q = movie.title || ''
  modalData.value = {
    title: movie.title,
    poster: movie.poster,
    year: movie.year,
    genres: movie.genres,
    overview: movie.overview,
    rating: movie.rating,
    detailPath: `/detail/${movie.id}`,
    externalLinks: externalSearchSites.map(s => ({
      name: s.name,
      icon: s.icon,
      url: s.buildUrl(q)
    })),
    gradient: getMovieGradient(movie.id)
  }
  modalVisible.value = true
}

// 站外 TMDB 海报点击弹窗
function openTmdbModal(m) {
  const q = m.title || ''
  // 后端 poster 可能是完整 URL 或路径，需兼容
  let posterUrl = ''
  if (m.poster) {
    if (m.poster.startsWith('http')) {
      posterUrl = m.poster
    } else {
      posterUrl = `https://image.tmdb.org/t/p/w342${m.poster}`
    }
  }
  modalData.value = {
    title: m.title,
    poster: posterUrl,
    year: m.year,
    genres: m.genres || '',
    overview: m.overview || '',
    rating: m.rating || 0,
    externalLinks: externalSearchSites.map(s => ({
      name: s.name,
      icon: s.icon,
      url: s.buildUrl(q)
    })),
    gradient: ''
  }
  modalVisible.value = true
}

async function loadAllMovies() {
  loading.value = true
  try {
    const data = await api.getMovies({ page: 1, limit: 100 })
    const result = data.data || {}
    allMovies.value = result.list || []
    total.value = result.total || allMovies.value.length
  } catch (e) {
    allMovies.value = []
  } finally {
    loading.value = false
  }
}

function getPoster(url) {
  if (!url) return ''
  return url.replace('/w342/', '/w500/')
}

async function handleSearch() {
  const q = searchQuery.value.trim()
  if (!q) {
    hasSearched.value = false
    showExternalLinks.value = false
    filteredMovies.value = []
    tmdbMovies.value = []
    return
  }
  hasSearched.value = true
  const lower = q.toLowerCase()
  filteredMovies.value = allMovies.value.filter(m =>
    (m.title && m.title.toLowerCase().includes(lower)) ||
    (m.originalTitle && m.originalTitle.toLowerCase().includes(lower))
  )
  try {
    const tmdbRes = await api.searchMoviesTMDB(q)
    tmdbMovies.value = (tmdbRes.data || []).slice(0, 30)
  } catch (e) {
    tmdbMovies.value = []
  }
  showExternalLinks.value = filteredMovies.value.length === 0 && tmdbMovies.value.length === 0
}

function changePage(page) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(loadAllMovies)
</script>

<style scoped>
.movies-page {
  padding: 28px 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  color: #f0f6fc;
  margin-bottom: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title-icon { font-size: 32px; }

.page-desc {
  color: #6e7681;
  font-size: 14px;
  margin-top: 2px;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  max-width: 540px;
  margin: 0 auto 20px;
  background: #1c2128;
  border: 1.5px solid #30363d;
  border-radius: 50px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-bar:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.search-input {
  flex: 1;
  padding: 14px 20px;
  background: transparent;
  border: none;
  color: #c9d1d9;
  font-size: 15px;
  outline: none;
}

.search-input::placeholder { color: #484f58; }

.search-btn {
  padding: 14px 22px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.search-btn:hover { opacity: 0.9; }

/* 搜索状态 */
.search-status {
  text-align: center;
  margin-bottom: 20px;
  font-size: 14px;
}

.status-found { color: #3fb950; }
.status-none { color: #d29922; }

/* 外部链接 */
.external-search-section {
  background: #1c2128;
  border: 1px solid #30363d;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 28px;
}

.external-links {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.external-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 50px;
  color: #c9d1d9;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.external-link:hover {
  border-color: #3b82f6;
  background: #2d333b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.link-icon { font-size: 18px; }
.link-arrow { color: #3b82f6; }

/* 区块标题 */
.result-section { margin-bottom: 32px; }

.section-title {
  font-size: 16px;
  color: #8b949e;
  margin-bottom: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* 电影网格 */
.movie-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  max-width: 1200px;
  margin: 0 auto;
}

.movie-card {
  background: #1c2128;
  border: 1px solid #21262d;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
              border-color 0.2s, box-shadow 0.2s;
}

.movie-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: #3b82f6;
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.2);
}

.poster-wrap {
  position: relative;
  aspect-ratio: 2 / 3;
  background: #21262d;
  overflow: hidden;
}

.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.movie-card:hover .poster { transform: scale(1.05); }

.rating {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.75);
  color: #ffd700;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 20px;
  font-weight: 600;
}

/* 外链按钮 */
.external-btns {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 8px 4px;
  background: linear-gradient(transparent, rgba(0,0,0,0.9));
  opacity: 0;
  transition: opacity 0.2s;
}

.tmdb-card:hover .external-btns { opacity: 1; }

.ext-btn {
  font-size: 22px;
  text-decoration: none;
  transition: transform 0.15s;
  filter: drop-shadow(0 1px 3px rgba(0,0,0,0.8));
}

.ext-btn:hover { transform: scale(1.3); }

.movie-info { padding: 10px 12px; }

.movie-title {
  color: #e6edf3;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.movie-meta {
  color: #6e7681;
  font-size: 12px;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  display: inline-block;
  margin-left: 4px;
  padding: 1px 6px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  color: #60a5fa;
  font-size: 11px;
}

/* 骨架屏 */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
  gap: 16px;
}

.skeleton-card {
  background: #1c2128;
  border-radius: 14px;
  overflow: hidden;
}

.skeleton-poster {
  aspect-ratio: 2 / 3;
  background: #21262d;
  animation: pulse 1.5s infinite;
}

.skeleton-line {
  height: 12px;
  background: #21262d;
  margin: 10px 12px;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
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
  padding: 10px 24px;
  background: #1c2128;
  border: 1px solid #30363d;
  border-radius: 50px;
  color: #c9d1d9;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  background: #2d333b;
}

.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.page-info { color: #6e7681; font-size: 14px; }

/* 响应式 */
@media (max-width: 768px) {
  .movies-page { padding: 16px 12px 32px; }
  .page-title { font-size: 24px; }
  .title-icon { font-size: 28px; }
  .search-bar { max-width: 100%; }
  .movie-grid, .loading-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
  .external-btns { opacity: 1; background: linear-gradient(transparent, rgba(0,0,0,0.92)); }
  .external-links { flex-direction: column; }
  .external-link { justify-content: center; }
}
</style>
