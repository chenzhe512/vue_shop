import Vue from "vue";
import Router from "vue-router";
import Home from "./components/Home.vue";
import Login from "./components/Login";
import Welcome from "./components/Welcome";
import Users from "./components/user/Users";
import Rights from "./components/power/Rights";
import Roles from "./components/power/Roles";
import Cate from "./components/goods/Cate";
import Params from "./components/goods/Params";
import Goods from "./components/goods/Goods";
import Add from "./components/goods/Add";
import Order from "./components/order/Order";

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      redirect: "/login"
    },
    {
      path: "/login",
      component: Login
    },
    {
      path: "/home",
      component: Home,
      redirect: "/welcome",
      children: [
        { path: "/welcome", component: Welcome },
        { path: "/users", component: Users },
        { path: "/rights", component: Rights },
        { path: "/roles", component: Roles },
        { path: "/categories", component: Cate },
        { path: "/params", component: Params },
        { path: "/goods", component: Goods },
        { path: "/add", component: Add,name:'add' },
        { path: "/orders", component: Order },
      ]
    }
  ]
});
