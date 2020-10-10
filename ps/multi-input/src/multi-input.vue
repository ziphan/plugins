<template>
  <!-- 用于查询条件的多行文本输入 -->
  <div class="ps-multi-input" ref="multipleInput">
    <div class="ps-multi-input-view" @click.stop="toggle">
      <span v-if="text.length < 1" class="placeholder">{{
        "请输入" || placeholder
      }}</span>
      <span v-else>{{ textInLine }}</span>
      <i
        class="el-icon-close"
        style="right: 30px"
        @click.stop="clear"
        v-if="text.length > 0"
      ></i>
      <i class="el-icon-arrow-up" :class="{ down: boxShow }"></i>
    </div>
    <transition name="fade">
      <el-input
        v-if="boxShow"
        class="ps-multi-input-box"
        type="textarea"
        ref="textarea"
        :rows="5"
        v-model="text"
        @input="$emit('input', textInLine)"
        @keyup.esc.native="hideBoxByEsc"
      ></el-input>
    </transition>
  </div>
</template>

<script>
export default {
  name: "PsMultiInput",
  data() {
    return {
      /**
       * 输入值
       * 输入信息时用回车分隔
       */
      text: "",
      boxShow: false,
      // 当值为 false 时才能触发 showBox 方法
      isHideOnView: false
    };
  },
  props: {
    value: String, // 外部 v-model
    placeholder: String // 默认值 '请输入'
  },
  computed: {
    /**
     * 输出值
     * 返回的字符串用逗号分隔
     */
    textInLine() {
      const texts = this.text.split("\n");
      return texts.length > 1 ? texts.join(",") : texts[0];
    }
  },
  watch: {
    /**
     * 同步内外与 el-input 数据
     * 如果用原生 input 可适当进行修改
     */
    value(nv) {
      if (nv == "") {
        this.text = "";
      }
    }
  },
  methods: {
    toggle() {
      if (this.boxShow == false && this.isHideOnView == false) {
        this.showBox();
      }
      this.isHideOnView = false;
    },
    showBox() {
      this.boxShow = true;
      document.addEventListener("click", this.hideBox, true);
      this.$nextTick(() => {
        this.$refs.textarea.focus();
      });
    },
    hideBox(e) {
      if (e) {
        if (e.target.nodeName.toLowerCase() != "textarea") {
          if (this.$refs.multipleInput.contains(e.target)) {
            this.isHideOnView = true;
          }
          this.boxShow = false;
          document.removeEventListener("click", this.hideBox, true);
        }
      }
    },
    /**
     * 输入状态中，按 Esc 键退出输入
     */
    hideBoxByEsc() {
      this.isHideOnView = false;
      this.boxShow = false;
      document.removeEventListener("click", this.hideBox, true);
    },
    clear() {
      this.text = "";
      this.$emit("input", "");
    }
  }
};
</script>

<style lang="scss">
@import "../../mixins/queryCondition.scss";
.ps-multi-input {
  @include wrapper;
  .ps-multi-input-view {
    @include view;
  }
  .ps-multi-input-box {
    position: absolute;
    left: 0;
    top: 30px;
    width: 100%;
    z-index: 999;
    .el-textarea__inner {
      white-space: nowrap;
    }
  }
  .fade-leave,
  .fade-enter-active,
  .fade-leave-active {
    opacity: 1;
    transform: scaleY(1);
    transform-origin: center top;
    transition: transform 0.1s;
    transition-timing-function: ease-out;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 1;
    transform: scaleY(0);
  }
}
</style>
