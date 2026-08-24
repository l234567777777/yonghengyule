<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <!-- 关闭按钮 -->
          <button class="modal-close" @click="close">✕</button>

          <!-- 内容区 -->
          <div class="modal-content">
            <!-- 海报/图标区 -->
            <div class="modal-media">
              <img v-if="poster" :src="poster" :alt="title" class="modal-poster" />
              <div v-else class="modal-icon" :style="{ background: gradient }">
                {{ initials }}
              </div>
              <span v-if="rating" class="modal-rating">⭐ {{ rating }}</span>
            </div>

            <!-- 信息区 -->
            <div class="modal-info">
              <h2 class="modal-title">{{ title }}</h2>
              <p v-if="year || genres" class="modal-meta">
                <span v-if="year">{{ year }}</span>
                <span v-if="year && genres"> · </span>
                <span v-if="genres">{{ genres }}</span>
              </p>
              <p v-if="overview" class="modal-overview">{{ overview }}</p>

              <!-- 外部链接 -->
              <div v-if="externalLinks && externalLinks.length" class="modal-actions">
                <div class="external-btns-grid">
                  <a
                    v-for="link in externalLinks"
                    :key="link.name"
                    :href="link.url"
                    target="_blank"
                    rel="noopener"
                    class="ext-link-btn"
                  >
                    <span class="ext-icon">{{ link.icon }}</span>
                    <span class="ext-name">{{ link.name }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  title: String,
  poster: String,
  year: String,
  genres: String,
  overview: String,
  rating: [Number, String],
  detailPath: String,
  externalLinks: Array,
  gradient: String
})

const emit = defineEmits(['close'])

const initials = computed(() => {
  if (!props.title) return '?'
  return props.title.substring(0, 2).toUpperCase()
})

function close() {
  emit('close')
}


</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-container {
  position: relative;
  background: #1c2128;
  border: 1px solid #30363d;
  border-radius: 20px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
  scrollbar-width: thin;
  scrollbar-color: #3b82f6 #1c2128;
}

.modal-container::-webkit-scrollbar {
  width: 8px;
}

.modal-container::-webkit-scrollbar-track {
  background: #1c2128;
}

.modal-container::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 4px;
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #8b949e;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}

.modal-content {
  display: flex;
  gap: 0;
  overflow-y: visible;
}

.modal-media {
  position: relative;
  width: 220px;
  flex-shrink: 0;
  display: flex;
  align-items: stretch;
}

.modal-poster {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 0;
}

.modal-icon {
  width: 100%;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  color: white;
}

.modal-rating {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.75);
  color: #ffd700;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
}

.modal-info {
  flex: 1;
  padding: 28px 28px 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: visible;
  min-height: 0;
}

.modal-title {
  font-size: 22px;
  font-weight: 700;
  color: #f0f6fc;
  margin: 0;
  line-height: 1.3;
}

.modal-meta {
  font-size: 14px;
  color: #8b949e;
  margin: 0;
}

.modal-overview {
  font-size: 14px;
  color: #8b949e;
  line-height: 1.7;
  margin: 6px 0 0;
  max-height: none;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  overflow: visible;
  display: block;
}

.modal-actions {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.actions-label {
  font-size: 13px;
  color: #6e7681;
  margin: 0;
  font-weight: 500;
}

.action-btn.primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s;
  align-self: flex-start;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
}

.external-btns-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.ext-link-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 10px;
  color: #c9d1d9;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.2s;
}

.ext-link-btn:hover {
  border-color: #3b82f6;
  background: #2d333b;
  transform: translateY(-1px);
}

.ext-icon {
  font-size: 18px;
}

.ext-name {
  font-size: 13px;
}

/* 动画 */
.modal-enter-active {
  animation: modal-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active {
  animation: modal-out 0.2s ease-in forwards;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.88) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modal-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.92);
  }
}

/* 响应式 */
@media (max-width: 600px) {
  .modal-content {
    flex-direction: column;
  }

  .modal-media {
    width: 100%;
  }

  .modal-poster {
    max-height: 260px;
  }

  .modal-info {
    padding: 20px;
  }

  .modal-title {
    font-size: 18px;
  }

  .external-btns-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
