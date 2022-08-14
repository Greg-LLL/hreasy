<template>
  <div class="dashboard-container">
    <div class="app-container">
      <el-card>
        <el-tabs>
          <el-tab-pane label="角色管理">
            <!-- 左侧内容 -->
            <el-row style="height:60px">
              <el-button
                icon="el-icon-plus"
                type="primary"
                size="small"
                @click="showDialog = true"
              >新增角色</el-button>
            </el-row>
            <el-table border="" :data="list">
              <el-table-column align="center" type="index" label="序号" width="120" />
              <el-table-column align="center" prop="name" label="名称" width="240" />
              <el-table-column align="center" prop="description" label="描述" />
              <el-table-column align="center" label="操作">
                <!-- 作用域插槽 -->
                <template slot-scope="{ row }">
                  <el-button size="small" type="success" @click="assignPerm(row.id)">分配权限</el-button>
                  <el-button size="small" type="primary" @click="editRole(row.id)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteRole(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页组件 -->
            <el-row
              type="flex"
              justify="center"
              align="middle"
              style="height :60px"
            >
              <!-- 注意最后一个next不要多写逗号 -->
              <el-pagination
                layout="prev, pager, next"
                :total="page.total"
                :page-size="page.pagesize"
                :current-page="page.page"
                @current-change="changePage"
              />
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="公司信息">
            <el-alert
              title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改"
              :closable="false"
              type="info"
              :show-icon="true"
            />
            <!-- 右边内容 -->
            <el-form label-width="120px" style="margin-top : 50px">
              <el-form-item label="企业名称">
                <el-input v-model="formData.name" disabled style="width:400px" />
              </el-form-item>
              <el-form-item label="公司地址">
                <el-input v-model="formData.companyAddress" disabled style="width:400px" />
              </el-form-item>
              <el-form-item label="电话">
                <el-input v-model="formData.companyPhone" disabled style="width:400px" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="formData.mailbox" disabled style="width:400px" />
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="formData.remarks" type="textarea" :rows="3" disabled style="width:400px" />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    <!-- 放置一个弹层组件 -->
    <el-dialog title="编辑部门" :visible="showDialog" @close="btnCancel">
      <el-form ref="roleFrom" :model="roleFrom" :rules="rules" label-width="120px">
        <el-form-item prop="name" label="角色名称">
          <el-input v-model="roleFrom.name" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleFrom.description" />
        </el-form-item>
      </el-form>
      <!-- 放置footer插槽 -->
      <el-row type="flex" justify="center">
        <el-col :span="8">
          <el-button size="small" @click="btnCancel">取消</el-button>
          <el-button size="small" type="primary" @click="btnOk">确定</el-button>
        </el-col>
      </el-row>
    </el-dialog>

    <!-- 分配权限弹层 -->
    <el-dialog title="分配权限" :visible="showPermDialog" @close="btnPermCancel">
      <!-- 权限是一棵树 -->
      <!-- 将数据绑定到组件上 -->
      <!-- check-strictly 如果为ture 表示父子勾选时不互相关联  如果为false就互相关联-->
      <!-- id作为唯一标识 -->
      <el-tree
        ref="permTree"
        :default-expand-all="true"
        :data="permData"
        :props="defaultProps"
        :show-checkbox="true"
        :check-strictly="true"
        :default-checked-keys="selectCheck"
        node-key="id"
      />
      <!-- 确定 取消按钮 -->
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
          <el-button size="small" type="primary" @click="btnPermOK">确定</el-button>
          <el-button size="small" @click="btnPermCancel">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getRoleList, getCompanyInfo, deleteRole, getRoleDetail, updateRole, addRole, assignPerm } from '@/api/setting'
import { mapGetters } from 'vuex'
import { getPermissionList } from '@/api/permission'
import { tranListToTreeData } from '@/utils'
export default {
  data() {
    return {
      list: [], // 承接数组
      permData: [], // 权限数据
      defaultProps: {
        label: 'name'
      }, // 定义显示字段的名称和子属性的字段名称
      page: {
        // 放置页码及相关数据
        page: 1,
        pagesize: 10,
        total: 0 // 记录总数
      },
      formData: {
        // 公司信息
      },
      showDialog: false, // 控制弹层的显示
      showPermDialog: false, // 分配权限弹出层显示
      roleFrom: {
        name: '',
        description: ''
      },
      rules: {
        name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }]
      },
      roleId: null, // 记录当前分配权限的id
      selectCheck: [] // 用来记录当前权限点的标识
    }
  },
  computed: {
    ...mapGetters(['companyId'])
  },
  created() {
    this.getRoleList() // 获取角色列表
    this.getCompanyInfo()
  },
  methods: {
    async getRoleList() {
      const { total, rows } = await getRoleList(this.page)
      this.page.total = total
      this.list = rows
    },
    changePage(newPage) {
      // newPage是当前点击的页码
      this.page.page = newPage // 将当前页码赋值给当前最新的页码
      this.getRoleList()
    },
    async getCompanyInfo() {
      this.formData = await getCompanyInfo(this.companyId)
    },
    async deleteRole(id) {
      try {
        await this.$confirm('确认删除该角色吗？')
        await deleteRole(id) // 调用删除接口
        this.getRoleList() // 重新加载数据
        this.$message.success('删除成功')
      } catch (error) {
        console.log(error)
      }
    },
    async editRole(id) {
      this.roleFrom = await getRoleDetail(id) // 数据的回写
      this.showDialog = true
    },

    async btnOk() {
      try {
        await this.$refs.roleFrom.validate()
        // 只有校验成功的情况下才会执行await下方内容
        // roleFrom有id就是编辑，没有id就是新增
        if (this.roleFrom.id) {
          await updateRole(this.roleFrom)
        } else {
          // 新增业务
          await addRole(this.roleFrom)
        }
        // 重新拉取数据
        this.getRoleList()
        this.$message.success('操作成功')
        this.showDialog = false // 关闭弹层 =>触发el-dialog的close事件
      } catch (error) {
        console.log(error)
      }
    },
    btnCancel() {
      // 清空数据
      this.roleFrom = {
        name: '',
        description: ''
      }
      // 移除校验
      this.$refs.roleFrom.resetFields()
      // 关闭弹层
      this.showDialog = false
    },
    async assignPerm(id) {
      // 获取权限点数据
      // 在点击时调用获取权限点数据
      this.permData = tranListToTreeData(await getPermissionList(), '0') // 获取所有权限点 转化成树形数据
      // 有id 先记录id
      this.roleId = id
      // 应该去获取该id的权限点
      const { permIds } = await getRoleDetail(id) // 当前角色所拥有的权限点数据
      this.selectCheck = permIds // 将当前角色所拥有的权限id所赋值
      this.showPermDialog = true
    },
    async btnPermOK() {
      // 调用el-tree的方法 this.$refs.permTree.getCheckedKeys()
      await assignPerm({ permIds: this.$refs.permTree.getCheckedKeys(), id: this.roleId })
      this.$message.success('分配权限成功')
      this.showPermDialog = false
    },
    btnPermCancel() {
      this.showPermDialog = false
      this.selectCheck = [] // 重置数据
    }
  }

}
</script>

<style>

</style>
