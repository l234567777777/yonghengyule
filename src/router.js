import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './views/Home.vue'
import Category from './views/Category.vue'
import Detail from './views/Detail.vue'
import Search from './views/Search.vue'
import Profile from './views/Profile.vue'
import Login from './views/Login.vue'
import Favorites from './views/Favorites.vue'
import Convert from './views/Convert.vue'
import Movies from './views/Movies.vue'

const routes = [
  { path: '/', name: 'Home', component: Home, meta: { title: '首页' } },
  { path: '/category/:type?', name: 'Category', component: Category, meta: { title: '分类' } },
  { path: '/detail/:id', name: 'Detail', component: Detail, meta: { title: '资源详情' } },
  { path: '/search', name: 'Search', component: Search, meta: { title: '搜索' } },
  { path: '/profile', name: 'Profile', component: Profile, meta: { title: '我的', needAuth: true } },
  { path: '/login', name: 'Login', component: Login, meta: { title: '登录' } },
  { path: '/favorites', name: 'Favorites', component: Favorites, meta: { title: '我的收藏', needAuth: true } },
  { path: '/convert', name: 'Convert', component: Convert, meta: { title: '格式转换' } },
  { path: '/movies', name: 'Movies', component: Movies, meta: { title: '娱乐影视' } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 资源分享` : '资源分享'
  const token = localStorage.getItem('token')
  if (to.meta.needAuth && !token) {
    next('/login?redirect=' + to.path)
  } else {
    next()
  }
})

export default router
