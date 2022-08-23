import store from '@/store'
// 做一个混入对象
export default {
  // 混入对象是我们组件的选项对象
  methods: {
    //   检查权限  要么有 要么没有
    checkPermission(key) {
      // 去用户信息里面找points中有没有key 如果有key 则认为有权限 如果没有，则认为不能点击
    //   store.state.user.userInfo.roles.point
      const { userInfo } = store.state.user
      if (userInfo.roles && userInfo.roles.points) {
        return userInfo.roles.points.some(item => item === key)
      }
      //   如果没有进入if 说明没权限
      return false
    }
  }
}
