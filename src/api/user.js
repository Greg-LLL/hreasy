import request from '@/utils/request'

// 登录接口的封装
export function login(data) {
  // 返回一个promise对象
  return request({
    url: '/sys/login',
    method: 'post',
    data
  })
}

// 获取用户资料
export function getUserInfo() {
  return request({
    method: 'post',
    url: '/sys/profile'
  })
}
// 根据用户id获取用户的详情，
// 获取头像
export function getUserDetailById(id) {
  return request({
    method: 'get',
    url: `/sys/user/${id}`
  })
}

export function logout() {

}
