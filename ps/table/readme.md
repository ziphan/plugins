# 使用
```html
<ps-table 
    :table='table'
    @handleSizeChange="handleSizeChange"
    @handleCurrentChange="handleCurrentChange"
    @handleSelectionChange="handleSelectionChange"
>
    <!-- slot begin -->
    <template
        slot="time"
        slot-scope="scope"
    >{{scope.row.time}}</template>
    <!-- slot end -->
</ps-table>
```
# 配置
```js
table: {
    config: {
        align: 'left',
        allcheck: true,
        border: true,
        height: "auto",
        loading: false,
        ref: "multipleTable"
        size: "mini",
        stripe: true,
        useloading: true,
    },
    label: [
        {
            label: '序号',
            prop: 'id',
            width:'50',
            fixed: true
        },
        { 
            type: "selection", 
            width: "45", 
            fixed: true 
        },
        {
            label: "时间",
            slot: "time",
            width: "140"
        },
    ],
    data: [],
    page: {
        currentPage: 1,
        pageSize: 50,
        pageSizes,
        total: 0,
        layout: "total, sizes, prev, pager, next"
    }
}
```

## config - 表格配置项
| 属性       | 类型          | 默认值 | 可选值            | 说明                                                                                                        |
| ---------- | ------------- | ------ | ----------------- | ----------------------------------------------------------------------------------------------------------- |
| align      | string        | left   | left/center/right | 对齐方式                                                                                                    |
| allcheck   | boolean       | false  | true/false        | 是否启用全选/反选按钮                                                                                       |
| border     | boolean       | true   | true/false        | 是否带边框                                                                                                  |
| height     | number/string | null   | 30/30px           | 默认高度，如果height为number类型，单位px；如果height为string类型，则这个高度会设置为Table的style.height的值 |
| loading    | boolean       | false  | true/false        | loading 值，需和 useloading 一起使用                                                                        |
| ref        | string        | ''     | ''                | allcheck 为 true 时必须，关联全选和反选动作                                                                 |
| size       | string        | mini   | medium/small/mini | 表格尺寸                                                                                                    |
| stripe     | boolean       | true   | true/false        | 是否斑马线                                                                                                  |
| useloading | boolean       | true   | true/false        | 是否启动 loading，需和 loading 一起使用                                                                     |

## label - 列属性
| 属性  | 类型           | 默认值 | 可选值                    | 说明                |
| ----- | -------------- | ------ | ------------------------- | ------------------- |
| label | string         | -      | -                         | 显示的标题          |
| prop  | string         | -      | -                         | 对应列内容的字段名  |
| width | number         | -      | -                         | 列宽                |
| fixed | boolean/string | -      | true/false/left/right     | 是否固定列          |
| type  | string         | -      | ''/selection/index/expand | label类型，默认为空 |

## data - 表格数据，从外部获取

## page - 分页设置，当该属性存在时即启用分页
| 属性        | 类型   | 默认值                            | 可选值 | 说明                          |
| ----------- | ------ | --------------------------------- | ------ | ----------------------------- |
| currentPage | number | 1                                 | -      | 当前页数                      |
| layout      | string | "total, sizes, prev, pager, next" | -      | 分页 UI 配置，参考 element-ui |
| pageSize    | number | 10                                | -      | 每页条数                      |
| pageSizes   | array  | [10, 20, 50, 100]                 | -      | 每页条数设置                  |
| total       | number | 0                                 | -      | 总条数                        |

# 方法
## 组件方法
```
@handleSizeChange="handleSizeChange"			// 切换每页显示条数
@handleCurrentChange="handleCurrentChange"		// 翻页
@handleSelectionChange="handleSelectionChange"	// 触发多选事件
```
