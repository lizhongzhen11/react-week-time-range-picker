# react-week-time-range-picker

## 用法 | usage
```js
npm install react-week-time-range-picker --save-dev

// jsx/tsx
import ReactWeekTimeRangePicker from 'react-week-time-range-picker'

const Test = () => {
  // 获取选中的值
  const handleSelectTimeRange = (selectedData) => {
    console.log(selectedData)
  }
}
<react-week-time-range-picker hasHalfHour={true} selectedData={[]} selectTimeRange={handleSelectTimeRange} />
```

## API

```js
interface ReactWeekTimeRangePickerProps {
  hasHalfHour?: boolean; // true | false (默认带半小时 | default with half-hour)
  selectedData?: SelectedDataProps[];
  selectTimeRange?: (checked: SelectedDataProps[]) => void // 接收选中的时间 | receive selected time
}

// selectedData 数据结构/Data Structures
[
  {
    iden: '3',
    mergeTimes: [['02:30', '03:00']],
    times: ['02:30'],
    week: '星期四'
  }
]
```

## 图示

见<a href="https://github.com/lizhongzhen11/vue-week-time-range-picker">vue-week-time-range-picker</a>

## 兼容性 | compatible
|          | chrome |
|  ----    |  ----  |
| version  |   77   |

### 注意
1. 测试发现，edge浏览器中会受margin和padding影响，从而导致框选有偏差，建议不要对其父元素使用margin和padding。
2. 测试发现，直接引入时，左侧偏移位置有出入，目前修复，待反馈。
3. react hooks写的组件发包大坑啊，看这个issue <a href="https://github.com/facebook/react/issues/17014">17014</a>还有这个解决方法：<a href="https://github.com/facebook/react/issues/16029#issuecomment-518156374">solution</a>