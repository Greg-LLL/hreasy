<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools :show-before="true">
        <!-- 左侧显示总记录数 -->
        <!-- <span slot="before">共16条记录</span> -->
        <template v-slot:before>
          <span>共{{ page.total }}条记录</span>
        </template>
        <!-- 右侧显示按钮 -->
        <template v-slot:after>
          <el-button size="small" type="success" @click="$router.push('/import')">excel导入</el-button>
          <el-button size="small" type="danger" @click="exportData">excel导出</el-button>
          <el-button size="small" type="primary" @click="showDialog = true">新增员工</el-button>
        </template>
      </page-tools>
      <!-- 表格组件 -->
      <el-table v-loading="loading" :data="list">
        <el-table-column type="index" label="序号" sortable="" />
        <el-table-column prop="username" label="姓名" sortable="" />
        <el-table-column width="120px" label="头像" align="center">
          <!-- 插槽 -->
          <template v-slot="{ row}">
            <img
              v-imagerror="require('@/assets/common/head.jpg')"
              :src="row.staffPhoto"
              alt=""
              style="border-radius:50%;width:100px;height:100px;padding:10px"
              @click="showQrCode(row.staffPhoto)"
            >
          </template>
        </el-table-column>
        <el-table-column prop="workNumber" label="工号" sortable="" />
        <el-table-column prop="formOfEmployment" label="聘用形式" :formatter="formatEmployment" sortable="" />
        <el-table-column prop="departmentName" label="部门" sortable="" />
        <el-table-column prop="timeOfEntry" label="入职时间" sortable="">
          <!-- <template slot-scope="obj"></template> -->
          <template v-slot="obj">
            <!-- 将时间进行格式化 -->
            {{ obj.row.timeOfEntry | formatDate }}
          </template>
        </el-table-column>
        <el-table-column prop="enableState" label="账户状态" sortable="">
          <template v-slot="{row}">
            <el-switch :value="row.enableState === 1" />
          </template>
        </el-table-column>
        <el-table-column label="操作" sortable="" fixed="right" width="280">
          <template v-slot="{ row }">
            <el-button type="text" size="small" @click="$router.push(`/employees/detail/${row.id}`)">查看</el-button>
            <el-button type="text" size="small">转正</el-button>
            <el-button type="text" size="small">调岗</el-button>
            <el-button type="text" size="small">离职</el-button>
            <el-button type="text" size="small" @click="editRole(row.id)">角色</el-button>
            <el-button type="text" size="small" @click="delEmployee(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 放置分页组件 -->
      <el-row type="flex" justify="center" align="middle" style="height:60px">
        <el-pagination
          :current-page="page.page"
          :page-size="page.size"
          :total="page.total"
          layout="prev,pager,next"
          @current-change="changePage"
        />
      </el-row>
    </div>
    <!-- 放置组件弹层 -->
    <!-- sync修饰符 是子组件 去改变父组件数据的一个语法糖 -->
    <AddEmployee :show-dialog.sync="showDialog" />

    <el-dialog title="二维码" :visible.sync="showCodeDialog">
      <el-row type="flex" justify="center">
        <canvas ref="myCanvas" />
      </el-row>
    </el-dialog>

    <!-- 放置分配组件 -->
    <AssignRole ref="assignRole" :show-role-dialog.sync="showRoleDialog" :user-id="userId" />
  </div>
</template>

<script>
import { getEmployeeList, delEmployee } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees' // 引入员工的枚举对象
import AddEmployee from './components/add-employee.vue'
import { formatDate } from '@/filters'
import QrCode from 'qrcode'
import AssignRole from './components/assign-role.vue'

export default {
  components: {
    AddEmployee,
    AssignRole
  },
  data() {
    return {
      list: [], // 接受数组
      page: {
        page: 1,
        size: 10,
        total: 0 // 总数

      },
      loading: false, // 显示遮罩层
      showDialog: false, // 默认关闭弹层
      showCodeDialog: false, // 显示二维码弹层
      showRoleDialog: false, // 显示分配角色
      userId: null // 定义一个userId
    }
  },
  created() {
    this.getEmployeeList()
  },
  methods: {
    async getEmployeeList() {
      this.loading = true
      const { total, rows } = await getEmployeeList(this.page)
      this.page.total = total
      this.list = rows
      this.loading = false
    },
    // newPage是最新的页码
    changePage(newPage) {
      this.page.page = newPage // 赋值给最新的页码
      this.getEmployeeList() // 重新拉取数据
    },
    // 格式化我们的聘用形式
    formatEmployment(row, column, cellValue, index) {
      // 要去找1所对应的值
      // eslint-disable-next-line eqeqeq
      const obj = EmployeeEnum.hireType.find(item => item.id == cellValue)
      return obj ? obj.value : '未知'
    },
    async delEmployee(id) {
      try {
        await this.$confirm('确定删除该员工吗？')
        // 点击了确定 进入了下方
        await delEmployee(id)
        this.$message.success('删除员工成功')
        this.getEmployeeList() // 重新拉取数据
      } catch (error) {
        console.log(error)
      }
    },
    // 导出excel
    exportData() {
      const headers = {
        '姓名': 'username',
        '手机号': 'mobile',
        '入职日期': 'timeOfEntry',
        '聘用形式': 'formOfEmployment',
        '转正日期': 'correctionTime',
        '工号': 'workNumber',
        '部门': 'departmentName'
      }
      // 懒加载，点击按钮才开始加载
      import('@/vendor/Export2Excel').then(async excel => {
        // excel是引入文件的导出对象
        // 导出 表头从哪里来
        // 导出 数据从哪里来
        // list是每一页的数据，现在没有接口获取所有的数据
        // 获取员工的接口 页码 每页条数
        // 可以利用员工接口，查1页，1页查所有的数据
        const { rows } = await getEmployeeList({
          page: 1,
          size: this.page.total // 所有数据
        })
        const multiHeader = [['姓名', '主要信息', '', '', '', '', '部门']]
        const merges = ['A1:A2', 'B1:F1', 'G1:G2']
        const data = this.formatJson(headers, rows) // 返回的数据就是要导出的数据
        excel.export_json_to_excel({
          header: Object.keys(headers), // 表头
          multiHeader, // 复杂表头
          merges, // 合并的单元格
          data,
          filename: '员工资料表'
        })

        // excel.export_json_to_excel({
        //   header: ['姓名', '工资'], // 表头 必填
        //   data: [['张三', 3000], ['李四', 100000]], // 具体数据 必填
        //   filename: '员工工资表', // 文件名，非必填
        //   bookType: 'xlsx' // 导出文件类型
        // })
      })
    },
    // 转化导出的数据
    // 将表头数据和数据对应
    // 原来结构 [{}] => 现在要转换成 [[]]
    formatJson(headers, rows) {
      return rows.map(item => {
        // item 是一个对象 {username:'张三'，mobile:'123','',''}
        return Object.keys(headers).map(key => {
          // 需要判断字段
          if (headers[key] === 'timeOfEntry' || headers[key] === 'correctionTime') {
            // 格式化日期
            return formatDate(item[headers[key]])
          } else if (headers[key] === 'formOfEmployment') {
            // eslint-disable-next-line eqeqeq
            const obj = EmployeeEnum.hireType.find(obj => obj.id == item[headers[key]])
            return obj ? obj.value : '未知'
          }
          return item[headers[key]]
        })
      })
      // return rows.map(item => Object.keys(headers).map(key => item[headers[key]]))
    },
    showQrCode(url) {
      // 只有在url地址存在的时候弹出弹出层
      if (url) {
        this.showCodeDialog = true // 数据更新了 但是我的弹层会立即更新吗？ 页面的渲染是异步的！！！
        // 有一个方法可以在上一次数据更新完毕，页面渲染完毕之后执行
        this.$nextTick(() => {
          // 此时可以确认已经有ref对象了
          QrCode.toCanvas(this.$refs.myCanvas, url) // 将地址转换成二维码
          // 如果转化的二维码是一个地址的话，就会跳转到该地址，如果不是地址就会显示内容
        })
      } else {
        this.$message.warning('该用户还未上传头像')
      }
    },
    async editRole(id) {
      // 弹出层
      this.userId = id // props 赋值 props赋值是异步的
      await this.$refs.assignRole.getUserDetailById(id) // 调用子组件的方法
      this.showRoleDialog = true
    }
  }
}
</script>

<style>

</style>
