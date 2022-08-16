<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!-- 组织架构 -->
      <el-card class="tree-card">
        <!-- 放置结构内容 -->
        <TreeTools
          :tree-node="company"
          :is-root="true"
          @addDepts="addDepts"
        />
        <!-- 放置一个el-tree -->
        <el-tree :data="departs" :props="defaultProps" :default-expand-all="true">
          <!-- 传入内容 插槽内容 会循环多次 有多少节点 就会循环多少次 -->
          <!-- 作用域插槽slot-scope = “obj” 接受传递给插槽的数据 -->
          <!-- data就是我们每个节点的数据对象 -->
          <TreeTools
            slot-scope="{ data }"
            :tree-node="data"
            :is-root="false"
            @delDepts="getDepartments()"
            @addDepts="addDepts"
            @editDepts="editDepts"
          />
        </el-tree>
      </el-card>
    </div>
    <!-- 放置弹层组件 -->
    <AddDept ref="addDept" :show-dialog.sync="showDialog" :tree-node="node" @addDepts="getDepartments" />
  </div>
</template>

<script>
import TreeTools from './components/tree-tool.vue'
import { getDepartments } from '@/api/departments'
import { tranListToTreeData } from '@/utils/index'
import AddDept from './components/add-dept.vue'
export default {
  components: {
    TreeTools,
    AddDept
  },
  data() {
    return {
      defaultProps: {
        label: 'name',
        children: 'children'
      },
      departs: [],
      company: { name: '', manger: '' },
      showDialog: false, // 默认不显示
      node: null // 记录当前点击的节点
    }
  },
  created() {
    this.getDepartments()
  },
  methods: {
    async getDepartments() {
      const result = await getDepartments()
      this.company = { name: result.companyName, manager: '负责人', id: '' }
      this.departs = tranListToTreeData(result.depts, '')
    },
    // 监听tree-tools中触发的点击添加子部门事件
    addDepts(node) {
      this.showDialog = true // 显示弹层
      this.node = node
    },
    editDepts(node) {
      this.showDialog = true // 显示弹层
      this.node = node
      // 应该在这里调用获取部门详情的方法
      this.$refs.addDept.getDepartDetail(node.id)
    }

  }
}
</script>

<style scoped>
.tree-card {
  padding: 30px  140px;
  font-size:14px;
}

</style>
