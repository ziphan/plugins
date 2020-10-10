<template>
  <!-- 用于查询条件的复选功能
       使用：
       <ps-multi-select
          v-model="queryCondition.appointstatus.objectvalue"
          url="/api/scm/app/base/doService"
          method="post"
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
      <span v-if="multipleSelection.length < 1" class="placeholder">{{
        "请选择" || placeholder
      }}</span>
      <span v-else v-html="textView"></span>
      <i
        class="el-icon-close"
        style="right:30px"
        @click.stop="btnClear"
        v-if="value.length > 0"
      ></i>
      <i class="el-icon-arrow-up" :class="{ down: dialogTableVisible }"></i>
    </div>
    <el-dialog
      :title="'请选择' + (title ? title : '')"
      :visible.sync="dialogTableVisible"
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
            @click="onSubmit"
            >查询</el-button
          >
          <el-button
            type="default"
            icon="el-icon-refresh"
            size="small"
            @click="resetForm('queryCondition')"
            >重置</el-button
          >
        </el-form-item>
      </el-form>

      <el-table
        stripe
        border
        ref="multipleTable"
        height="240"
        size="mini"
        v-loading="loading"
        :data="tableData"
        :row-key="getRowKey"
        @selection-change="handleSelectionChange"
        @select="handleSelect"
        @row-dblclick="toggleSelect"
      >
        <el-table-column
          align="center"
          type="selection"
          width="45"
          :reserve-selection="true"
        ></el-table-column>
        <el-table-column
          align="center"
          :prop="id_name"
          width="60"
          label="序号"
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
        <el-tag
          v-for="item in multipleSelection"
          :key="item[id_name]"
          closable
          @close="toggleSelect(item)"
          >{{ item[name] }}</el-tag
        >
      </div>

      <div style="text-align:right">
        <el-button @click="btnClear">清空</el-button>
        <el-button type="primary" @click="btnOK">确定</el-button>
        <!-- <el-button @click="btnCancel">取消</el-button> -->
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
      queryConditionLabelWidth: "100px",
      dialogTableVisible: false,
      tableData: [],
      queryCondition: {
        code: "",
        name: ""
      },
      loading: true,
      multipleSelection: [],
      textView: "",
      currentPage: 1,
      total: 0,
      params: this.data,
      loadedPages: [],
      loadedPageContent: {}
    };
  },
  model: {
    prop: "value",
    event: "click"
  },
  props: {
    value: String,
    placeholder: String,
    url: String,
    method: String,
    data: Object,
    name: String,
    code: String,
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
  watch: {
    dialogTableVisible(nv) {
      if (nv) {
        this.getTableData(1);
      } else {
        this.loading = true;
      }
    },
    // 外部清空选项时，将组建内部数据清空
    value(nv) {
      if (nv == "" && this.$refs.multipleTable) {
        this.$refs.multipleTable.clearSelection();
        this.multipleSelection = [];
      }
    }
  },
  methods: {
    onSubmit() {
      this.$refs.multipleTable.clearSelection();
      this.loadedPages = [];
      this.loadedPageContent = {};
      this.currentPage = 1;
      this.getTableData(1);
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleSelect(val, row) {
      return { val, row };
    },
    toggleSelect(row) {
      this.$refs.multipleTable.toggleRowSelection(row);
    },
    handleCurrentChange(val) {
      this.loading = true;
      this.handlePageChange(val);
    },
    handlePageChange(val) {
      const params = this.params;
      params.bizContent.jsonvalue.pager.pageno = val;
      this.params = params;
      this.getTableData(val);
    },
    /**
     * 获取列表数据
     * @param {number} n 当前页数
     * 如果 loadedPages 中已有当前页数据，则直接从 loadedPages 中提取数据
     * 如果 loadedPages 中没有当前页数据，则按照查询条件，从后台获取新的数据，并将其存入到 loadedPages 中，以供下次使用
     *
     * 出于安全考虑，表单形式的请求参数需要 encode 之后再传入到后台
     */
    getTableData(n) {
      new Promise(resolve => {
        if (this.loadedPages.indexOf(n) < 0) {
          const params = JSON.parse(JSON.stringify(this.data));
          params.bizContent.jsonvalue.pager.pageno = n;
          params.bizContent.jsonvalue.data[0].objectvalue = htmlEncode(
            this.queryCondition.code
          );
          params.bizContent.jsonvalue.data[1].objectvalue = htmlEncode(
            this.queryCondition.name
          );
          params.bizContent.jsonvalue.data = params.bizContent.jsonvalue.data.filter(
            item => item.objectvalue != ""
          );
          getDoService(params)
            .then(res => {
              const data = JSON.parse(res.data.returnJson);
              this.tableData = data.arrys;
              this.total = data.total;
              this.loadedPages.push(n);
              this.loadedPageContent["page" + n] = this.tableData;
            })
            .then(() => {
              resolve();
            });
        } else {
          this.tableData = this.loadedPageContent["page" + n];
          this.currentPage = n;
          resolve();
        }
      }).then(() => {
        this.loading = false;
      });
    },
    getRowKey(row) {
      return row[this.id_name];
    },
    btnOK() {
      const texts = this.multipleSelection.reduce(
        (result = [], item) => result.concat(item[this.name]),
        []
      );
      const codes = this.multipleSelection.reduce(
        (result = [], item) => result.concat(item[this.code]),
        []
      );
      this.textView = texts.join(",");
      this.codeLink = codes.join(",");
      this.$emit("click", this.codeLink);
      this.dialogTableVisible = false;
    },
    // btnCancel() {
    //   this.multipleSelection = this.old_multipleSelection;
    //   this.loadedPageContent = this.old_loadedPageContent;
    //   this.dialogTableVisible = false;
    // }
    btnClear() {
      this.$refs.multipleTable.clearSelection();
      this.multipleSelection = [];
      this.$emit("click", "");
    }
  }
};
</script>


<style lang="scss">
@import "../../mixins/queryCondition.scss";
.ps-multi-select {
  @include mini-dialog;
  @include wrapper;
  .ps-multi-select-view {
    @include view;
  }
  .selected-container {
    min-height: 36px;
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
}
</style>
