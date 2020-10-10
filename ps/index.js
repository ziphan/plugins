/**
 * 宝胜前端插件
 * 将常用组件改为插件，进行全局注册，方便开发使用
 * 在 main.js 中 Vue.use(Ps) 即可
 */
import MultiInput from "./multi-input/index.js";
import MultiSelect from "./multi-select/index.js";
import Table from "./table/index.js";

const components = [MultiInput, MultiSelect, Table];

const install = function(Vue) {
  components.forEach((component) => {
    Vue.component(component.name, component);
  });
};

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default install;
