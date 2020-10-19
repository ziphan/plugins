<template>
  <!-- 用于查询条件的复选功能
       使用：
       <ps-multi-select
          v-model="queryCondition.appointstatus.objectvalue"
          :data="billstatusParams"
          code="code_code"
          name="code_name"
          title="预约状态"
        ></ps-multi-select>

       从外部传入 data 参数，
       其中 data.bizContent.jsonvalue.data 数组中，
       code_code 和 code_name 必须为 [0] 和 [1]项，
       其他项放置在其后，
       fieldname 值可以在外部通过 code 和 name 属性设置
       --------------------------------------------
       billstatusParams() {
        return {
          bizContent: {
            jsonvalue: {
              pager: {
                pagesize: 10,
                pageno: 1,
              },
              data: [
                {
                  fieldname: "code_code",
                  relationObj: 7,
                  objectvalue: "",
                },
                {
                  fieldname: "code_name",
                  relationObj: 7,
                  objectvalue: "",
                },
              ],
            },
          },
          sid: "PS_EDI_SCM_listBillStatus",
          token: this.token,
          tranReqDate: parseTime(new Date()),
        };
  -->
  <div class="ps-multi-select">
    <div class="ps-multi-select-view" @click="dialogTableVisible = true">
      <span v-if="multiSelectTable.length < 1" class="placeholder">{{
        "请选择" || placeholder
      }}</span>
      <span v-else v-html="textView"></span>
      <i
        class="el-icon-close"
        style="right:30px"
        @click.stop="handleClear(2)"
        v-if="value.length > 0"
      ></i>
      <i class="el-icon-arrow-up" :class="{ down: dialogTableVisible }"></i>
    </div>
    <el-dialog
      :title="'请选择' + (title ? title : '')"
      :visible.sync="dialogTableVisible"
      @opened="dialogOpened"
      @closed="dialogClosed"
    >
      <el-form ref="queryCondition" :model="queryCondition">
        <el-form-item label="代码" prop="code">
          <el-input
            size="small"
            v-model="queryCondition.code"
            placeholder="请输入代码"
          ></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input
            size="small"
            v-model="queryCondition.name"
            placeholder="请输入名称"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="small"
            @click="handleSubmit"
            >查询</el-button
          >
          <el-button
            type="default"
            icon="el-icon-refresh"
            size="small"
            @click="handleReset('queryCondition')"
            >重置</el-button
          >
        </el-form-item>
      </el-form>

      <el-table
        stripe
        border
        height="260"
        size="mini"
        v-loading="loading"
        ref="multiSelectTable"
        :data="tableData"
        :row-key="getRowKey"
        @row-dblclick="handleToggleSelect"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          align="center"
          :prop="id_name"
          width="60"
          label="序号"
        ></el-table-column>
        <el-table-column
          align="center"
          type="selection"
          width="45"
          :reserve-selection="true"
        ></el-table-column>
        <el-table-column
          align="center"
          :prop="code"
          label="代码"
        ></el-table-column>
        <el-table-column
          align="center"
          :prop="name"
          label="名称"
        ></el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          background
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-size="10"
          layout="prev, pager, next"
          :total="total"
        ></el-pagination>
      </div>
      <el-divider></el-divider>
      <div class="selected-container">
        <div class="selected-none" v-if="multiSelectTable.length == 0">
          请从列表中选择数据
        </div>
        <el-tag
          v-else
          v-for="item in multiSelectTable"
          :key="item[id_name]"
          closable
          @close="handleToggleSelect(item)"
        >
          {{ item[name] }}
        </el-tag>
      </div>

      <div style="text-align:right">
        <el-button size="small" @click="handleClear">清空</el-button>
        <el-button size="small" @click="handleCancel">取消</el-button>
        <el-button size="small" type="primary" @click="handleOK"
          >确定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getDoService } from "@/request/api";
import { htmlEncode } from "@/utils/index";

export default {
  name: "PsMultiSelect",
  data() {
    return {
      textView: "",
      codeLink: "",
      dialogTableVisible: false,
      multiSelectTable: [],
      cachedMultiSelectTable: [],
      queryCondition: {
        code: "",
        name: ""
      },
      params: JSON.parse(JSON.stringify(this.data)),
      tableData: [],
      loading: true,
      currentPage: 1,
      total: 0
    };
  },
  props: {
    value: String,
    placeholder: String,
    data: Object,
    code: String,
    name: String,
    title: String,
    idn: String
  },
  computed: {
    /**
     * 大部分列表接口通过 temprownumber 传递序号
     * 个别会有不同，比如 客户/供应商 使用的是 page_row_number
     * 因此，如果外部没有传入 idn，则默认返回 temprownumber
     * 否则，使用外部传入的 idn
     */
    id_name() {
      if (this.idn) {
        return this.idn;
      } else {
        return "temprownumber";
      }
    }
  },
  /**
   * 自定义组件 v-model
   */
  model: {
    prop: "value",
    event: "click"
  },
  methods: {
    dialogOpened() {
      this.getTableData(this.params);
    },
    /**
     * 窗口关闭时，如果数据有变化，则执行取消动作
     */
    dialogClosed() {
      if (this.multiSelectTable != this.cachedMultiSelectTable) {
        this.handleCancel();
      }
    },
    /**
     * 出于安全考虑，表单形式的请求参数需要 encode 之后再传入到后台
     */
    handleSubmit() {
      this.loading = true;
      this.$refs.multiSelectTable.clearSelection();
      this.setJsonvalue(
        htmlEncode(this.queryCondition.code),
        htmlEncode(this.queryCondition.name)
      );
      this.params.bizContent.jsonvalue.pager.pageno = 1;
      const params = JSON.parse(JSON.stringify(this.params));
      params.bizContent.jsonvalue.data = params.bizContent.jsonvalue.data.filter(
        item => item.objectvalue != ""
      );
      this.getTableData(params);
    },
    /**
     * 重置查询条件，会重新拉取列表
     */
    handleReset(formName) {
      this.loading = true;
      this.$refs[formName].resetFields();
      this.setJsonvalue();
      this.params.bizContent.jsonvalue.pager.pageno = 1;
      this.getTableData(this.params);
    },
    /**
     * 确定动作，将 codeLink 传递到外部
     */
    handleOK() {
      this.cachedMultiSelectTable = this.multiSelectTable;
      const texts = this.multiSelectTable.reduce(
        (result = [], item) => result.concat(item[this.name]),
        []
      );
      const codes = this.multiSelectTable.reduce(
        (result = [], item) => result.concat(item[this.code]),
        []
      );
      this.textView = texts.join(",");
      this.codeLink = codes.join(",");
      this.$emit("click", this.codeLink);
      this.dialogTableVisible = false;
    },
    /**
     * 清除动作
     * type = 1 : 临时清除，可取消
     * type = 2 : 清除并保存
     */
    handleClear(type = 1) {
      this.$refs.multiSelectTable.clearSelection();
      this.multiSelectTable = [];
      if (type == 2) {
        this.cachedMultiSelectTable = [];
        this.$emit("click", "");
      }
    },
    /**
     * 取消动作，将不保留此次的操作
     */
    handleCancel() {
      const diff_1 = this.multiSelectTable.filter(item => {
        return (
          Array.prototype.indexOf.call(this.cachedMultiSelectTable, item) < 0
        );
      });
      const diff_2 = this.cachedMultiSelectTable.filter(item => {
        return Array.prototype.indexOf.call(this.multiSelectTable, item) < 0;
      });
      const diff = [...diff_1, ...diff_2];
      diff.forEach(item => {
        this.handleToggleSelect(item);
      });
      this.multiSelectTable = this.cachedMultiSelectTable;
      this.dialogTableVisible = false;
    },
    handleSelectionChange(val) {
      this.multiSelectTable = val;
    },
    handleToggleSelect(row) {
      this.$refs.multiSelectTable.toggleRowSelection(row);
    },
    handleCurrentChange(val) {
      this.loading = true;
      this.params.bizContent.jsonvalue.pager.pageno = val;
      this.getTableData(this.params);
    },
    getTableData(params) {
      getDoService(params)
        .then(res => {
          const returnJson = JSON.parse(res.data.returnJson);
          this.tableData = returnJson.arrys;
          this.total = returnJson.total;
        })
        .then(() => {
          this.loading = false;
        });
    },
    /**
     * 缓存多页选项，将多个页面选中的 item 同时保存在 multiSelectTable
     */
    getRowKey(row) {
      return row[this.id_name];
    },
    /**
     * 设置查询条件 name 和 code 的值
     * value1: code
     * value2: name
     */
    setJsonvalue(value1 = "", value2 = "") {
      this.params.bizContent.jsonvalue.data[0].objectvalue = value1;
      this.params.bizContent.jsonvalue.data[1].objectvalue = value2;
    }
  }
};
</script>

<style lang="scss">
@import "../../mixins/queryCondition.scss";
.ps-multi-select {
  @include mini-dialog;
  @include wrapper;
  th {
    line-height: 24px !important;
  }
  .ps-multi-select-view {
    @include view;
  }
  .selected-container {
    margin: 8px 0;
    height: 80px;
    overflow: auto;
    background: #fefefe;
    border: 1px solid #ebeef5;
    .selected-none {
      padding: 0 10px;
      color: #c1c1c1;
    }
  }
  .el-tag {
    margin: 0 4px;
  }

  .el-form-item + .el-form-item {
    margin-left: 16px;
  }
  .el-form-item {
    width: 30% !important;
  }
  .el-dialog {
    height: 560px;
  }
  .el-dialog__body {
    padding-bottom: 0;
    max-height: initial;
    height: 515px;
  }
}
</style>
