import PsTable from "./src/table";

PsTable.install = function(Vue) {
  Vue.component(PsTable.name, PsTable);
};

export default PsTable;
