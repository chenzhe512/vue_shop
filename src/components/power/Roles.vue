<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary">添加角色</el-button>

      <el-table :data="rolesList" border style="width: 100%">
        <el-table-column type="expand">
          <!-- 展开项 -->
          <template slot-scope="scope">
            <el-row v-for="item1 in scope.row.children" :key="item1.id" border>
              <!-- 一级权限 -->
              <el-col :span="5" border>
                <el-tag closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row v-for="item2 in item1.children" :key="item2.id">
                  <el-col :span="8">
                    <el-tag closable type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="16">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" width="180"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="getRolesTree(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分配权限对话框 -->
      <el-dialog title="分配权限" :visible.sync="editDialogVisible" width="50%" @close="clearTree">
        <el-tree
          :data="rolesTree"
          show-checkbox
          default-expand-all
          :default-checked-keys="checkKeys"
          node-key="id"
          :props="rolesProps"
          ref="treeRef"
        ></el-tree>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitRightsEdit()">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rolesList: [],
      editDialogVisible: false,
      rolesTree: [],
      checkKeys: [],
      editId: 0,
      rolesProps: {
        label: "authName",
        children: "children"
      }
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //   获取角色列表数据
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表失败");

      this.rolesList = res.data;
    },
    // 分配权限按钮点击--> 发送ajax获取所有权限数据  --> 结果赋值给rolesTree --> 打开dialog
    async getRolesTree(role) {
      this.editId = role.id;
      const { data: res } = await this.$http.get(`rights/tree`);
      if (res.meta.status !== 200)
        return this.$message.error("获取角色权限失败");
      this.$message.success(res.meta.msg);
      this.rolesTree = res.data;
      this.getAllThirdNode(role, this.checkKeys);
      console.log(role);
      console.log(this.checkKeys);
      this.editDialogVisible = true;
    },
    // 如果需要在获取全部节点中默认展开选中节点 及将选中的所有三级ID获取
    // 递归获取三级节点id
    getAllThirdNode(role, arr) {
      if (!role.children) {
        return arr.push(role.id);
      }
      role.children.forEach(item => this.getAllThirdNode(item, arr));
    },
    //每次关闭树形都要清空一次数组等
    clearTree() {
      this.checkKeys = [];
    },
    async submitRightsEdit() {
      // dialog的确定点击事件 2个参数 1.编辑这条数据的id（可以在点击的时候存入data关闭事件触发时清空）  2.所有半选中全选中的节点id
      const checkKeyArr = this.$refs.treeRef.getCheckedKeys();
      const halfCheckKeyArr = this.$refs.treeRef.getHalfCheckedKeys();
      const AllCheckStr = checkKeyArr.concat(halfCheckKeyArr).join(",");
      console.log(AllCheckStr);
      const { data: res } = await this.$http.post(
        `roles/${this.editId}/rights`,
        {
          rids: AllCheckStr
        }
      );
      console.log(res);
      if (res.meta.status !== 200) return this.$message.error("更新失败");
      this.$message.success("分配权限成功");
      this.getRolesList();
      this.editDialogVisible = false;
    }
  }
};
</script>
<style lang="less" scoped>
.el-row {
  border-bottom: 1px solid #eee;
}
.el-row:first-child {
  border-top: 1px solid #eee;
}
.el-col .el-row:last-child {
  border-bottom: none;
}
.el-col .el-row:first-child {
  border-top: none;
}
.el-tag {
  margin: 10px;
}
.el-row {
  display: flex;
  align-items: center;
}
.el-table {
  margin-top: 20px;
}
</style>