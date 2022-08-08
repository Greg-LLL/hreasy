// 负责管理所又的自定义指令

export const imagerror = {
  // 指令对象
  // inserted 会在当前的dom元素插入到节点之后执行
  inserted(dom, options) {
    // options是指令变量的解释 其中有一个属性叫value
    // dom 表示当前指令作用的dom对象
    // dom此时认为就是图片
    dom.src = dom.src || options.value // 初始化的时候 如果有值 则赋值 如果没有值 则需要进行默认值赋值
    // 当图片有地址，但是地址没有加载成功的时候 会报错 会触发图片的一个事件 => onerror
    dom.onerror = function() {
      // dom 可以注册error事件
      dom.src = options.value // 这里不能写死
    }
  },
  // 该函数同inserted一样 也是一个钩子函数
  componentUpdated(dom, options) {
    // 该函数会在当前指令作用的组件 更新数据完毕之后 执行
    // inserted只会执行一次，
    // 组件初始化后一旦更新就不会再次进入inserted函数 会进入componentUpdated函数
    dom.src = dom.src || options.value
  }
}
