<template>
  <el-row type="flex" justify="space-between" align="middle" style="height: 40px;width:100%">
    <!-- 左侧内容 -->
    <el-col>
      <span>{{ treeNode.name }}</span>
    </el-col>
    <!-- 右侧内容 -->
    <el-col :span="4">
      <el-row type="flex" justify="end">
        <el-col>{{ treeNode.manager }}</el-col>
        <el-col>
          <!-- 下拉菜单 -->
          <el-dropdown>
            <span>操作
              <i class="el-icon-arrow-down" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <!-- 下拉选项 -->
              <el-dropdown-item>添加部门</el-dropdown-item>
              <el-dropdown-item v-show="!isRoot">编辑部门</el-dropdown-item>
              <el-dropdown-item v-show="!isRoot">删除部门</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
export default {
  props: {
    //   定义一个传入的属性
    treeNode: {
      required: true,
      type: Object
    },
    isRoot: {
      required: false,
      type: Boolean
    }
  }
}
</script>

<style>

</style>
