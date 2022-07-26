<template>
  <!-- 放置弹层框 -->
  <el-dialog :title="showTitle" :visible="showDialog" @close="btnCancel">
    <!-- 表单数据  label-width 设置所有label的宽度-->
    <el-form ref="deptForm" label-width="120px" :model="formData" :rules="rules">
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="formData.name" style="width:80%" placeholder="1-50个字符" />
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input v-model="formData.code" style="width:80%" placeholder="1-50个字符" />
      </el-form-item>
      <el-form-item label="部门负责人" prop="manager">
        <!-- native修饰符，可以找到原生元素事件 -->
        <el-select v-model="formData.manager" style="width:80%" placeholder="请选择" @focus="getEmployeeSimple">
          <!-- 遍历选项 -->
          <el-option
            v-for="item in peoples"
            :key="item.id"
            :label="item.username"
            :value="item.username"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="部门介绍" prop="introduce">
        <el-input v-model="formData.introduce" style="width:80%" placeholder="1-300个字符" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <!-- 确定和消息 -->
    <el-row slot="footer" type="flex" justify="center">
      <el-col :span="6">
        <el-button size="small" @click="btnCancel">取消</el-button>
        <el-button type="primary" size="small" @click="btnOK">确定</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { getDepartments, addDepartment, getDepartDetail, updateDepartment } from '@/api/departments'
import { getEmployeeSimple } from '@/api/employees'
export default {
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    treeNode: {
      type: Object,
      default: null
    }
  },
  data() {
    //   检查部门名称是否重复
    const chechNameRepeat = async(rule, value, callback) => {
      // value是部门名称 要去和同级部门相比较 有没有相同的 有相同的 不能过 / 不相同可以过
      const { depts } = await getDepartments()
      //   去找同级部门下 有没有和value相同的数据
      let isRepeat = false
      if (this.formData.id) {
        //  有id就是编辑模式
        // 编辑的数据在数据库里有 同级部门下 我的名字不能和其他同级部门名字重复
        // 首先要找到我的同级部门 this.formData.id 就是我当前的id 我的pid是this.formData.pid
        // depts.filter(item => item.pid === this.formData.pid)
        // 和我pid相同的是同级部门
        isRepeat = depts.filter(item => item.pid === this.treeNode.pid && item.id !== this.treeNode.id).some(item => item.name === value)
      } else {
        // 没有id就是新增模式
        isRepeat = depts.filter(item => item.pid === this.treeNode.id).some(item => item.name === value)
      }

      // 如果isRepeat为true，表示找到了一样的名字
      isRepeat ? callback(new Error(`同级部门下已经存在${value}了`)) : callback
    }

    // 查部门编码是否重复
    const checkCodeRepeat = async(rule, value, callback) => {
      const { depts } = await getDepartments()
      let isRepeat = false
      //   要求编码 和所有部门编码不能重复
      //   由于历史数据有可能没有code 所有这里要加一个强制条件 就是value值不能为空
      if (this.formData.id) {
        // 编辑模式
        isRepeat = depts.filter(item => item.id !== this.treeNode.id).some(item => item.code === value && value)
      } else {
        // 新增模式
        isRepeat = depts.some(item => item.code === value && value)
      }

      isRepeat ? callback(new Error(`组织架构下已经存在这个${value}编码了`)) : callback
    }
    return {
      formData: {
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理者
        introduce: '' // 部门介绍
      },
      rules: {
        name: [{ required: true, message: '部门名称不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '部门名称长度为1-50个字符', trigger: 'blur' },
          { trigger: 'blur', validator: chechNameRepeat }], // 部门名称
        code: [{ required: true, message: '部门编码不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '部门编码长度为1-50个字符', trigger: 'blur' },
          { trigger: 'blur', validator: checkCodeRepeat }], // 部门编码
        manager: [{ required: true, message: '部门负责人不能为空', trigger: 'blur' }], // 部门管理者
        introduce: [{ required: true, message: '部门介绍不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '部门介绍长度为1-300个字符', trigger: 'blur' }] // 部门介绍
      },
      peoples: []
    }
  },
  computed: {
    showTitle() {
      return this.formData.id ? '编辑部门' : '添加部门'
    }
  },
  methods: {
    async getEmployeeSimple() {
      this.peoples = await getEmployeeSimple()
    },
    // 获取详情方法
    async getDepartDetail(id) {
      this.formData = await getDepartDetail(id)
    },
    btnOK() {
      // 手动校验
      this.$refs.deptForm.validate(async(isOk) => {
        // 校验通过
        if (isOk) {
          if (this.formData.id) {
            // 编辑
            await updateDepartment(this.formData)
          } else {
            // 新增
            // 将父级的ID设置成了我们的ID
            await addDepartment({ ...this.formData, pid: this.treeNode.id })
          }
          // 告诉父组件 更新视图
          this.$emit('addDepts') // 触发自定义事件
          // 此时应该去修改showDialog的值
          // update:prop名称
          this.$emit('update:showDialog', false)
          // 关闭dialog的时候 触发el-dialog的close事件 所有这里不需要再单独的重置数据了
        }
      })
    },
    btnCancel() {
      this.formData = {
        // 重置数据 因为resetFields只能重置 表单上的数据
        // 非表单上的数据，比如说formData在编辑中的id
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理者
        introduce: '' // 部门介绍
      }
      // 关闭弹层
      this.$emit('update:showDialog', false)
      // 清除之前的校验
      // 可以重置数据 但是只能重置定义在data中的数据
      this.$refs.deptForm.resetFields()
    }
  }
}
</script>

<style>

</style>
