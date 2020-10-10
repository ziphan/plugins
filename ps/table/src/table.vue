<template>
  <div class="ps-table">
    <el-table
      :border="table.config.border || true"
      :data="table.data"
      :height="table.config.height || 'auto'"
      :size="table.config.size || 'mini'"
      :stripe="table.config.stripe || true"
      :style="table.config.style || ''"
      @selection-change="handleSelectionChange"
      @row-dblclick="toggleSelect"
      v-loading="table.config.useloading && table.config.loading"
      ref="multipleTable"
    >
      <template v-for="(cell, index) in table.label">
        <!-- slot 配置 -->
        <el-table-column
          v-if="cell.slot"
          :key="`cell_${index}`"
          :label="cell.label || ''"
          :show-overflow-tooltip="true"
          :width="cell.width || ''"
          :fixed="cell.fixed || false"
        >
          <template slot-scope="scope">
            <slot :name="cell.slot" :row="scope.row"></slot>
          </template>
        </el-table-column>

        <!-- 其他 -->
        <el-table-column
          v-else
          :key="`cell_${index}`"
          :label="cell.label || ''"
          :prop="cell.prop || ''"
          :show-overflow-tooltip="true"
          :width="cell.width || ''"
          :type="cell.type || ''"
          :fixed="cell.fixed || false"
        ></el-table-column>
      </template>
    </el-table>

    <div class="pagination" v-if="table.page">
      <div v-if="table.config.allcheck || false">
        <el-button
          size="mini"
          @click="checkAll(table.data)"
          :disabled="table.data == [] || !table.data"
          >全选</el-button
        >
        <el-button
          size="mini"
          @click="toggleAll(table.data)"
          :disabled="table.data == [] || !table.data"
          >反选</el-button
        >
      </div>
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="table.page.currentPage || 1"
        :page-sizes="table.page.pageSizes || [10, 20, 50, 100]"
        :page-size="table.page.pageSize || 50"
        :layout="table.page.layout"
        :total="table.page.total || 0"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: "PsTable",
  data() {
    return {
      isAllChecked: false,
    };
  },
  props: {
    table: Object,
  },
  methods: {
    handleSizeChange(val) {
      this.$emit("handleSizeChange", val);
    },
    handleCurrentChange(val) {
      this.$emit("handleCurrentChange", val);
    },
    handleSelectionChange(val) {
      this.$emit("handleSelectionChange", val);
    },
    toggleAll(rows) {
      rows.forEach((row) => {
        this.$refs.multipleTable.toggleRowSelection(row);
      });
    },
    checkAll(rows) {
      rows.forEach((row) => {
        this.$refs.multipleTable.toggleRowSelection(row, true);
      });
    },
    toggleSelect(row) {
      this.$refs.multipleTable.toggleRowSelection(row);
    },
  },
};
</script>

<style lang="scss" scoped>
.ps-table {
  .el-link + .el-link {
    margin-left: 10px;
  }
  .pagination {
    display: flex;
    padding-top: 16px;
    .el-pagination {
      flex: 1;
      text-align: right;
    }
    .el-button {
      height: 28px;
    }
  }
}
</style>
