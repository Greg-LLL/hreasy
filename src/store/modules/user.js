import { getToken, setToken, removeToken } from '@/utils/auth'
import { login, getUserInfo, getUserDetailById } from '@/api/user'
const state = {
  token: getToken(), // 设置token为共享状态,一初始化vuex的时候就从缓存中读
  userInfo: {} // 这里定义一个空对象
}
const mutations = {
  setToken(state, token) {
    state.token = token // 将数据设置给vuex
    // 同步缓存
    setToken(token)
  },
  removeToken(state) {
    state.token = null // 将vuex的数据置空
    removeToken() // 同步到缓存
  },
  setUserInfo(state, result) {
    // 更新一个对象
    state.userInfo = result // 这样是响应式
  },
  removeUserInfo(state) {
    state.userInfo = {}
  }
}
const actions = {
  async login(context, data) {
    // 调用接口
    const result = await login(data)
    // 如果为true，表示登陆成功
    context.commit('setToken', result)
  },
  async getUserInfo(context) {
    const result = await getUserInfo()
    // 获取用户详情(头像)
    const baseInfo = await getUserDetailById(result.userId)
    context.commit('setUserInfo', { ...result, ...baseInfo }) // 提交到mutations
    return result // 这里是给我们后期做权限的时候留下伏笔
  },
  // 登出操作
  logout(context) {
    // 删除Token
    context.commit('removeToken')
    // 删除用户资料
    context.commit('removeUserInfo')
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
