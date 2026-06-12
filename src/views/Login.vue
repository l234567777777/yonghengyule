<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">📦</div>
        <h1>资源分享</h1>
        <p>登录后同步收藏数据</p>
      </div>

      <div class="form-group">
        <input
          v-model="form.username"
          type="text"
          placeholder="用户名"
          class="form-input"
        >
      </div>

      <div class="form-group">
        <input
          v-model="form.password"
          type="password"
          placeholder="密码"
          class="form-input"
        >
      </div>

      <button class="submit-btn" @click="handleLogin" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <p class="switch-text">
        还没有账号？<a @click="showRegister = true">立即注册</a>
      </p>
    </div>

    <!-- 注册弹窗 -->
    <div class="modal" v-if="showRegister" @click.self="showRegister = false">
      <div class="modal-card">
        <h3>注册账号</h3>
        <input v-model="regForm.username" type="text" placeholder="用户名" class="form-input">
        <input v-model="regForm.password" type="password" placeholder="密码" class="form-input">
        <input v-model="regForm.confirmPassword" type="password" placeholder="确认密码" class="form-input">
        <button class="submit-btn" @click="handleRegister" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../utils/api'

const route = useRoute()
const router = useRouter()

const form = ref({ username: '', password: '' })
const regForm = ref({ username: '', password: '', confirmPassword: '' })
const loading = ref(false)
const showRegister = ref(false)

async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    alert('请填写完整信息')
    return
  }

  loading.value = true
  try {
    const data = await api.login(form.value)
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      const redirect = route.query.redirect || '/'
      router.replace(redirect)
    }
  } catch (error) {
    alert('登录失败：' + error.message)
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  if (!regForm.value.username || !regForm.value.password) {
    alert('请填写完整信息')
    return
  }
  if (regForm.value.password !== regForm.value.confirmPassword) {
    alert('两次密码不一致')
    return
  }

  loading.value = true
  try {
    await api.register(regForm.value)
    alert('注册成功，请登录')
    showRegister.value = false
  } catch (error) {
    alert('注册失败：' + error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #0d1117;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #161b22;
  border-radius: 24px;
  padding: 40px 32px;
  border: 1px solid #21262d;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 56px;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 24px;
  color: #e6edf3;
  margin-bottom: 8px;
  font-weight: 600;
}

.login-header p {
  color: #8b949e;
  font-size: 15px;
}

.form-group {
  margin-bottom: 16px;
}

.form-input {
  width: 100%;
  padding: 16px 18px;
  background: #1c2128;
  border: 1px solid #30363d;
  border-radius: 14px;
  color: #e6edf3;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #3b82f6;
}

.form-input::placeholder {
  color: #6e7681;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 10px;
  transition: opacity 0.2s;
}

.submit-btn:disabled {
  opacity: 0.6;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.switch-text {
  margin-top: 24px;
  text-align: center;
  color: #8b949e;
  font-size: 15px;
}

.switch-text a {
  color: #3b82f6;
  cursor: pointer;
}

/* 弹窗 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 200;
}

.modal-card {
  width: 100%;
  max-width: 400px;
  background: #161b22;
  border-radius: 24px;
  padding: 32px;
  border: 1px solid #21262d;
}

.modal-card h3 {
  color: #e6edf3;
  margin-bottom: 24px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
}

.modal-card .form-input {
  margin-bottom: 14px;
}
</style>