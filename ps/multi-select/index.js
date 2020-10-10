import PsMultiSelect from "./src/multi-select";

PsMultiSelect.install = function(Vue) {
  Vue.component(PsMultiSelect.name, PsMultiSelect);
};

export default PsMultiSelect;
