import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 5000 // 设置超时时间
})
// 请求拦截器
service.interceptors.request.use(config => {
  // config是我们请求的配置信息
  // 注入token
  if (store.getters.token) {
    config.headers['Authorization'] = `Bearer ${store.getters.token}`
  }
  return config // config 是必须要返回的
}, error => {
  return Promise.reject(error)
})
// 响应拦截器
service.interceptors.response.use(response => {
  // axios 默认加了一层data
  const { success, message, data } = response.data
  if (success) {
    return data
  } else {
    //   业务已经错误了 还能进then? 不能！应该进catch
    Message.error(message) // 提示错误消息
    return Promise.reject(new Error(message))
  }
}, error => {
  Message.error(error.message) // 提示错误信息
  return Promise.reject(error) // 返回执行错误，让当前的执行链跳出成功，直接进入catch
})
export default service
