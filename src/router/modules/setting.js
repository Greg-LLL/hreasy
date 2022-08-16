// 导出公司设置的路由规则
import Layout from '@/layout'
export default {
  // 路由规则
  path: '/setting', // 路由地址
  name: 'settings', // 给模块的以及路由加了一个name属性，这个属性我们后面做权限的时候会用到
  component: Layout,
  children: [{
    //   二级路由的path什么都不写的时候，此时它表示二级路由的默认路由
    path: '', // 这里不用写，什么都不写 表示、employess 不但有我们的布局layout 还有员工主页
    component: () => import('@/views/setting'),
    // 路由元信息，其实就是一个存储数据的地方，可以放任何内容
    meta: {
      title: '公司设置', // 这里为什么要用title啊？因为左侧导航读取了这里的title属性
      icon: 'setting'
    }
  }]
}
