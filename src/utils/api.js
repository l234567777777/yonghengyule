const API_BASE = 'https://api.a520.cc.cd'

async function request(url, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  }
  
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
      cache: 'no-cache'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export const api = {
  // 通用方法（供 Home.vue 等页面直接调用任意端点）
  get: (url) => request(url),
  post: (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (url) => request(url, { method: 'DELETE' }),

  // 资源相关
  getResources: (params = {}) => request(`/api/resources?${new URLSearchParams(params)}`),
  getResource: (id) => request(`/api/resources/${id}`),
  searchResources: (keyword) => request(`/api/resources/search?q=${encodeURIComponent(keyword)}`),
  
  // 分类相关
  getCategories: () => request('/api/categories'),
  
  // 统计
  getStats: () => request('/api/stats'),
  
  // 用户相关
  login: (data) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  register: (data) => request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getProfile: () => request('/api/user/profile'),
  
  // 收藏相关
  getFavorites: () => request('/api/user/favorites'),
  addFavorite: (resourceId) => request('/api/user/favorites', {
    method: 'POST',
    body: JSON.stringify({ resourceId })
  }),
  removeFavorite: (resourceId) => request(`/api/user/favorites/${resourceId}`, {
    method: 'DELETE'
  }),
  
  // 电影相关
  getMovies: (params = {}) => request(`/api/movies?${new URLSearchParams(params)}`),
  getMovie: (id) => request(`/api/movies/${id}`),
  searchMovies: (keyword) => request(`/api/movies/search?q=${encodeURIComponent(keyword)}`),
  // TMDB 影视搜索（返回真实海报，用于站外资源匹配）
  searchMoviesTMDB: (query) => request('/api/movies/search', {
    method: 'POST',
    body: JSON.stringify({ query })
  })
}

export default api
