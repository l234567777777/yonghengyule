const API_BASE = 'https://resource-nav-api.xx181811.workers.dev'

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
      headers
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
  })
}

export default api