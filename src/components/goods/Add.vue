<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加信息alert框 -->
      <el-alert title="添加商品信息" type="info" show-icon center></el-alert>
      <!-- steps步骤条 -->
      <el-steps :active="activeTab-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品信息"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏 -->
      <el-form :model="addGoodForm" :rules="addFormRules" ref="addFormRef" label-position="top">
        <el-tabs
          tab-position="left"
          v-model="activeTab"
          @tab-click="tabClick"
          :before-leave="confirmCate"
        >
          <!-- 基本信息tab栏内容 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_wieght">
              <el-input v-model="addGoodForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodForm.goods_cat"
                :options="cateData"
                :props="configProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyData" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i ) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headObj"
              :on-success="handleSuccess"
            >
              <!-- :file-list="fileList"  为默认的显示图片的缩略图表数组-->
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>

          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addGoodForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="imgDialogVisible" width="50%">
      <img :src="priviewImg" class="imgStyle" />
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      activeTab: 0,
      selectArr: [],
      headObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      imgDialogVisible: false,
      fileList: [
        {
          name: "girl.jpg",
          url:
            "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1567328231747&di=57c5b347526122f697bfde98b79b20bc&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201112%2F12%2F20111212231520_3NaUV.jpg"
        },
        {
          name: "girl.png",
          url: "@/assets/girl.png"
        }
      ],
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请输入商品分类", trigger: "blur" }
        ]
      },
      cateData: [],
      priviewImg: "",
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      configProps: {
        expandTrigger: "hover",
        value: "cat_id",
        children: "children",
        label: "cat_name"
      },
      manyData: [],
      onlyData: [],
      addGoodForm: {
        goods_name: "",
        goods_cat: [],
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_introduce: "",
        pics: [],
        attrs: []
      }
    };
  },
  created() {
    this.getCateData();
  },
  computed: {
    cateId() {
      if (this.addGoodForm.goods_cat.length === 3) {
        return this.addGoodForm.goods_cat[2];
      }
      return null;
    }
  },
  methods: {
    async getCateData() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200)
        return this.$message.error("获取商品列表失败");
      this.cateData = res.data;
    },
    handleChange() {
      this.getParams("many", function(ss) {
        console.log(ss);
      });
      this.getParams("only", function(ss) {
        console.log(ss);
      });
    },
    async getParams(type = "many", callback) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: type
          }
        }
      );
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      if (type === "many") {
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyData = res.data;
        callback(this.manyData);
      } else {
        this.onlyData = res.data;
        callback(this.onlyData);
      }
    },
    handlePreview(file) {
      this.priviewImg = file.response.data.url;
      this.imgDialogVisible = true;
    },
    handleSuccess(response) {
      const pic = {
        pic: response.data.tmp_path
      };
      this.addGoodForm.pics.push(pic);
      console.log(this.addGoodForm);
    },
    handleRemove(file) {
      console.log(file.response.data.tmp_path);
      const path = file.response.data.tmp_path;
      const index = this.addGoodForm.pics.findIndex(x => x.pic === path);
      this.addGoodForm.pics.splice(index, 1);
      console.log(this.addGoodForm);
    },
    tabClick() {
      console.log(this.activeTab);
    },
    // 切换标签之前判断的钩子
    confirmCate(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addGoodForm.goods_cat.length !== 3) {
        this.$message.error("请选择商品分类");
        return false;
      }
    },
    // 添加表单
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error("请填写必要的填写项");
        }
        const form = JSON.parse(JSON.stringify(this.addGoodForm));
        // 处理动态参数数据
        this.manyData.forEach(item => {
          const attr = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" ")
          };
          form.attrs.push(attr);
        });
        // 处理静态属性数据
        this.onlyData.forEach(item => {
          const attr = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          form.attrs.push(attr);
        });
        // array的join不改变原数组，即使用后原数组不变，因此需要重新赋值 且array.join("")//直接全部连接起来无间隔   array.join(",") array.join() //逗号间隔
        form.goods_cat = form.goods_cat.join();
        console.log(form);
        // 发送请求添加商品
        const { data: res } = await this.$http.post("goods", form);
        console.log(res);
        if (res.meta.status !== 201) return this.$message.error("添加商品失败");
        this.$message.success("商品添加成功");
        this.$router.push("/goods");
      });
    }
  }
};
</script>
<style lang="less" scoped>
.el-steps {
  margin: 30px;
}
.el-form {
  height: 100%;
}
.el-card {
  height: 100%;
}
.imgStyle {
  width: 100%;
}

.addBtn {
  margin-top: 20px;
}
</style>