<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- consignee_addr: ""
create_time: 1512535620
is_send: "否"
order_fapiao_company: ""
order_fapiao_content: ""
order_fapiao_title: "个人"
order_id: 68
order_number: "itcast-g7kmck725jaujgdts"
order_pay: "0"
order_price: 40
pay_status: "0"
trade_no: ""
update_time: 1512535620
      user_id: 1-->
      <!-- 订单列表 -->
      <el-table :data="orderList" border style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="180"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="warning" v-if="scope.row.pay_status==='0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">{{scope.row.create_time | dataFilter}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editAddress(scope.row)"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location-outline"
              size="mini"
              @click="viewAddress(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog title="提示" :visible.sync="editDialogVisible" width="50%">
      <el-form>
        <el-form-item>
          <!-- 这里之所以不设置配置 是因为 value和label一样  -->
          <el-cascader
            :options="cityData"
            :props="configProps"
            v-model="selectAdd"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>
        <el-form-item>
          <el-input></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="watchDialogVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          :timestamp="item.time"
          v-for="(item,index) in activities"
          :key="index"
        >{{item.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import cityData from "./citydata.js";
export default {
  data() {
    return {
      orderParams: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      cityData,
      activities: [],
      selectAdd: [],
      watchDialogVisible: false,
      orderList: [],
      total: 1,
      editDialogVisible: false,
      configProps: {
        expandTrigger: "hover",
        value: "value",
        label: "label",
        children: "children"
      }
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.orderParams
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取订单数据失败");
      this.orderList = res.data.goods;
      this.total = res.data.total;
    },
    editAddress() {
      this.editDialogVisible = true;
    },
    handleChange() {
      console.log(this.selectAdd);
    },
    async viewAddress(row) {
      this.watchDialogVisible = true;
      const { data: res } = await this.$http.get(`kuaidi/${row.order_number}`);
      if (res.meta.status !== 200)
        return this.$message.error("获取物流信息失败");
      this.activities = res.data;
      console.log(this.activities);
    }
  }
};
</script>
<style lang="less" scoped>
.el-row {
  margin-bottom: 20px;
}
.el-cascader {
  width: 100%;
}
</style>