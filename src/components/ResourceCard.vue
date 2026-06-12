<template>
  <div class="resource-card" @click="goDetail">
    <div class="card-icon" :style="{ background: gradient }">
      {{ initials }}
    </div>
    <div class="card-info">
      <h3 class="card-title">{{ resource.title || resource.name }}</h3>
      <p class="card-desc">{{ resource.description || resource.desc }}</p>
      <div class="card-meta">
        <span class="card-category">{{ resource.category }}</span>
        <span class="card-pan" v-if="resource.panType">{{ resource.panType }}</span>
        <span class="card-views">👁 {{ resource.views || 0 }}</span>
      </div>
    </div>
    <button
      class="fav-btn"
      :class="{ active: isFav }"
      @click.stop="toggleFav"
    >
      {{ isFav ? '⭐' : '☆' }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  resource: Object
})

const emit = defineEmits(['toggle-fav'])
const router = useRouter()

const initials = computed(() => {
  const name = props.resource.title || props.resource.name || '?'
  return name.substring(0, 2).toUpperCase()
})

const gradient = computed(() => {
  const colors = [
    ['#3b82f6', '#2563eb'],
    ['#10b981', '#059669'],
    ['#8b5cf6', '#7c3aed'],
    ['#f59e0b', '#d97706'],
    ['#ef4444', '#dc2626'],
    ['#06b6d4', '#0891b2'],
    ['#ec4899', '#db2777'],
    ['#6366f1', '#4f46e5']
  ]
  const index = (props.resource.id || '').length % colors.length
  const [c1, c2] = colors[index]
  return `linear-gradient(135deg, ${c1}, ${c2})`
})

const isFav = computed(() => {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
  return favs.includes(props.resource.id)
})

function goDetail() {
  router.push(`/detail/${props.resource.id}`)
}

function toggleFav() {
  emit('toggle-fav', props.resource.id)
}
</script>

<style scoped>
.resource-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #1c2128;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #21262d;
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.card-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
  margin-right: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #e6edf3;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  font-size: 13px;
  color: #8b949e;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-category {
  font-size: 12px;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.15);
  padding: 3px 10px;
  border-radius: 6px;
  font-weight: 500;
}

.card-pan {
  font-size: 12px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  padding: 3px 10px;
  border-radius: 6px;
  font-weight: 500;
}

.card-views {
  font-size: 12px;
  color: #6e7681;
}

.fav-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  padding: 6px;
  color: #6e7681;
  transition: color 0.2s;
  flex-shrink: 0;
}

.fav-btn:hover {
  color: #f59e0b;
}

.fav-btn.active {
  color: #f59e0b;
}
</style>