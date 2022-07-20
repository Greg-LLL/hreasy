// 权限拦截在路由跳转 导航守卫

import router from '@/router'
import store from '@/store' // 引入store实例，和组件中的this.$store是一回事
import nprogress from 'nprogress' // 引入进度条
import 'nprogress/nprogress.css' // 引入进度条样式
// 不需要导出，因为只需要让代码执行即可
// 前置守卫
// next是前置守卫必须执行的钩子
// next() 放过
// next(false) 跳转终止
// next(地址) 跳转到某个地址
const whilteList = ['/login', '/404'] // 白名单
router.beforeEach((to, from, next) => {
  nprogress.start() // 开启进度条
  // 判断是否有token
  if (store.getters.token) {
    //   如果有token且访问的是登录页面
    if (to.path === '/login') {
      next('/') // 跳转到首页
    } else {
      // 如果有token 访问的不是登录页面 则放行
      next()
    }
  } else {
    // 没有token的情况下
    if (whilteList.indexOf(to.path) > -1) {
      // 表示地址在白名单内
      next()
    } else {
      next('/login')
    }
  }
  nprogress.done() // 解决手动切换地址时,进度条不关闭的问题
})
// 后置守卫
router.afterEach(() => {
  nprogress.done() // 关闭进度条
})
