<template>
  <div class="resource-card" @click="openModal">
    <div class="card-icon" :style="{ background: gradient }">
      {{ initials }}
    </div>
    <div class="card-info">
      <h3 class="card-title">{{ resource.title || resource.name }}</h3>
      <p class="card-desc">{{ resource.description || resource.desc }}</p>
      <div class="card-meta">
        <span class="card-category">{{ resource.category }}</span>
        <span class="card-views">👁 {{ resource.views || 0 }}</span>
      </div>
    </div>
    <button class="fav-btn" :class="{ active: isFav }" @click.stop="toggleFav">
      {{ isFav ? '⭐' : '☆' }}
    </button>
  </div>

  <!-- 模态框 -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modalVisible" class="modal-overlay" @click.self="modalVisible = false">
        <div class="modal-box">
          <button class="modal-close" @click="modalVisible = false">✕</button>
          <div class="modal-icon-large" :style="{ background: gradient }">
            {{ initials }}
          </div>
          <div class="modal-body">
            <h2 class="modal-title">{{ resource.title || resource.name }}</h2>
            <p v-if="resource.description || resource.desc" class="modal-desc">
              {{ resource.description || resource.desc }}
            </p>
            <div class="modal-tags">
              <span class="tag category">{{ resource.category }}</span>
              <span class="tag views">👁 {{ resource.views || 0 }} 次浏览</span>
            </div>
            <a :href="detailUrl" target="_blank" class="detail-btn" @click.prevent="goDetail">
              📄 查看详情
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../utils/api'

const props = defineProps({
  resource: Object
})

const emit = defineEmits(['toggle-fav'])
const router = useRouter()

const modalVisible = ref(false)

const initials = computed(() => {
  const name = props.resource.title || props.resource.name || '?'
  return name.substring(0, 2).toUpperCase()
})

const gradient = computed(() => {
  const colors = [
    ['#667eea','#764ba2'],['#f093fb','#f5576c'],['#4facfe','#00f2fe'],
    ['#43e97b','#38f9d7'],['#fa709a','#fee140'],['#a8edea','#fed6e3'],
    ['#d299c2','#fef9d7'],['#89f7fe','#66a6ff']
  ]
  const index = (props.resource.id || '').length % colors.length
  const [c1, c2] = colors[index]
  return `linear-gradient(135deg, ${c1}, ${c2})`
})

const isFav = ref(false)

function checkFav() {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
  isFav.value = favs.includes(props.resource.id)
}

checkFav()

const detailUrl = computed(() => `/detail/${props.resource.id}`)

function openModal() {
  modalVisible.value = true
}

function goDetail() {
  modalVisible.value = false
  setTimeout(() => router.push(`/detail/${props.resource.id}`), 200)
}

function toggleFav() {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
  const idx = favs.indexOf(props.resource.id)
  if (idx > -1) {
    favs.splice(idx, 1)
    isFav.value = false
  } else {
    favs.push(props.resource.id)
    isFav.value = true
    // 同步后端（不阻塞 UI）
    api.addFavorite(props.resource.id).catch(() => {})
  }
  localStorage.setItem('favorites', JSON.stringify(favs))
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
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  border: 1px solid #21262d;
  gap: 14px;
}

.resource-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  border-color: #3b82f6;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.card-info { flex: 1; min-width: 0; }

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #e6edf3;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  font-size: 13px;
  color: #6e7681;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-category {
  font-size: 12px;
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.12);
  padding: 2px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.card-views {
  font-size: 12px;
  color: #484f58;
}

.fav-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  padding: 6px;
  color: #484f58;
  transition: color 0.2s, transform 0.2s;
  flex-shrink: 0;
}

.fav-btn:hover { color: #f59e0b; transform: scale(1.2); }
.fav-btn.active { color: #f59e0b; }

/* 模态框 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-box {
  position: relative;
  background: #1c2128;
  border: 1px solid #30363d;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0,0,0,0.6);
  text-align: center;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: #8b949e;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 2;
}

.modal-close:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.modal-icon-large {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  font-weight: bold;
  color: white;
}

.modal-body {
  padding: 24px 28px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #f0f6fc;
  margin: 0;
  line-height: 1.3;
}

.modal-desc {
  font-size: 14px;
  color: #6e7681;
  line-height: 1.6;
  margin: 0;
}

.modal-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.tag {
  font-size: 12px;
  padding: 3px 12px;
  border-radius: 20px;
}

.tag.category {
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.15);
}

.tag.views {
  color: #8b949e;
  background: rgba(139, 148, 158, 0.1);
}

.detail-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-radius: 50px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
  margin-top: 4px;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
}

.detail-btn:hover {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
}

/* 动画 */
.modal-enter-active {
  animation: modal-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active {
  animation: modal-out 0.18s ease-in forwards;
}

@keyframes modal-in {
  from { opacity: 0; transform: scale(0.85) translateY(24px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes modal-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.9); }
}
</style>
