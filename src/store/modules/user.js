import { getToken, setToken, removeToken } from '@/utils/auth'
import { login } from '@/api/user'
const state = {
  token: getToken() // 设置token为共享状态,一初始化vuex的时候就从缓存中读
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
  }
}
const actions = {
  async login(context, data) {
    // 调用接口
    const result = await login(data)
    // 如果为true，表示登陆成功
    context.commit('setToken', result)
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
