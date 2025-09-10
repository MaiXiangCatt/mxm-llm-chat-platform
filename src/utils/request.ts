import axios from 'axios'
import { useSettingStore } from '@/stores/setting/setting'
import { ElMessage } from 'element-plus'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'

export interface CustomAxiosInstance extends AxiosInstance {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  options<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
}

const MAX_RETRIES = 3
const RETRY_DELAY = 1000
const statusMap = new Map([
  [401, 'apiKey过期'],
  [404, '请求地址错误'],
  [500, '服务器错误'],
  [503, '服务器过载'],
])

const service: CustomAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 90000,
})

service.interceptors.request.use(
  (config) => {
    const settingStore = useSettingStore()
    const apiKey = settingStore.settings.apiKey
    if (apiKey) {
      config.headers.Authorization = `Bearer ${apiKey}`
      config.headers['Content-Type'] = 'application/json'
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message)
      return Promise.reject(error)
    }

    const originalRequest = error.config
    const response = error.response
    if (originalRequest && (!response || response.status === 503)) {
      originalRequest.retryCount = originalRequest.retryCount || 0
      if (originalRequest.retryCount < MAX_RETRIES) {
        originalRequest.retryCount++
        const delay = originalRequest.retryDelay || RETRY_DELAY
        await new Promise((resolve) => setTimeout(resolve, delay))

        ElMessage({
          type: 'warning',
          message: `请求失败，正在进行第${originalRequest.retryCount}次重试`,
        })
        return service(originalRequest)
      }
    }
    if (response) {
      let message = ''
      const status = response.status
      if (statusMap.get(status)) {
        message = statusMap.get(status)!
      } else {
        message = '请求失败'
      }
      ElMessage({
        type: 'error',
        message,
      })
    }
    return Promise.reject(error)
  }
)

export default service
