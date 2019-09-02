import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";
import "./assets/css/global.css";
import "./assets/fonts/iconfont.css";
import axios from "axios";
import TableTree from "vue-table-with-tree-grid";

axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
});
// axios的拦截器来拦截需要使用config.url 很难界定请求的路径 太过复杂
// axios.interceptors.response.use(config => {
//   console.log(config)
//   return config
// });

import VueQuillEditor from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

Vue.filter("dataFilter", function(baseDate) {
  const dt = new Date(baseDate);
  const dy = dt.getFullYear();
  const dM = (dt.getMonth() + 1 + "").padStart(2, "0");
  const dd = (dt.getDay() + "").padStart(2, "0");
  const dh = (dt.getHours() + "").padStart(2, "0");
  const dm = (dt.getMinutes() + "").padStart(2, "0");
  const ds = (dt.getSeconds() + "").padStart(2, "0");

  return `${dy}-${dM}-${dd} ${dh}:${dm}:${ds}`;
});
Vue.prototype.$http = axios;
Vue.config.productionTip = false;
Vue.component("table-tree", TableTree);
Vue.use(VueQuillEditor);
new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
