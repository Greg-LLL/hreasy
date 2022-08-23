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
router.beforeEach(async(to, from, next) => {
  nprogress.start() // 开启进度条
  // 判断是否有token
  if (store.getters.token) {
    // 只有有token的情况下 才能获取用户资料
    //   如果有token且访问的是登录页面
    if (to.path === '/login') {
      next('/') // 跳转到首页
    } else {
      // 只有放过去的时候才去获取用户资料
      // 是每次都获取吗？不是
      // 如果有token 访问的不是登录页面 则放行
      if (!store.getters.userId) {
        // 如果没有用户Id 表示当前用户资料没有获取过
        // async函数所return的内容 用await就可以接受到
        const { roles } = await store.dispatch('user/getUserInfo')
        // 如果说后续 需要根据用户资料获取数据的化，这里必须改成同步
        // 筛选用户可用的路由
        const routes = await store.dispatch('permission/filterRoutes', roles.menus) // 筛选用户可用的动态路由
        // routes就是筛选得到的动态路由
        // 把动态路由添加到路由表中 默认的路由表只有静态路由 没有动态路由
        // addRoutes
        // 404必须放在最后
        router.addRoutes([...routes, { path: '*', redirect: '/404', hidden: true }]) // 添加我们的动态路由到路由表
        // 添加完动态路由之后 必须 用 next(地址) 不能用next()
        next(to.path) // 相当于跳到对应的地址 相当于多做一次跳转 为什么要多做一次跳转
        // 进门了，但是进门之后我要去的地方的路还没有铺好，直接走，掉坑里，
        // 多做一次跳转，再从门外往里进一次，跳转之前 把路铺好，再次进来的时候，路就铺好了
      } else {
        next()
      }
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
