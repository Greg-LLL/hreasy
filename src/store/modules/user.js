import { getToken, setToken, removeToken, setTimeStamp } from '@/utils/auth'
import { login, getUserInfo, getUserDetailById } from '@/api/user'
import { resetRouter } from '@/router/index'
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
    context.commit('setToken', result)// 设置token
    // 拿到token说明登录成功
    setTimeStamp() // 设置当前的时间戳
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
    // 重置路由
    resetRouter() // 重置路由
    // 去设置权限模块下的路由为初始状态
    // Vuex子模块怎么调用子模块的action  都没加锁的情况下 可以随意调用
    // 不加命名空间的情况下 所有的mutations和actions都是挂在全局上的 所有可以直接调用
    // 但是加了命名空间的子模块 怎么调用另一个加了命名空间的子模块的mutations
    // 加了命名空间的context指的不是全局的context
    //  mutations名称 payload载荷 第三个参数 {root：true} 表示调用根级的mutations或actions
    context.commit('permission/setRoutes', [], { root: true })
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
