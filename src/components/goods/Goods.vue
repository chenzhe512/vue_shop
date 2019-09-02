<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索框 添加按钮 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="routerAdd">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表 -->
      <el-table border :data="goodsList">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name" width="400"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="200">
          <template slot-scope="scope">{{scope.row.add_time | dataFilter}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      goodsParams: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [],
      total: 1
    };
  },
  created() {
    this.getGoodsList();
  },
  //add_time: 1514259445
  // cat_id: null
  // cat_one_id: null
  // cat_three_id: null
  // cat_two_id: null
  // goods_id: 923
  // goods_name: "车载冰箱7.5L 冷暖两用汽车冰箱半导体12V迷你电冰箱升级款"
  // goods_number: 100
  // goods_price: 149
  // goods_state: 0
  // goods_weight: 100
  // hot_mumber: 0
  // is_promote: false
  // upd_time: 1514259445
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.goodsParams
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取商品列表失败");
      this.goodsList = res.data.goods;
      this.total = res.data.total;
      console.log(res.data);
    },
    routerAdd(){
      console.log(222)
      // this.$router.push({name:'add'})
      // this.$router.push({path:'/add'})
      this.$router.push('add')
    }
  }
};
</script>
<style lang="less" scoped>
.el-col {
  margin-right: 20px;
}
.el-row{
  margin-bottom: 20px;
}
</style>