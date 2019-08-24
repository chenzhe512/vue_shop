<template>
  <el-container class="home-container">
    <el-header class="topbar">
      <div class="topbar-left">
        <img src="../assets/heima.png" alt="logo" />
        <span>电商平台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          :router="true"
          :default-active="activePath"
          :unique-opened="true"
        >
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单的插槽 -->
            <template slot="title">
              <i :class="iconList[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->

            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="routePage('/'+subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
              
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconList: {
        "125": "iconfont icon-user",
        "103": "iconfont icon-tijikongjian",
        "101": "iconfont icon-shangpin",
        "102": "iconfont icon-danju",
        "145": "iconfont icon-baobiao"
      },
      activePath: ""
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("activePath")
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("login");
      this.$message.success("注销成功");
    },
    //  getMenuList() {
    //   // const res = this.$http.get('menus')
    //   // console.log(res);

    //   const { data: res } =  this.$http.get('menus');
    //   console.log(res);
    // },
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menuList = res.data;
    },
    routePage(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath
    }
  }
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #373d41;
  color: #fff;
  padding-left: 0;
  font-size: 20px;
  .topbar-left {
    display: flex;
    align-items: center;
    span {
      margin-left: 20px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.lineTwo {
  display: flex;
  align-items: center;
}
.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style> 


// 二级菜单中:index的作用
// 1. el-menu中的router依托index作为path进行路由跳转
// 2. default-active根据index来作为当前的激活菜单（实现：将激活的二级菜单的'/'+subItem.path传入sessionStorage  ->  cerated钩子阶段取出activePath并存入全局data  -> 绑定至:default-active
// :index="'/'+subItem.path"  与  @click="routePage('/'+subItem.path)" 两者的一致性，是保持状态的前提
// 保持一致其实只是为了将:index的值传入:default-active  就是将activePath 先存入session 然后created阶段 取出   绕了一圈传的
// :index值的不一样保证的是子菜单不能同时打开和关闭 