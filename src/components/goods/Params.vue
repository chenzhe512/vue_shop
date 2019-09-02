<template>
  <div>
    <!--导航  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <!-- 级联选择器 -->
      <el-row class="spaceBottom">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectCate"
            :options="cateData"
            :props="cateProps"
            @change="handleChange"
            closable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- Tabs栏切换 -->
      <el-tabs v-model="activeName" @tab-click="handleClick" class="spaceBottom">
        <el-tab-pane
          :label="item.label"
          :name="item.name"
          v-for="item in paramsInfo"
          :key="item.id"
        >
          <el-table border style="width: 100%" :data="activeName=='only'?onlyData:manyData">
            <el-table-column type="expand">
              <!-- 标签属性的插槽 -->
              <template slot-scope="scope">
                <el-tag
                  :key="i"
                  v-for="(item,i) in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(scope.row,i)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="inputVisible"
                  v-model="inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>

                <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click=deleteAttr(scope.row)>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>
//            
<script>
export default {
  data() {
    return {
      // 默认显示many，即动态参数
      activeName: "many",
      //   级联选择器数据
      cateData: [],
      //   级联选择器选中的选项ID数组
      selectCate: [],
      //   三级级联选择器配置信息
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      paramsInfo: [
        { id: 0, name: "many", label: "动态参数" },
        { id: 1, name: "only", label: "静态参数" }
      ],
      manyData: [],
      onlyData: [],
      inputVisible: false,
      inputValue: ""
    };
  },
  created() {
    this.getCateData();
  },
  mounted() {},

  methods: {
    handleClick(tab, event) {
      this.getParams();
    },
    //   渲染级联选择器
    async getCateData() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) this.$message.error("获取分类数据失败");
      this.cateData = res.data;
      console.log(this.cateData);
    },
    handleChange() {
      this.getParams();
    },
    // 获取动静态属性
    async getParams() {
      // 判断数组长度
      if (this.selectCate.length !== 3) {
        this.selectCate = [];
        return;
      }
      this.manyData = [];
      this.onlyData = [];
      const id = this.selectCate[this.selectCate.length - 1];
      const { data: res } = await this.$http.get(
        `categories/${id}/attributes`,
        {
          params: {
            sel: [this.activeName]
          }
        }
      );
      //   在赋值给数组之前处理 attr_vals
      res.data.forEach(item => {
        const ss = item.attr_vals.split(" ");
        item.attr_vals = ss;
      });
      if (this.activeName === "only") {
        this.onlyData = res.data;
      } else {
        this.manyData = res.data;
      }
    },
    // 点击tag标签的关闭按钮时，获取此标签的在数组的位置，从此位置开始删除一项，之后的row.attr_vals即需要上传的参数
    //处理数据时需要传入遍历的i，需要依靠这个来删除对应的数组中的数据
    // 此处直接传入可以根据判断this.activeName的值来确定传入this.onlyData或者this.manyData
    //进而handleCLose函数只需传入一个i即可 貌似多余

    // 删除tags处理事件
    handleClose(row, i) {
      row.attr_vals.splice(i, 1);
      this.saveParams(row);
    },
    // 删除tag标签的静/动态属性请求其实就是 将删除后的原数据传入请求参数，从新获取渲染，实现静态动态属性的删除
    // 删除和添加使用的是同一个接口
    async saveParams(row) {
      const { data: res } = await this.$http.put(
        `categories/${row.cat_id}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" ")
        }
      );
      if (res.meta.status !== 200) return this.$message.error("修改参数失败");
      this.$message.success("修改参数成功");
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 当输入框失去焦点或者按下enter键时触发
    handleInputConfirm(row) {
      if(this.inputValue.trim().length==0){
        this.inputValue=''
        this.inputVisible = false
        return 
      }
      row.attr_vals.push(this.inputValue);
      this.inputVisible = false;
      this.inputValue = "";
      this.saveParams(row)
    },

  }
};
</script>

<style lang="less" scoped>
.spaceBottom {
  margin-top: 20px;
}
.el-tag + .el-tag {
  margin-left: 20px;
}
.button-new-tag {
  margin-left: 20px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 20px;
  vertical-align: bottom;
}
</style>