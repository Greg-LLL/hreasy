<template>
  <!-- 放置弹层框 -->
  <el-dialog title="新增部门" :visible="showDialog">
    <!-- 表单数据  label-width 设置所有label的宽度-->
    <el-form label-width="120px" :model="formData" :rules="rules">
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="formData.name" style="width:80%" placeholder="1-50个字符" />
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input v-model="formData.code" style="width:80%" placeholder="1-50个字符" />
      </el-form-item>
      <el-form-item label="部门负责人" prop="manager">
        <el-select v-model="formData.manager" style="width:80%" placeholder="请选择" />
      </el-form-item>
      <el-form-item label="部门介绍" prop="introduce">
        <el-input v-model="formData.introduce" style="width:80%" placeholder="1-300个字符" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <!-- 确定和消息 -->
    <el-row slot="footer" type="flex" justify="center">
      <el-col :span="6">
        <el-button size="small">取消</el-button>
        <el-button type="primary" size="small">确定</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { getDepartments } from '@/api/departments'
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
      const isRepeat = depts.filter(item => item.pid === this.treeNode.id).some(item => item.name === value)
      // 如果isRepeat为true，表示找到了一样的名字
      isRepeat ? callback(new Error(`同级部门下已经存在${value}了`)) : callback
    }

    // 查部门编码是否重复
    const checkCodeRepeat = async(rule, value, callback) => {
      const { depts } = await getDepartments()
      //   要求编码 和所有部门编码不能重复
      //   由于历史数据有可能没有code 所有这里要加一个强制条件 就是value值不能为空
      const isRepeat = depts.some(item => item.code === value && value)
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
      }
    }
  }
}
</script>

<style>

</style>
