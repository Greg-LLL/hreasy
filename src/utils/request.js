import axios from 'axios'
import { Message } from 'element-ui'
import router from '@/router'
import store from '@/store'
import { getTimeStamp } from './auth'
const TimeOut = 3600// 定义超时时间

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 5000 // 设置超时时间
})
// 请求拦截器
service.interceptors.request.use(config => {
  // config是我们请求的配置信息
  // 注入token
  if (store.getters.token) {
    // 只有在有token的情况下，才有必要去检查时间戳
    if (IsCheckTimeOut()) {
      // 如果它为ture 过期了
      // token没用了，因为超时了
      store.dispatch('user/logout') // 登出操作
      // 跳转到登录页
      router.push('/login')
      return Promise.reject(new Error('登录超时'))
    }
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
  // error信息里面有response对象
  if (error.response && error.response.data && error.response.data.code === 10002) {
    // 当等于10002的时候 表示后端告诉我们token超时了
    store.dispatch('user/logout') // 登出action 删除token
    router.push('/login')
  } else {
    Message.error(error.message) // 提示错误信息
  }
  return Promise.reject(error) // 返回执行错误，让当前的执行链跳出成功，直接进入catch
})

// 是否超时
// 超时逻辑：当前时间减去缓存中的时间，是否大于时间差
function IsCheckTimeOut() {
  var currentTime = Date.now() // 当前时间戳
  var timestamp = getTimeStamp() // 缓存时间戳
  return (currentTime - timestamp) / 1000 > TimeOut
}
export default service
