import request from '@/utils/request'
// 获取组织架构的数组
export function getDepartments() {
  return request({
    url: '/company/department'
  })
}

