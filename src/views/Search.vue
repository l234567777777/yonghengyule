<template>
  <div class="search-page">
    <!-- 搜索栏 -->
    <div class="search-header">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索资源名称..."
          class="search-input"
          @keyup.enter="doSearch"
          autofocus
        >
        <button class="search-btn" @click="doSearch">搜索</button>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results" v-if="searched">
      <div v-if="results.length" class="result-list">
        <ResourceCard
          v-for="resource in results"
          :key="resource.id"
          :resource="resource"
        />
      </div>
      <div v-else class="empty-state">
        <span class="empty-icon">😕</span>
        <p>未找到相关资源</p>
        <p class="empty-tip">试试其他关键词</p>
      </div>
    </div>

    <!-- 热门搜索 -->
    <div class="hot-search" v-else>
      <h3>🔥 热门搜索</h3>
      <div class="hot-tags">
        <span
          v-for="tag in hotTags"
          :key="tag"
          class="hot-tag"
          @click="quickSearch(tag)"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../utils/api'
import ResourceCard from '../components/ResourceCard.vue'

const router = useRouter()
const keyword = ref('')
const results = ref([])
const searched = ref(false)

const hotTags = ['7-Zip', 'Chrome', 'PS教程', '单机游戏', '视频剪辑', '编程']

async function doSearch() {
  if (!keyword.value.trim()) return
  searched.value = true
  try {
    const data = await api.searchResources(keyword.value)
    results.value = Array.isArray(data) ? data : (data.data || [])
  } catch (error) {
    console.error('搜索失败:', error)
    results.value = []
  }
}

function quickSearch(tag) {
  keyword.value = tag
  doSearch()
}
</script>

<style scoped>
.search-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* 搜索头部 */
.search-header {
  margin-bottom: 24px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #1c2128;
  border-radius: 14px;
  padding: 4px 4px 4px 18px;
  border: 1px solid #30363d;
  transition: border-color 0.2s;
}

.search-box:focus-within {
  border-color: #3b82f6;
}

.search-icon {
  font-size: 18px;
  margin-right: 10px;
  color: #6e7681;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  color: #e6edf3;
  font-size: 16px;
  outline: none;
  padding: 12px 0;
}

.search-input::placeholder {
  color: #6e7681;
}

.search-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.search-btn:hover {
  opacity: 0.9;
}

/* 热门搜索 */
.hot-search {
  padding-top: 20px;
}

.hot-search h3 {
  font-size: 18px;
  color: #e6edf3;
  margin-bottom: 20px;
  font-weight: 600;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hot-tag {
  padding: 12px 20px;
  background: #1c2128;
  border: 1px solid #30363d;
  border-radius: 24px;
  color: #c9d1d9;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.hot-tag:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

/* 搜索结果 */
.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 100px 20px;
  color: #6e7681;
}

.empty-icon {
  font-size: 56px;
  display: block;
  margin-bottom: 16px;
}

.empty-tip {
  font-size: 14px;
  margin-top: 10px;
}
</style>