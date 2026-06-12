<template>
  <div class="convert-page">
    <h1>🔄 格式转换工具</h1>
    <p class="subtitle">免费在线文件格式转换，支持图片、文档、音频、视频等 200+ 格式</p>

    <!-- 转换类型选择 -->
    <div class="type-selector">
      <button
        v-for="type in convertTypes"
        :key="type.value"
        class="type-btn"
        :class="{ active: currentType === type.value }"
        @click="currentType = type.value"
      >
        <span class="type-icon">{{ type.icon }}</span>
        <span>{{ type.label }}</span>
      </button>
    </div>

    <!-- 转换区域 -->
    <div class="convert-area">
      <!-- 文件上传 -->
      <div
        class="upload-zone"
        :class="{ 'has-file': selectedFile, 'drag-over': isDragOver }"
        @click="triggerUpload"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @drop.prevent="handleDrop"
      >
        <input
          ref="fileInput"
          type="file"
          class="hidden-input"
          @change="handleFileSelect"
          :accept="acceptTypes"
        />
        <div v-if="!selectedFile" class="upload-placeholder">
          <span class="upload-icon">📁</span>
          <p>点击或拖拽文件到此处</p>
          <p class="upload-hint">支持 {{ currentTypeInfo.formats }} 等格式</p>
        </div>
        <div v-else class="file-info">
          <span class="file-icon">📄</span>
          <div class="file-details">
            <p class="file-name">{{ selectedFile.name }}</p>
            <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
          <button class="remove-btn" @click.stop="removeFile">✕</button>
        </div>
      </div>

      <!-- 目标格式选择 -->
      <div v-if="selectedFile" class="format-selector">
        <label>转换为：</label>
        <div class="format-options">
          <button
            v-for="fmt in currentTypeInfo.targets"
            :key="fmt"
            class="format-btn"
            :class="{ active: targetFormat === fmt }"
            @click="targetFormat = fmt"
          >
            {{ fmt.toUpperCase() }}
          </button>
        </div>
      </div>

      <!-- 转换按钮 -->
      <button
        v-if="selectedFile && targetFormat"
        class="convert-action-btn"
        :disabled="converting"
        @click="startConvert"
      >
        <span v-if="converting">转换中 {{ progress }}%...</span>
        <span v-else>开始转换</span>
      </button>

      <!-- 转换结果 -->
      <div v-if="convertResult" class="result-area">
        <div class="result-success" v-if="convertResult.status === 'done'">
          <span class="success-icon">✅</span>
          <div class="result-info">
            <p>转换成功！</p>
            <p class="result-filename">{{ convertResult.output.filename }}</p>
            <p class="result-size">{{ convertResult.output.size_human }}</p>
          </div>
          <a
            :href="convertResult.output.url"
            target="_blank"
            class="download-btn"
            download
          >
            下载文件
          </a>
        </div>
        <div class="result-error" v-else-if="convertResult.status === 'error'">
          <span class="error-icon">❌</span>
          <p>{{ convertResult.message }}</p>
        </div>
      </div>
    </div>

    <!-- 支持的格式说�?-->
    <div class="formats-info">
      <h3>📋 支持的格式</h3>
      <div class="format-grid">
        <div class="format-item">
          <span class="format-icon">🖼️</span>
          <h4>图片</h4>
          <p>JPG, PNG, WebP, GIF, BMP, TIFF, SVG, ICO...</p>
        </div>
        <div class="format-item">
          <span class="format-icon">📄</span>
          <h4>文档</h4>
          <p>PDF, DOC, DOCX, TXT, RTF, ODT...</p>
        </div>
        <div class="format-item">
          <span class="format-icon">🎵</span>
          <h4>音频</h4>
          <p>MP3, WAV, AAC, FLAC, OGG, M4A...</p>
        </div>
        <div class="format-item">
          <span class="format-icon">🎬</span>
          <h4>视频</h4>
          <p>MP4, AVI, MKV, MOV, WMV, FLV...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const API_BASE = 'https://cleverutils.com/api/v1'

const convertTypes = [
  { value: 'image', label: '图片转换', icon: '🖼️', formats: 'JPG, PNG, WebP, GIF', targets: ['jpg', 'png', 'webp', 'gif', 'bmp', 'tiff'] },
  { value: 'document', label: '文档转换', icon: '📄', formats: 'PDF, Word, TXT', targets: ['pdf', 'doc', 'docx', 'txt', 'rtf'] },
  { value: 'audio', label: '音频转换', icon: '🎵', formats: 'MP3, WAV, AAC', targets: ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'] },
  { value: 'video', label: '视频转换', icon: '🎬', formats: 'MP4, AVI, MKV', targets: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'] }
]

const currentType = ref('image')
const currentTypeInfo = computed(() => convertTypes.find(t => t.value === currentType.value))
const acceptTypes = computed(() => {
  const map = {
    image: 'image/*',
    document: '.pdf,.doc,.docx,.txt,.rtf,.odt',
    audio: 'audio/*',
    video: 'video/*'
  }
  return map[currentType.value] || '*/*'
})

const fileInput = ref(null)
const selectedFile = ref(null)
const targetFormat = ref('')
const converting = ref(false)
const progress = ref(0)
const convertResult = ref(null)
const isDragOver = ref(false)

watch(currentType, () => {
  selectedFile.value = null
  targetFormat.value = ''
  convertResult.value = null
})

function triggerUpload() {
  fileInput.value?.click()
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    targetFormat.value = ''
    convertResult.value = null
  }
}

function handleDrop(e) {
  isDragOver.value = false
  const file = e.dataTransfer.files[0]
  if (file) {
    selectedFile.value = file
    targetFormat.value = ''
    convertResult.value = null
  }
}

function removeFile() {
  selectedFile.value = null
  targetFormat.value = ''
  convertResult.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function startConvert() {
  if (!selectedFile.value || !targetFormat.value) return

  converting.value = true
  progress.value = 0
  convertResult.value = null

  const formData = new FormData()
  formData.append('file', selectedFile.value)
  formData.append('to_format', targetFormat.value)

  try {
    // 模拟进度
    const progressInterval = setInterval(() => {
      if (progress.value < 90) progress.value += Math.random() * 15
    }, 500)

    const response = await fetch(`${API_BASE}/convert`, {
      method: 'POST',
      body: formData
    })

    clearInterval(progressInterval)
    progress.value = 100

    const result = await response.json()

    if (response.ok && result.data) {
      convertResult.value = {
        status: 'done',
        output: result.data.output,
        links: result.data.links
      }
    } else {
      convertResult.value = {
        status: 'error',
        message: result.error?.message || '转换失败，请重试'
      }
    }
  } catch (error) {
    convertResult.value = {
      status: 'error',
      message: '网络错误：' + error.message
    }
  } finally {
    converting.value = false
  }
}
</script>

<style scoped>
.convert-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.convert-page h1 {
  font-size: 24px;
  color: #e6edf3;
  margin-bottom: 8px;
}

.subtitle {
  color: #8b949e;
  margin-bottom: 24px;
}

/* 类型选择�?*/
.type-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #1c2128;
  border: 2px solid #30363d;
  border-radius: 12px;
  color: #8b949e;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn:hover {
  border-color: #3b82f6;
  color: #e6edf3;
}

.type-btn.active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  color: #e6edf3;
}

.type-icon {
  font-size: 28px;
}

/* 转换区域 */
.convert-area {
  background: #1c2128;
  border: 1px solid #30363d;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

/* 上传区域 */
.upload-zone {
  border: 2px dashed #30363d;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.upload-zone:hover,
.upload-zone.drag-over {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.upload-zone.has-file {
  border-style: solid;
  border-color: #238636;
  background: rgba(35, 134, 54, 0.05);
}

.hidden-input {
  display: none;
}

.upload-placeholder .upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.upload-placeholder p {
  color: #8b949e;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 13px;
  color: #6e7681;
}

/* 文件信息 */
.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  font-size: 32px;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-name {
  color: #e6edf3;
  font-weight: 500;
  margin-bottom: 4px;
}

.file-size {
  color: #8b949e;
  font-size: 13px;
}

.remove-btn {
  background: none;
  border: none;
  color: #f85149;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
}

/* 格式选择 */
.format-selector {
  margin-bottom: 20px;
}

.format-selector label {
  display: block;
  color: #e6edf3;
  margin-bottom: 12px;
  font-weight: 500;
}

.format-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.format-btn {
  padding: 8px 16px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 8px;
  color: #8b949e;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.format-btn:hover {
  border-color: #3b82f6;
  color: #e6edf3;
}

.format-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

/* 转换按钮 */
.convert-action-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.convert-action-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.convert-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 结果区域 */
.result-area {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #30363d;
}

.result-success {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.success-icon {
  font-size: 40px;
}

.result-info {
  flex: 1;
}

.result-info p {
  color: #e6edf3;
  margin-bottom: 4px;
}

.result-filename {
  font-weight: 500;
}

.result-size {
  font-size: 13px;
  color: #8b949e;
}

.download-btn {
  padding: 10px 24px;
  background: #238636;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-size: 14px;
  transition: opacity 0.2s;
}

.download-btn:hover {
  opacity: 0.9;
}

.result-error {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #f85149;
}

.error-icon {
  font-size: 32px;
}

/* 格式信息 */
.formats-info {
  margin-top: 32px;
}

.formats-info h3 {
  font-size: 18px;
  color: #e6edf3;
  margin-bottom: 16px;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.format-item {
  background: #1c2128;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 20px;
}

.format-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.format-item h4 {
  color: #e6edf3;
  margin-bottom: 8px;
}

.format-item p {
  color: #8b949e;
  font-size: 13px;
}

@media (max-width: 600px) {
  .type-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  .format-grid {
    grid-template-columns: 1fr;
  }
}