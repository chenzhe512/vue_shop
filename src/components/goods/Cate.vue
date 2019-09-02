<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类列表 -->
      <table-tree
        show-index
        index-text="#"
        border
        :show-row-hover="false"
        :data="cateList"
        :selection-type="false"
        :expand-type="false"
        :columns="columns"
        class="tabletree"
      >
        <!-- 是否有效插槽 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" style="color:green" v-if="scope.row.cat_deleted===false"></i>
          <i class="el-icon-success" style="color:red" v-else></i>
        </template>
        <!-- 排序插槽 -->
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="danger" v-else>三级</el-tag>
        </template>
        <!-- 操作插槽 -->
        <template slot="edit" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </table-tree>
    </el-card>

    <!-- 添加分类弹出框 -->

    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="clearForm">
      <el-form ref="cateRef" :rules="cateRules" :model="cateForm" label-width="100px">

        <!-- 切记此处的prop绑定的验证规则需要与input输入框中的数据保持一致，即都为cat_name 最好是 三者一致 v-model prop 验证规则的对象名 -->
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="cateForm.cat_name"></el-input>
        
        </el-form-item>

        <!-- 仅需options和props就可完成对于级联选择器的下拉列表渲染 v-model是获取所选数据的数组  change-on-select控制是否可以只选择一级选项不选二级-->
        <el-form-item label="父级分类:">
          <!-- 此处的v-model貌似自动绑定的是获取数据的value值 得到的是一个数组 options是数据来源 props是配置信息-->
          <el-cascader
            :options="fatherCate"
            :props="cateProps"
            v-model="selectCate"
            @change="getCascData"
            change-on-select
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sendCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cateRules: {
        cat_name: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ]
      },
      cateList: [],
      fatherCate: [],
      selectCate: [],
      addDialogVisible: false,
      queryGoodsInfo: {
        type: "",
        pagenum: 1,
        pagesize: 5
      },

      cateForm: {
        cat_pid: 0,
        cat_name: "",
        cat_level: 0
      },
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          type: "template",
          template: "isOk"
        },
        {
          label: "排序",
          type: "template",
          template: "sort"
        },
        {
          label: "操作",
          type: "template",
          template: "edit"
        }
      ],
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      }
    };
  },
  created() {
    this.getCateList();
    this.getFaCate();
  },
  methods: {
    // 获取三级数据渲染列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryGoodsInfo
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取商品数据失败");
      this.cateList = res.data.result;
      console.log(res.data);
      console.log(res.data.result);
    },
    // 获取两级数据渲染级联选择器
    async getFaCate() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取商品数据失败");
      this.fatherCate = res.data;
      console.log(this.fatherCate);
    },
    // 在级联选择器出发change事件时，根据数组处理数据，为发送请求准备
    getCascData() {
      if (this.selectCate.length !== 0) {
        this.cateForm.cat_level = this.selectCate.length;
        this.cateForm.cat_pid = this.selectCate[this.selectCate.length - 1];
      }
    },

    // 点击事件发送添加分类请求
     sendCate() {
      console.log(this.cateForm.cat_name)
      this.$refs.cateRef.validate(async valid=>{
        if(!valid) return 
        const { data: res } = await this.$http.post("categories", this.cateForm);
        if(res.meta.status !==201) return this.$message.error("添加分类失败")
        this.getCateList()
        this.addDialogVisible=false
      })
    },
    // dialog关闭事件
    clearForm(){
      // dialog关闭时应该保证表单数据清空 包括cateForm表单数据 以及 处理级联选择器时所使用的selectCate 、this.cateForm.cat_level、this.cateForm.cat_pid
        this.$refs.cateRef.resetFields()
        this.selectCate=[]
        this.cateForm.cat_pid = 0
        this.cateForm.cat_level = 0

    }
  }
};
</script>
<style lang="less" scoped>
.tabletree {
  margin-top: 20px;
}
.styleother {
  height: 300px;
}
.el-cascader {
  width: 100%;
}
</style>