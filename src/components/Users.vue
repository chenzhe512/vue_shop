<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 栅栏系统布局 一共24份-->
      <el-row :gutter="20">
        <!-- 此处el-row el-col 为正常组件 如果需要在el-col中添加自己自定义内容，则需要使用插槽 即在el-buton中添加slot属性 -->
        <el-col :span="8">
          <el-input v-model="queryList.query" placeholder="请输入内容" :clearable="true">
            <el-button slot="append" icon="el-icon-search" @click="queryResults"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
          <div class="grid-content bg-purple"></div>
        </el-col>
      </el-row>

      <!-- 用户列表渲染 -->
      <el-table :data="userInfo.users" border style="width: 100%">
        <el-table-column prop="date" type="index"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="address" label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              ctive-color="#13ce66"
              inactive-color="#dcdfe6"
              @change="switchStatus(scope.row.id,scope.row.mg_state)"
            ></el-switch>
          </template>
        </el-table-column>

        <el-table-column prop="address" label="操作" width="200px" class>
          <!-- 操作插槽 -->
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click="editUserDialog(scope.row.id)"
            ></el-button>
            <el-button type="danger" icon="el-icon-delete" size="small" @click="delUser(scope.row.id)"></el-button>
            <el-button type="warning" icon="el-icon-s-tools" size="small"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryList.pagenum"
        :page-sizes="[2, 5, 10]"
        :page-size="queryList.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 编辑页面dialog -->
      <el-dialog title="提示" :visible.sync="editDialogVisible" width="50%" @close="resetUser">
        <el-form label-width="80px" :rules="editUserRules" :model="editInfo" ref="editInfoRef">
          <el-form-item label="用户名" prop="username" >
            <el-input v-model="editInfo.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editInfo.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editInfo.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEditUser(editInfo.id)">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 添加用户对话框  用的是form组件 并不是一个一个input输入框-->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="closeAddForm">
        <el-form ref="addFormRef" :model="addUser" label-width="80px" :rules="addUserRules">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUser.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addUser.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUser.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addUser.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible=false">取 消</el-button>
          <el-button type="primary" @click="addForm">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    // 验证邮箱
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb();
      }

      cb(new Error("请输入合法的邮箱"));
    };

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

      if (regMobile.test(value)) {
        return cb();
      }

      cb(new Error("请输入合法的手机号"));
    };

    return {
      queryList: {
        query: "",
        pagenum: 1, //4
        pagesize: 2
      },
      userInfo: {},
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      addUser: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      // 添加用户表单验证规则
      addUserRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 16, message: "长度在 6 到 16 个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      editUserRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      editInfo: {}
    };
  },
  created() {
    this.getUserInfo();
  },
  methods: {
    resetUser(){
      // 清空编辑dialog的必要性是为了 防止第二次点击同一条数据时，编辑页面仍是上一次编辑的结果
      this.$refs.editInfoRef.resetFields();
    },
    handleSizeChange(val) {
      this.queryList.pagesize = val;
      this.getUserInfo();
    },
    handleCurrentChange(val) {
      this.queryList.pagenum = val;
      this.getUserInfo();
    },
    closeAddForm() {
      this.$refs.addFormRef.resetFields();
    },
    queryResults() {
      // this.queryList.pagenum = 1
      this.getUserInfo();
    },

    async getUserInfo() {
      console.log(1);

      const { data: res } = await this.$http.get("users", {
        params: this.queryList
      });
      console.log(res);
      this.userInfo = res.data;
      this.total = res.data.total;
    },
    // 更改用户状态
    async switchStatus(uId, type) {
      const { data: res } = await this.$http.put(`users/${uId}/state/${type}`);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.$message.success(res.meta.msg);
    },
    // 添加用户表单请求
    addForm() {
      this.$refs.addFormRef.validate(async valid => {
        console.log(valid);
        if (!valid) return;
        const { data: res } = await this.$http.post("users", this.addUser);
        if (res.meta.status !== 201) this.$message.error(res.meta.msg);
        this.$message.success(res.meta.msg);
        this.addDialogVisible = false;
        this.getUserInfo();
      });
    },
    // 编辑页面渲染
    async editUserDialog(id) {
      console.log(id);
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get(`users/${id}`);
      console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.editInfo = res.data;
      this.$message.success(res.meta.msg);
    },
    // 提交编辑数据
     submitEditUser(id){
      this.$refs.editInfoRef.validate(async valid=>{
        if(!valid) return;
        const {data:res} = await this.$http.put(`users/${id}`,this.editInfo)
        if(res.meta.status !==200) this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.editDialogVisible = false
        this.getUserInfo()
      })
      
    },
    //删除用户
    async delUser(id){
      // 根据异步操作是否删除的结果来确定是否删除 删除之前一定要判断是否删除操作 error=>error 是为了出现从无时不报错
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(error=>error);
        console.log(confirmResult)
      if(confirmResult !=='confirm'){
        return this.$message.info("已取消删除")
      }

      const{data:res} = await this.$http.delete(`users/${id}`)
      if(!res.meta.status) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getUserInfo()
    }
  }
};
</script>
<style lang="less" scoped>
.el-breadcrumb {
  margin-bottom: 15px;
  font-size: 12px;
}
.el-row {
  margin-bottom: 20px;
}
</style>





// axios.get 发送参数通过包装对象{params:obj}来完成