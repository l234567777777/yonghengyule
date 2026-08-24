<template>
  <div class="home">
    <!-- 搜索区域 -->
    <div class="search-section">
      <!-- 搜索引擎切换 -->
      <div class="search-engine-tabs">
        <button
          v-for="engine in searchEngines"
          :key="engine.id"
          class="engine-tab"
          :class="{ active: currentEngine === engine.id }"
          @click="currentEngine = engine.id"
        >
          {{ engine.name }}
        </button>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          :placeholder="searchEngines.find(e => e.id === currentEngine)?.placeholder || '搜索...'"
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch" aria-label="搜索">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      </div>

      <!-- 站内搜索结果 -->
      <div v-if="showLocalResults" class="local-search-results">
        <div class="search-result-header">
          <span class="result-count">找到 {{ localResults.length }} 个结果</span>
          <button class="close-results" @click="closeLocalSearch">✕</button>
        </div>
        <div v-if="localResults.length" class="resource-grid">
          <ResourceCard
            v-for="resource in localResults"
            :key="resource.id"
            :resource="resource"
            @click="goToDetail(resource)"
          />
        </div>
        <div v-else class="empty-state">
          <span class="empty-icon">🔍</span>
          <p>未找到相关资源</p>
        </div>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="category-section">
      <div class="category-tabs">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="cat-tab"
          :class="{ active: currentCategory === cat.id }"
          @click="switchCategory(cat.id)"
          @contextmenu.prevent="onCategoryRightClick($event, cat)"
        >
          {{ cat.name }}
        </button>
        <button class="cat-tab add-cat-btn" @click="tryAddCategory">+</button>
      </div>
    </div>

    <!-- 快捷卡片网格 -->
    <div class="shortcut-section">
      <div class="shortcut-grid">
        <div
          v-for="card in paginatedCards"
          :key="card.id"
          class="shortcut-card"
          :class="{ 'dragging': draggedCard?.id === card.id }"
          draggable="true"
          @click="openCard(card)"
          @contextmenu.prevent="onCardRightClick($event, card)"
          @dragstart="onDragStart($event, card)"
          @dragover.prevent
          @drop="onDrop($event, card)"
          @dragend="onDragEnd"
        >
          <div class="card-icon">
            <img v-if="card.icon && card.icon.startsWith('http')" :src="card.icon" :alt="card.name" />
            <span v-else>{{ card.icon || '🔗' }}</span>
          </div>
          <div class="card-name">{{ card.name }}</div>
        </div>

        <!-- 添加卡片按钮：作为最后一张卡片，落在当前页时显示 -->
        <div v-if="showAddCardOnCurrentPage" class="shortcut-card add-card" @click="tryAddCard">
          <div class="card-icon add-icon">+</div>
          <div class="card-name">添加卡片</div>
        </div>
      </div>

      <!-- 分页：分类卡片数达到每页上限(24)即显示翻页控件 -->
        <div v-if="showPagination" class="pagination">
        <button
          class="page-btn"
          :disabled="currentPage <= 1"
          @click="currentPage > 1 && currentPage--"
        >‹</button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button
          class="page-btn"
          :disabled="currentPage >= totalPages"
          @click="currentPage < totalPages && currentPage++"
        >›</button>
      </div>
    </div>

    <!-- 卡片右键菜单 -->
    <div v-if="cardContextMenu.show" class="context-menu" :style="{ left: cardContextMenu.x + 'px', top: cardContextMenu.y + 'px' }">
      <div class="menu-item" @click="editCard(cardContextMenu.card)">✏️ 编辑</div>
      <div class="menu-item" @click="deleteCard(cardContextMenu.card)">🗑️ 删除</div>
    </div>

    <!-- 分类右键菜单 -->
    <div v-if="catContextMenu.show" class="context-menu" :style="{ left: catContextMenu.x + 'px', top: catContextMenu.y + 'px' }">
      <div class="menu-item" @click="editCategory(catContextMenu.cat)">✏️ 重命名</div>
      <div class="menu-item" @click="deleteCategory(catContextMenu.cat)">🗑️ 删除</div>
    </div>

    <!-- 添加/编辑卡片弹窗 -->
    <div v-if="showAddCard || editingCard" class="modal-overlay" @click.self="closeCardModal">
      <div class="modal">
        <h3>{{ editingCard ? '编辑卡片' : '添加卡片' }}</h3>
        <input v-model="cardForm.name" placeholder="名称" class="modal-input" />
        <input v-model="cardForm.icon" placeholder="图标 (emoji 或 URL)" class="modal-input" />
        <input v-model="cardForm.url" placeholder="链接 URL" class="modal-input" />
        <div class="modal-actions">
          <button class="btn-secondary" @click="closeCardModal">取消</button>
          <button class="btn-primary" @click="saveCard">保存</button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑分类弹窗 -->
    <div v-if="showAddCategory || editingCategory" class="modal-overlay" @click.self="closeCatModal">
      <div class="modal">
        <h3>{{ editingCategory ? '重命名分类' : '添加分类' }}</h3>
        <input v-model="catForm.name" placeholder="分类名称" class="modal-input" />
        <div class="modal-actions">
          <button class="btn-secondary" @click="closeCatModal">取消</button>
          <button class="btn-primary" @click="saveCategory">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../utils/api'
import ResourceCard from '../components/ResourceCard.vue'

const router = useRouter()

// ===== 登录校验 =====
function isLoggedIn() {
  return !!localStorage.getItem('token')
}

// 修改操作前要求登录，未登录则提示并引导前往登录页
function requireLogin() {
  if (isLoggedIn()) return true
  const go = confirm('修改卡片需要先登录，是否前往登录页面？')
  if (go) router.push('/login?redirect=/')
  return false
}

function tryAddCard() {
  if (!requireLogin()) return
  showAddCard.value = true
}

function tryAddCategory() {
  if (!requireLogin()) return
  showAddCategory.value = true
}

// 搜索引擎
const searchEngines = [
  { id: 'baidu', name: '百度', placeholder: '百度搜索...' },
  { id: 'google', name: 'Google', placeholder: 'Google 搜索...' },
  { id: 'local', name: '站内', placeholder: '站内搜索...' }
]

const currentEngine = ref('google')
const searchQuery = ref('')
const showLocalResults = ref(false)
const localResults = ref([])
const isSearching = ref(false)

// 分类和卡片数据
const categories = ref([])
const currentCategory = ref('')
const cards = ref([])
const currentPage = ref(1)
const itemsPerPage = 24 // 6列 x 4排（恢复原始每页数量）

// 拖拽
const draggedCard = ref(null)

// 右键菜单
const cardContextMenu = ref({ show: false, x: 0, y: 0, card: null })
const catContextMenu = ref({ show: false, x: 0, y: 0, cat: null })

// 弹窗
const showAddCard = ref(false)
const showAddCategory = ref(false)
const editingCard = ref(null)
const editingCategory = ref(null)

const cardForm = ref({ name: '', icon: '', url: '' })
const catForm = ref({ name: '' })

// 计算当前分类的卡片
const currentCards = computed(() => {
  // 如果当前分类是 home（默认），显示所有 home 分类的卡片
  if (currentCategory.value === 'home' || !currentCategory.value) {
    return cards.value.filter(c => !c.category || c.category === 'home' || c.category === 'all')
  }
  return cards.value.filter(c => c.category === currentCategory.value)
})

// 分页后的卡片
const paginatedCards = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return currentCards.value.slice(start, start + itemsPerPage)
})

// 总页数（「+ 添加卡片」快捷卡算作最后一张卡片，故总数 +1）
const totalPages = computed(() => {
  return Math.ceil((currentCards.value.length + 1) / itemsPerPage)
})

// 「+ 添加卡片」卡作为最后一张卡片：其位置索引 = 真实卡片数，
// 仅当它落在区间 [start, start+itemsPerPage) 内时才显示在当前页。
// 例：24 张真实卡片 → 该卡为第 25 个 → 落在第 2 页第 1 位。
const showAddCardOnCurrentPage = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const addIndex = currentCards.value.length
  return addIndex >= start && addIndex < start + itemsPerPage
})

// 是否显示翻页控件：仅当当前分类卡片数达到每页上限(24)时显示，避免空翻页条
const showPagination = computed(() => {
  return currentCards.value.length >= itemsPerPage
})

// 加载数据
async function loadData() {
  // 加载分类 - 主页固定使用本地默认分类(我的主页/AI工具/...)
  // 不使用 API 返回的 software/learning 等分类(那些是分类页用的)
  if (categories.value.length === 0) {
    loadDefaultCategories()
  }

  // 1. 加载全局默认卡片（只读），作为所有分类的基底
  const defaultsMap = {} // category -> 卡片数组
  try {
    const cardsRes = await api.get('/api/default-cards')
    const cardsData = cardsRes.data || cardsRes
    if (Array.isArray(cardsData)) {
      // 兼容旧版扁平数组格式
      cardsData.forEach(card => {
        if (card && card.id) {
          const cat = card.category || 'home'
          ;(defaultsMap[cat] = defaultsMap[cat] || []).push(card)
        }
      })
    } else if (cardsData && typeof cardsData === 'object') {
      Object.entries(cardsData).forEach(([cat, cardList]) => {
        if (cat === '_categories' || !Array.isArray(cardList)) return
        defaultsMap[cat] = cardList.map(card => ({ ...card, category: cat }))
      })
    }
  } catch (e) {
    console.warn('从远程加载默认卡片失败:', e)
  }
  // 记录默认卡片快照，供 saveCards 做差异保存
  defaultsSnapshot = {}
  Object.entries(defaultsMap).forEach(([cat, list]) => {
    defaultsSnapshot[cat] = JSON.stringify(list.map(({ category, ...rest }) => rest))
  })

  // 2. 已登录：默认卡片为基底 + 用户覆盖（后台修改默认卡片即时同步；用户自己改/增/删的保留）
  if (localStorage.getItem('token')) {
    try {
      const userRes = await api.get('/api/user/cards')
      const userData = userRes.data || userRes
      if (userData && typeof userData === 'object') {
        // 恢复账户里的自定义分类（存在特殊键 _categories）
        if (Array.isArray(userData._categories) && userData._categories.length > 0) {
          categories.value = userData._categories
          if (!categories.value.find(c => c.id === currentCategory.value)) {
            currentCategory.value = categories.value[0]?.id || 'home'
          }
        }
        const stripCat = (c) => { const { category, ...r } = c; return r }
        // 默认卡片作为基底
        const merged = {}
        Object.keys(defaultsMap).forEach(cat => { merged[cat] = defaultsMap[cat].map(c => ({ ...c })) })
        // 逐分类把用户数据叠加到默认上
        Object.keys(userData).forEach(cat => {
          if (cat === '_categories') return
          const val = userData[cat]
          if (Array.isArray(val)) {
            // 旧版全量快照：按卡片 id 合并到当前默认（采用后台新增/修改，保留用户增改）
            const userById = {}
            val.forEach(c => { if (c && c.id) userById[c.id] = c })
            const defList = defaultsMap[cat] || []
            const defById = {}
            defList.forEach(c => { defById[c.id] = c })
            const result = []
            defList.forEach(dc => {
              const u = userById[dc.id]
              if (u && JSON.stringify(stripCat(u)) !== JSON.stringify(stripCat(dc))) {
                result.push({ ...u, category: cat }) // 用户改过 → 用用户的
              } else {
                result.push({ ...dc, category: cat }) // 未改/后台已更新 → 用默认
              }
            })
            val.forEach(uc => { if (uc && uc.id && !defById[uc.id]) result.push({ ...uc, category: cat }) }) // 用户新增
            merged[cat] = result
          } else if (val && typeof val === 'object') {
            // 新版覆盖格式 { added:[], edited:{}, deleted:[] }
            let list = (defaultsMap[cat] || []).map(c => ({ ...c }))
            if (Array.isArray(val.deleted)) list = list.filter(c => !val.deleted.includes(c.id))
            if (val.edited && typeof val.edited === 'object') {
              list = list.map(c => val.edited[c.id] ? { ...val.edited[c.id], category: cat } : c)
            }
            if (Array.isArray(val.added)) val.added.forEach(a => list.push({ ...a, category: cat }))
            merged[cat] = list
          }
        })
        cards.value = Object.values(merged).flat()
        await saveCards() // 归一化为干净覆盖格式，保证后续后台更新持续同步
        return
      }
    } catch (e) {
      console.warn('加载账户卡片失败（可能登录已过期）:', e)
    }

    // 3. 账户云端无数据：迁移 localStorage 历史遗留数据（与默认合并成完整快照后上传）
    const localCards = localStorage.getItem('user_custom_cards')
    if (localCards) {
      try {
        const parsed = JSON.parse(localCards)
        const userMap = {}
        if (Array.isArray(parsed)) {
          parsed.forEach(card => {
            if (card && card.id) {
              const cat = card.category || 'home'
              ;(userMap[cat] = userMap[cat] || []).push(card)
            }
          })
        } else if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([cat, cardList]) => {
            if (cat === '_categories' || !Array.isArray(cardList)) return
            userMap[cat] = cardList.map(card => ({ ...card, category: cat }))
          })
        }
        if (Object.keys(userMap).length > 0) {
          const merged = { ...defaultsMap }
          Object.entries(userMap).forEach(([cat, list]) => { merged[cat] = list })
          cards.value = Object.values(merged).flat()
          await saveCards() // 完整快照上传到当前账户
          localStorage.removeItem('user_custom_cards') // 迁移完成，清除本地遗留
          return
        }
      } catch (e) {
        console.warn('解析本地自定义卡片失败:', e)
      }
    }
  }

  // 4. 未登录 / 账户无数据：使用全局默认卡片
  if (Object.keys(defaultsMap).length > 0) {
    cards.value = Object.values(defaultsMap).flat()
    return
  }
  // 5. fallback: 本地默认数据
  loadDefaultData()
}

// 仅加载分类标签(主页专用)
function loadDefaultCategories() {
  categories.value = [
    { id: 'home', name: '我的主页' },
    { id: 'ai', name: 'AI工具' },
    { id: 'cloud', name: '云服务' },
    { id: 'container', name: '容器' },
    { id: 'software', name: '软件' },
    { id: 'tools', name: '工具' },
    { id: 'learning', name: '学习' },
    { id: 'mail', name: '邮件与域名' }
  ]
  if (!currentCategory.value || !categories.value.find(c => c.id === currentCategory.value)) {
    currentCategory.value = 'home'
  }
}

// 默认数据
function loadDefaultData() {
  categories.value = [
    { id: 'home', name: '我的主页' },
    { id: 'ai', name: 'AI工具' },
    { id: 'cloud', name: '云服务' },
    { id: 'container', name: '容器' },
    { id: 'software', name: '软件' },
    { id: 'tools', name: '工具' },
    { id: 'learning', name: '学习' },
    { id: 'mail', name: '邮件与域名' }
  ]
  currentCategory.value = 'home'

  // 完整默认卡片数据
  cards.value = [
    // home 分类
    { id: 'h1', category: 'home', icon: '🔔', name: 'Notification', url: 'https://notification.eooce.xx.kg/' },
    { id: 'h2', category: 'home', icon: '📺', name: 'Youtube', url: 'https://www.youtube.com/' },
    { id: 'h3', category: 'home', icon: '📧', name: 'Gmail', url: 'https://mail.google.com/' },
    { id: 'h4', category: 'home', icon: '💻', name: 'GitHub', url: 'https://github.com/' },
    { id: 'h5', category: 'home', icon: '🌐', name: 'ip.sb', url: 'https://ip.ssss.nyc.mn/' },
    { id: 'h6', category: 'home', icon: '☁️', name: 'Cloudflare', url: 'https://dash.cloudflare.com/' },
    { id: 'h7', category: 'home', icon: '🤖', name: '自动访问系统', url: 'https://matte.ct8.pl/' },
    { id: 'h8', category: 'home', icon: '🤗', name: 'Huggingface', url: 'https://huggingface.co/' },
    { id: 'h9', category: 'home', icon: '📡', name: 'ITDOG', url: 'https://www.itdog.cn/tcping' },
    { id: 'h10', category: 'home', icon: '📍', name: 'Ping0', url: 'https://ping0.cc/' },
    { id: 'h11', category: 'home', icon: '🔍', name: '浏览器指纹', url: 'https://www.browserscan.net/zh' },
    { id: 'h12', category: 'home', icon: '📊', name: 'nezha面板', url: 'https://ssss.nyc.mn/' },
    { id: 'h13', category: 'home', icon: '🧪', name: 'Api测试', url: 'https://hoppscotch.io/' },
    { id: 'h14', category: 'home', icon: '🔎', name: '域名检查', url: 'https://who.cx/' },
    { id: 'h15', category: 'home', icon: '💰', name: '域名比价', url: 'https://www.nazhumi.com/' },
    { id: 'h16', category: 'home', icon: '🖥️', name: 'NodeSeek', url: 'https://www.nodeseek.com/' },
    { id: 'h17', category: 'home', icon: '🐧', name: 'Linux do', url: 'https://linux.do/' },
    { id: 'h18', category: 'home', icon: '🎵', name: '在线音乐', url: 'https://music.eooce.com/' },
    { id: 'h19', category: 'home', icon: '📍', name: 'Nodeloc', url: 'https://www.nodeloc.com/' },
    { id: 'h20', category: 'home', icon: '📺', name: 'Moontv', url: 'https://moontv.cfapps.jp10.hana.ondemand.com/' },
    { id: 'h21', category: 'home', icon: '🔄', name: '订阅转换', url: 'https://sublink.eooce.com/' },
    { id: 'h22', category: 'home', icon: '⌨️', name: 'webssh', url: 'https://ssh.eooce.com/' },
    { id: 'h23', category: 'home', icon: '📦', name: '文件快递柜', url: 'https://filebox.nnuu.nyc.mn/' },
    { id: 'h24', category: 'home', icon: '🏠', name: '真实地址生成', url: 'https://address.nnuu.nyc.mn/' },
    // AI工具分类
    { id: 'a1', category: 'ai', icon: '🤖', name: 'ChatGPT', url: 'https://chat.openai.com/' },
    { id: 'a2', category: 'ai', icon: '🧠', name: 'Claude', url: 'https://claude.ai/' },
    { id: 'a3', category: 'ai', icon: '🔮', name: 'Deepseek', url: 'https://www.deepseek.com/' },
    { id: 'a4', category: 'ai', icon: '✨', name: 'Google Gemini', url: 'https://gemini.google.com/' },
    { id: 'a5', category: 'ai', icon: '💬', name: '阿里千问', url: 'https://tongyi.aliyun.com/' },
    { id: 'a6', category: 'ai', icon: '🌙', name: 'Kimi', url: 'https://kimi.moonshot.cn/' },
    { id: 'a7', category: 'ai', icon: '❓', name: '问小白', url: 'https://www.wenxiaobai.com/' },
    { id: 'a8', category: 'ai', icon: '⚡', name: 'Genspark', url: 'https://www.genspark.ai/' },
    { id: 'a9', category: 'ai', icon: '💬', name: 'AkashChat', url: 'https://chat.akash.network/' },
    { id: 'a10', category: 'ai', icon: '🎨', name: 'V0', url: 'https://v0.dev/' },
    { id: 'a11', category: 'ai', icon: '🔗', name: 'Same', url: 'https://same.com/' },
    { id: 'a12', category: 'ai', icon: '🐱', name: '喵爪aiSnap', url: 'https://aisnap.miaozhua.com/' },
    { id: 'a13', category: 'ai', icon: '📚', name: 'Readdy', url: 'https://readdy.ai/' },
    { id: 'a14', category: 'ai', icon: '🚪', name: 'Openrouter', url: 'https://openrouter.ai/' },
    { id: 'a15', category: 'ai', icon: '✋', name: 'Manus', url: 'https://manus.im/' },
    { id: 'a16', category: 'ai', icon: '🔍', name: 'Perplexity', url: 'https://www.perplexity.ai/' },
    { id: 'a17', category: 'ai', icon: '🌪️', name: 'Grok', url: 'https://grok.com/' },
    { id: 'a18', category: 'ai', icon: '👨‍💻', name: 'Copilot', url: 'https://github.com/features/copilot' },
    { id: 'a19', category: 'ai', icon: '🫘', name: '豆包', url: 'https://www.doubao.com/' },
    { id: 'a20', category: 'ai', icon: '💡', name: '文心一言', url: 'https://yiyan.baidu.com/' },
    { id: 'a21', category: 'ai', icon: '🤖', name: 'Jules', url: 'https://jules.ai/' },
    { id: 'a22', category: 'ai', icon: '🧪', name: '硅基流动', url: 'https://siliconflow.cn/' },
    { id: 'a23', category: 'ai', icon: '📝', name: 'Kilo Code', url: 'https://kilocode.com/' },
    { id: 'a24', category: 'ai', icon: '📭', name: 'Cursor', url: 'https://cursor.sh/' },
    // 云服务分类
    { id: 'c1', category: 'cloud', icon: '☁️', name: '阿里云', url: 'https://www.aliyun.com/' },
    { id: 'c2', category: 'cloud', icon: '☁️', name: '腾讯云', url: 'https://cloud.tencent.com/' },
    { id: 'c3', category: 'cloud', icon: '🏛️', name: '甲骨文云', url: 'https://www.oracle.com/cloud/' },
    { id: 'c4', category: 'cloud', icon: '🌐', name: '亚马逊云', url: 'https://aws.amazon.com/' },
    { id: 'c5', category: 'cloud', icon: '🐳', name: 'DigitalOcean', url: 'https://www.digitalocean.com/' },
    { id: 'c6', category: 'cloud', icon: '💻', name: 'Vultr', url: 'https://www.vultr.com/' },
    { id: 'c7', category: 'cloud', icon: '🔷', name: '谷歌云', url: 'https://cloud.google.com/' },
    { id: 'c8', category: 'cloud', icon: '🟦', name: 'Azure', url: 'https://azure.microsoft.com/' },
    { id: 'c9', category: 'cloud', icon: '🐧', name: 'Linode', url: 'https://www.linode.com/' },
    { id: 'c10', category: 'cloud', icon: '☁️', name: 'Cloudcone', url: 'https://cloudcone.com/' },
    { id: 'c11', category: 'cloud', icon: '🎯', name: 'Dartnode', url: 'https://dartnode.com/' },
    { id: 'c12', category: 'cloud', icon: '🌏', name: 'DMIT', url: 'https://www.dmit.io/' },
    { id: 'c13', category: 'cloud', icon: '🚂', name: 'Bandwagonhost', url: 'https://bandwagonhost.com/' },
    // 容器分类
    { id: 'd1', category: 'container', icon: '🐳', name: 'Docker Hub', url: 'https://hub.docker.com/' },
    { id: 'd2', category: 'container', icon: '📦', name: 'Portainer', url: 'https://www.portainer.io/' },
    { id: 'd3', category: 'container', icon: '🌐', name: 'Kubernetes', url: 'https://kubernetes.io/' },
    { id: 'd4', category: 'container', icon: '⭐', name: 'Rancher', url: 'https://rancher.com/' },
    { id: 'd5', category: 'container', icon: '☁️', name: 'Helm', url: 'https://helm.sh/' },
    { id: 'd6', category: 'container', icon: '🔄', name: 'Traefik', url: 'https://traefik.io/' },
    { id: 'd7', category: 'container', icon: '🔒', name: 'HashiCorp', url: 'https://www.hashicorp.com/' },
    { id: 'd8', category: 'container', icon: '📝', name: 'Nginx', url: 'https://nginx.org/' },
    { id: 'd9', category: 'container', icon: '📊', name: 'Grafana', url: 'https://grafana.com/' },
    { id: 'd10', category: 'container', icon: '🔥', name: 'Prometheus', url: 'https://prometheus.io/' },
    { id: 'd11', category: 'container', icon: '🎯', name: 'Istio', url: 'https://istio.io/' },
    { id: 'd12', category: 'container', icon: '🌐', name: 'Caddy', url: 'https://caddyserver.com/' },
    // 软件分类
    { id: 's1', category: 'software', icon: '💻', name: 'VS Code', url: 'https://code.visualstudio.com/' },
    { id: 's2', category: 'software', icon: '📝', name: 'Notion', url: 'https://www.notion.so/' },
    { id: 's3', category: 'software', icon: '📦', name: 'Everything', url: 'https://www.voidtools.com/' },
    { id: 's4', category: 'software', icon: '🎵', name: 'Spotify', url: 'https://open.spotify.com/' },
    { id: 's5', category: 'software', icon: '🖼', name: 'OBS Studio', url: 'https://obsproject.com/' },
    { id: 's6', category: 'software', icon: '🎬', name: 'Shotcut', url: 'https://shotcut.org/' },
    { id: 's7', category: 'software', icon: '🎨', name: 'Figma', url: 'https://www.figma.com/' },
    { id: 's8', category: 'software', icon: '📱', name: 'Telegram', url: 'https://telegram.org/' },
    { id: 's9', category: 'software', icon: '💬', name: 'Discord', url: 'https://discord.com/' },
    { id: 's10', category: 'software', icon: '🔐', name: '1Password', url: 'https://1password.com/' },
    { id: 's11', category: 'software', icon: '📊', name: 'TablePlus', url: 'https://tableplus.com/' },
    { id: 's12', category: 'software', icon: '🔧', name: 'Postman', url: 'https://www.postman.com/' },
    // 工具分类
    { id: 't1', category: 'tools', icon: '🎨', name: 'Remove.bg', url: 'https://www.remove.bg/' },
    { id: 't2', category: 'tools', icon: '📐', name: 'TinyPNG', url: 'https://tinypng.com/' },
    { id: 't3', category: 'tools', icon: '🎨', name: 'Coolors', url: 'https://coolors.co/' },
    { id: 't4', category: 'tools', icon: '📊', name: 'Excalidraw', url: 'https://excalidraw.com/' },
    { id: 't5', category: 'tools', icon: '📝', name: 'Carbon', url: 'https://carbon.now.sh/' },
    { id: 't6', category: 'tools', icon: '🎨', name: 'Unsplash', url: 'https://unsplash.com/' },
    { id: 't7', category: 'tools', icon: '🔤', name: 'Google Fonts', url: 'https://fonts.google.com/' },
    { id: 't8', category: 'tools', icon: '🎨', name: 'Iconfont', url: 'https://www.iconfont.cn/' },
    { id: 't9', category: 'tools', icon: '📱', name: 'Canva', url: 'https://www.canva.com/' },
    { id: 't10', category: 'tools', icon: '🎨', name: 'Dribbble', url: 'https://dribbble.com/' },
    { id: 't11', category: 'tools', icon: '📝', name: 'Notion', url: 'https://www.notion.so/' },
    { id: 't12', category: 'tools', icon: '🔧', name: 'Regex101', url: 'https://regex101.com/' },
    // 学习分类
    { id: 'l1', category: 'learning', icon: '📚', name: 'Coursera', url: 'https://www.coursera.org/' },
    { id: 'l2', category: 'learning', icon: '🎓', name: 'edX', url: 'https://www.edx.org/' },
    { id: 'l3', category: 'learning', icon: '💻', name: 'freeCodeCamp', url: 'https://www.freecodecamp.org/' },
    { id: 'l4', category: 'learning', icon: '📖', name: 'MDN Web Docs', url: 'https://developer.mozilla.org/' },
    { id: 'l5', category: 'learning', icon: '🎨', name: 'W3Schools', url: 'https://www.w3schools.com/' },
    { id: 'l6', category: 'learning', icon: '🔧', name: 'Stack Overflow', url: 'https://stackoverflow.com/' },
    { id: 'l7', category: 'learning', icon: '📚', name: 'GitHub Docs', url: 'https://docs.github.com/' },
    { id: 'l8', category: 'learning', icon: '🎓', name: 'Udemy', url: 'https://www.udemy.com/' },
    { id: 'l9', category: 'learning', icon: '💻', name: 'Codecademy', url: 'https://www.codecademy.com/' },
    { id: 'l10', category: 'learning', icon: '📖', name: 'Khan Academy', url: 'https://www.khanacademy.org/' },
    { id: 'l11', category: 'learning', icon: '🎨', name: 'Dribbble', url: 'https://dribbble.com/' },
    { id: 'l12', category: 'learning', icon: '📚', name: 'Behance', url: 'https://www.behance.net/' },
    // 邮件与域名分类
    { id: 'm1', category: 'mail', icon: '📧', name: 'Gmail', url: 'https://mail.google.com/' },
    { id: 'm2', category: 'mail', icon: '📧', name: 'Outlook', url: 'https://outlook.live.com/' },
    { id: 'm3', category: 'mail', icon: '📧', name: 'ProtonMail', url: 'https://proton.me/mail' },
    { id: 'm4', category: 'mail', icon: '📧', name: 'Yahoo Mail', url: 'https://mail.yahoo.com/' },
    { id: 'm5', category: 'mail', icon: '📧', name: 'QQ邮箱', url: 'https://mail.qq.com/' },
    { id: 'm6', category: 'mail', icon: '📧', name: '163邮箱', url: 'https://mail.163.com/' },
    { id: 'm7', category: 'mail', icon: '🌐', name: 'Namecheap', url: 'https://www.namecheap.com/' },
    { id: 'm8', category: 'mail', icon: '🌐', name: 'GoDaddy', url: 'https://www.godaddy.com/' },
    { id: 'm9', category: 'mail', icon: '🌐', name: 'Cloudflare', url: 'https://dash.cloudflare.com/' },
    { id: 'm10', category: 'mail', icon: '🌐', name: 'Namesilo', url: 'https://www.namesilo.com/' },
    { id: 'm11', category: 'mail', icon: '🔍', name: 'WHOIS', url: 'https://whois.domaintools.com/' },
    { id: 'm12', category: 'mail', icon: '🔧', name: 'MXToolbox', url: 'https://mxtoolbox.com/' }
  ]
}

// 切换分类
function switchCategory(catId) {
  currentCategory.value = catId
  currentPage.value = 1
}

// 卡片右键菜单
function onCardRightClick(e, card) {
  cardContextMenu.value = { show: true, x: e.clientX, y: e.clientY, card }
}

// 分类右键菜单
function onCategoryRightClick(e, cat) {
  catContextMenu.value = { show: true, x: e.clientX, y: e.clientY, cat }
}

// 关闭菜单
function closeMenus() {
  cardContextMenu.value.show = false
  catContextMenu.value.show = false
}

// 编辑卡片
function editCard(card) {
  if (!requireLogin()) return
  editingCard.value = card
  cardForm.value = { ...card }
  closeMenus()
}

// 删除卡片
async function deleteCard(card) {
  if (!requireLogin()) return
  if (!confirm(`确定删除 "${card.name}" 吗?`)) return
  cards.value = cards.value.filter(c => c.id !== card.id)
  await saveCards()
  closeMenus()
}

// 保存卡片
async function saveCard() {
  if (!requireLogin()) return
  if (!cardForm.value.name || !cardForm.value.url) {
    alert('请填写名称和链接')
    return
  }

  if (editingCard.value) {
    const idx = cards.value.findIndex(c => c.id === editingCard.value.id)
    if (idx > -1) {
      cards.value[idx] = { ...editingCard.value, ...cardForm.value }
    }
  } else {
    const newCard = {
      id: 'c_' + Date.now(),
      category: currentCategory.value,
      ...cardForm.value
    }
    cards.value.push(newCard)
  }

  await saveCards()
  closeCardModal()
}

// 关闭卡片弹窗
function closeCardModal() {
  showAddCard.value = false
  editingCard.value = null
  cardForm.value = { name: '', icon: '', url: '' }
}

// 编辑分类
function editCategory(cat) {
  if (!requireLogin()) return
  editingCategory.value = cat
  catForm.value = { name: cat.name }
  closeMenus()
}

// 删除分类
async function deleteCategory(cat) {
  if (!requireLogin()) return
  if (!confirm(`确定删除分类 "${cat.name}" 吗?该分类下的卡片也将被删除。`)) return
  categories.value = categories.value.filter(c => c.id !== cat.id)
  cards.value = cards.value.filter(c => c.category !== cat.id)
  if (currentCategory.value === cat.id) {
    currentCategory.value = categories.value[0]?.id || ''
  }
  await saveCategories()
  await saveCards()
  closeMenus()
}

// 保存分类
async function saveCategory() {
  if (!requireLogin()) return
  if (!catForm.value.name) {
    alert('请填写分类名称')
    return
  }

  if (editingCategory.value) {
    const idx = categories.value.findIndex(c => c.id === editingCategory.value.id)
    if (idx > -1) {
      categories.value[idx].name = catForm.value.name
    }
  } else {
    const newCat = {
      id: 'cat_' + Date.now(),
      name: catForm.value.name
    }
    categories.value.push(newCat)
    currentCategory.value = newCat.id
  }

  await saveCategories()
  closeCatModal()
}

// 关闭分类弹窗
function closeCatModal() {
  showAddCategory.value = false
  editingCategory.value = null
  catForm.value = { name: '' }
}

// 各分类默认卡片的快照（JSON 字符串，用于差异比较：只把用户改过的分类存进账户，
// 未修改的分类不落库，这样后台更新默认卡片后用户依然能看到）
let defaultsSnapshot = {}

// 保存卡片：仅登录用户。写入自己账户（/api/user/cards 按用户隔离）。
// 只保存与后台默认有差异的分类（未改动的分类不写，后台更新默认时能同步到用户端）。
async function saveCards() {
  if (!isLoggedIn()) return
  try {
    const stripCat = (c) => { const { category, ...r } = c; return r }
    const currentByCat = {}
    cards.value.forEach(c => {
      const cat = c.category || 'home'
      ;(currentByCat[cat] = currentByCat[cat] || []).push(stripCat(c))
    })
    const defMapByCat = {}
    Object.entries(defaultsSnapshot).forEach(([cat, str]) => {
      const arr = JSON.parse(str)
      const m = {}
      arr.forEach(c => { m[c.id] = c })
      defMapByCat[cat] = m
    })
    const allCats = new Set([...Object.keys(currentByCat), ...Object.keys(defaultsSnapshot)])
    for (const cat of allCats) {
      const cur = currentByCat[cat] || []
      const defMap = defMapByCat[cat] || {}
      // 与默认完全一致 → 跳过，保持跟随后台默认更新
      if (JSON.stringify(cur) === JSON.stringify(Object.values(defMap))) continue
      // 后端要求 cards 为数组，直接存当前该分类的完整卡片数组
      await api.put('/api/user/cards', { category: cat, cards: cur })
    }
  } catch (e) {
    console.error('保存卡片失败:', e)
    alert('保存卡片失败: ' + e.message)
  }
}

// 保存分类：仅登录用户，存到自己账户（user_cards 特殊键 _categories），不写全局 /api/categories
async function saveCategories() {
  if (!isLoggedIn()) return
  try {
    await api.put('/api/user/cards', { category: '_categories', cards: categories.value })
  } catch (e) {
    console.error('保存分类失败:', e)
  }
}

// 拖拽排序
function onDragStart(e, card) {
  if (!isLoggedIn()) {
    e.preventDefault()
    e.dataTransfer.effectAllowed = 'none'
    alert('拖拽排序需要先登录')
    return
  }
  draggedCard.value = card
  e.dataTransfer.effectAllowed = 'move'
}

function onDrop(e, targetCard) {
  if (!draggedCard.value || draggedCard.value.id === targetCard.id) return

  const fromIdx = cards.value.findIndex(c => c.id === draggedCard.value.id)
  const toIdx = cards.value.findIndex(c => c.id === targetCard.id)

  if (fromIdx > -1 && toIdx > -1) {
    const [moved] = cards.value.splice(fromIdx, 1)
    cards.value.splice(toIdx, 0, moved)
    saveCards()
  }
}

function onDragEnd() {
  draggedCard.value = null
}

// 搜索处理
async function handleSearch() {
  const query = searchQuery.value.trim()
  if (!query) return

  if (currentEngine.value === 'google') {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank')
  } else if (currentEngine.value === 'baidu') {
    window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(query)}`, '_blank')
  } else if (currentEngine.value === 'bing') {
    window.open(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, '_blank')
  } else if (currentEngine.value === 'github') {
    window.open(`https://github.com/search?q=${encodeURIComponent(query)}`, '_blank')
  } else if (currentEngine.value === 'local') {
    await doLocalSearch(query)
  }
}

async function doLocalSearch(query) {
  isSearching.value = true
  showLocalResults.value = true
  try {
    const data = await api.searchResources(query)
    localResults.value = Array.isArray(data) ? data : (data.data || [])
  } catch (error) {
    console.error('站内搜索失败:', error)
    localResults.value = []
  } finally {
    isSearching.value = false
  }
}

function closeLocalSearch() {
  showLocalResults.value = false
  localResults.value = []
}

function goToDetail(resource) {
  router.push(`/detail/${resource.id}`)
}

function openCard(card) {
  if (card.url) {
    window.open(card.url, '_blank')
  }
}

// 点击外部关闭菜单
function onClickOutside(e) {
  if (!e.target.closest('.context-menu')) {
    closeMenus()
  }
}

// 卡片名称自适应：CSS 已限制最多两行（line-clamp:2），
// 两行仍放不下时（scrollHeight > clientHeight）逐级缩小字号直至放下或到达最小字号
const CARD_NAME_MIN_FONT = 10 // 最小字号 px
function fitCardNames() {
  document.querySelectorAll('.card-name').forEach(el => {
    el.style.fontSize = '' // 先重置，恢复 CSS 基准字号（桌面 14px / 移动 12px）
    let size = parseFloat(getComputedStyle(el).fontSize)
    let guard = 0 // 防御性上限，避免极端死循环
    while (el.scrollHeight > el.clientHeight + 1 && size > CARD_NAME_MIN_FONT && guard < 16) {
      size = Math.max(CARD_NAME_MIN_FONT, size - 0.5)
      el.style.fontSize = size + 'px'
      guard++
    }
  })
}

// 窗口尺寸变化时防抖重算
let fitTimer = null
function onWindowResize() {
  clearTimeout(fitTimer)
  fitTimer = setTimeout(fitCardNames, 200)
}

onMounted(() => {
  loadData()
  document.addEventListener('click', onClickOutside)
  window.addEventListener('resize', onWindowResize)
  nextTick(fitCardNames)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  window.removeEventListener('resize', onWindowResize)
  clearTimeout(fitTimer)
})

// 卡片数据/翻页/分类切换后重算字号
watch([paginatedCards, currentPage], () => nextTick(fitCardNames))

// 监听分类变化重置页码
watch(currentCategory, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.home {
  padding: 40px 20px 20px;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 48px;
}

/* 搜索引擎切换 */
.search-engine-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.engine-tab {
  padding: 6px 18px;
  background: rgba(20, 25, 35, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  border-radius: 50px;
  transition: all 0.2s;
  backdrop-filter: blur(12px);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.engine-tab:hover { color: #e6edf3; }

.engine-tab.active {
  color: #fff;
  background: rgba(59, 130, 246, 0.18);
  border-color: rgba(59, 130, 246, 0.4);
  font-weight: 600;
}

/* 搜索框 */
.search-box {
  display: flex;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  background: rgba(20, 25, 35, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.search-input {
  flex: 1;
  padding: 14px 22px;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 15px;
  outline: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-btn {
  width: 56px;
  background: transparent;
  border: none;
  color: #8b949e;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover { color: #fff; }

/* 站内搜索结果 */
.local-search-results {
  margin-top: 20px;
  background: rgba(28, 33, 40, 0.8);
  border: 1px solid rgba(48, 54, 61, 0.6);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(12px);
}

.search-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(48, 54, 61, 0.6);
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

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

/* 分类标签 */
.category-section {
  margin-bottom: 28px;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.cat-tab {
  padding: 10px 22px;
  background: rgba(20, 25, 35, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.cat-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(59, 130, 246, 0.4);
}

.cat-tab.active {
  background: rgba(59, 130, 246, 0.25);
  border-color: rgba(59, 130, 246, 0.6);
  color: #fff;
  font-weight: 600;
}

.add-cat-btn {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  font-weight: 600;
}

/* 快捷卡片网格 */
.shortcut-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(6, 220px);
  gap: 14px;
  width: 100%;
  max-width: 1390px;
  justify-content: center;
  justify-items: stretch;
  align-content: start; /* 行不拉伸：稀疏页(如翻到第2页只有1张)卡片保持原高，空白留在底部 */
  /* 预留满 4 排(24张/6列)高度，使翻页按钮始终固定在第四排下方，不随当前页卡片数量上移 */
  min-height: 402px; /* 4*90 + 3*14 */
}

/* 固定卡片宽度 220px，按视口宽度减少列数（保证不溢出、始终 220px） */
/* 各断点同步预留「满页行数」高度，翻页位置恒定：行数 = ceil(24/列数) */
@media (max-width: 1389px) { .shortcut-grid { grid-template-columns: repeat(5, 220px); min-height: 506px; } } /* 5排: 5*90+4*14 */
@media (max-width: 1155px) { .shortcut-grid { grid-template-columns: repeat(4, 220px); min-height: 610px; } } /* 6排: 6*90+5*14 */
@media (max-width: 921px)  { .shortcut-grid { grid-template-columns: repeat(3, 220px); min-height: 818px; } } /* 8排: 8*90+7*14 */
@media (max-width: 687px)  { .shortcut-grid { grid-template-columns: repeat(2, 220px); min-height: 1234px; } } /* 12排: 12*90+11*14 */

.shortcut-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  padding: 14px 18px;
  background: rgba(20, 25, 35, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-height: 90px;
  min-width: 0;
}

.shortcut-card:hover {
  transform: translateY(-4px);
  background: rgba(30, 35, 50, 0.4);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
}

.shortcut-card.dragging {
  opacity: 0.5;
}

.add-card {
  background: rgba(59, 130, 246, 0.1);
  border-style: dashed;
  border-color: rgba(59, 130, 246, 0.4);
}

.add-card:hover {
  background: rgba(59, 130, 246, 0.2);
}

.card-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}

.card-icon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 8px;
}

.add-icon {
  font-size: 24px;
  color: #3b82f6;
  font-weight: 300;
}

.card-name {
  font-size: 14px;
  color: #ffffff;
  text-align: left;
  overflow: hidden;
  font-weight: 600;
  flex: 1;
  min-width: 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  line-height: 1.4;
  /* 最多显示两行 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  /* 永远不在单词内部断行：
     多个单词在空格处自然换行；
     单个单词过长不拆断，由 JS fitCardNames() 自适应缩小字号 */
  word-break: normal;
  overflow-wrap: normal;
}

/* 分页：置于卡片网格正常文档流中，因网格已预留满 4 排高度，翻页条恒定在第四排下方 30px 居中 */
.pagination {
  position: relative;
  margin-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.page-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.1);
  color: #c9d1d9;
  font-size: 18px;
  font-family: monospace;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.page-info {
  color: #8b949e;
  font-size: 14px;
  min-width: 60px;
  text-align: center;
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: rgba(28, 33, 40, 0.95);
  border: 1px solid rgba(48, 54, 61, 0.8);
  border-radius: 12px;
  padding: 8px 0;
  min-width: 140px;
  z-index: 1000;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.menu-item {
  padding: 10px 16px;
  color: #c9d1d9;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.menu-item:hover {
  background: rgba(59, 130, 246, 0.2);
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal {
  background: rgba(22, 27, 34, 0.95);
  border: 1px solid rgba(48, 54, 61, 0.8);
  border-radius: 20px;
  padding: 28px;
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(16px);
}

.modal h3 {
  color: #f0f6fc;
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
}

.modal-input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #e6edf3;
  font-size: 15px;
  margin-bottom: 12px;
  outline: none;
  transition: border-color 0.2s;
}

.modal-input:focus {
  border-color: #3b82f6;
}

.modal-input::placeholder {
  color: #6e7681;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.modal-actions button {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #8b949e;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px;
  color: #6e7681;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .home {
    padding: 16px;
  }

  .search-box {
    max-width: 100%;
  }

  .shortcut-card {
    padding: 20px 12px;
    min-height: 100px;
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
  }

  /* 移动端卡片高 100px：2列共12排 = 12*100 + 11*14，翻页位置恒定 */
  .shortcut-grid {
    min-height: 1354px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 28px;
  }

  .card-name {
    font-size: 12px;
  }

  .category-tabs {
    gap: 8px;
  }

  .cat-tab {
    padding: 8px 14px;
    font-size: 13px;
  }

  .resource-grid {
    grid-template-columns: 1fr;
  }
}
</style>

