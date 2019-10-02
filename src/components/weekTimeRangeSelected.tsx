import React from 'react'
import "../less/base.less"
import "../less/time-range-picker-select.less"
import { SelectedProps } from '../interface'
import { weekMaps } from '../config/tbody.js'

/**
 * @desc 对被选中的日期排序，
 *       按iden排：星期一 ~ 星期日
 *       按time排：00:00~23:00
 */
const sort = (curr, next) => {
  if (curr.iden) {
    return curr.iden - next.iden
  }
  // 对 00:00和00:30排序
  if (curr.substring(0, 2) === next.substring(0, 2)) {
    return curr.substring(3) - next.substring(3)
  }
  return curr.substring(0, 2) - next.substring(0, 2)
}

/**
   * @desc 合并times，将 [00:00, 01:00, 02:00]等不间隔的时间段合并
   *       如果带半小时，那么就需要 [00:00, 00:30, 01:00] 才能合并成[00:00, 01:00]
   */
const handleMergeTimes = (hasHalfHour, times) => {
  let mergeTimes = [[times[0]]]
  hasHalfHour ? handleMergeHalfHour(times, mergeTimes) : handleMergeHour(times, mergeTimes)
  return mergeTimes
}

// 只有小时的数据合并
const handleMergeHour = (times, mergeTimes) => {
  times.forEach(item => {
    const lastMergeArr = mergeTimes.slice(-1)[0]
    const isNext = item.substring(0, 2) - lastMergeArr.slice(-1)[0].substring(0, 2) === 1
    if (isNext) {
      lastMergeArr.push(item)
    }
    if (!isNext && item !== times[0]) {
      mergeTimes.push([item])
    }
  })
}

// 带半小时的数据合并
const handleMergeHalfHour = (times, mergeTimes) => {
  times.forEach(item => {
    const lastMergeArr = mergeTimes.slice(-1)[0]
    // 00:00-00:30 或者 00:30 - 01:00
    // 小时*100 + 0或50，半小时转成50
    const lastMergeItem = lastMergeArr.slice(-1)[0]
    const itemNum = item.substring(0, 2) * 100 + (item.substring(3) === '30' ? 50 : 0)
    const lastMergeNum = lastMergeItem.substring(0, 2) * 100 + (lastMergeItem.substring(3) === '30' ? 50 : 0)
    const isNext = itemNum - lastMergeNum === 50
    if (isNext) {
      lastMergeArr.push(item)
    }
    if (!isNext && item !== times[0]) {
      mergeTimes.push([item])
    }
  })
  mergeTimes.forEach((item, index) => {
    const hour = +item.slice(-1)[0].substring(0, 2)
    if (item.slice(-1)[0].substring(3) === '30') {
      hour > 8 ? item.push(`${hour + 1}:00`) : item.push(`0${hour + 1}:00`)
    } else {
      hour > 8 ? item.push(`${hour}:30`) : item.push(`0${hour}:30`)
    }
  })
}

// 如果是只有小时的话，需要处理下
const fromat = (last) => {
  const hour = ~~last.substring(0, 2) + 1
  return hour > 9 ? `${hour}:00` : `0${hour}:00`
}

const WeekTimeRangeSelected: React.FunctionComponent<SelectedProps> = (props: SelectedProps) => {
  const { hasHalfHour, checkedDatas, handleEmpty } = props

  // 增加数据字段，方便展示
  let cacheChecked = checkedDatas || []
  cacheChecked.sort(sort).map((item, index) => {
    cacheChecked[index].week = weekMaps.get(item.iden)
    cacheChecked[index].mergeTimes = handleMergeTimes(hasHalfHour, item.times.sort(sort))
  })

  // 清除
  const handleClear = () => {
    handleEmpty()
  }
  
  return (
    <tr className="wtrp-time-range-selected">
      <td colSpan={49} className="wtrp-selected-td">
        <div className="wtrp-clearfix">
          {
            checkedDatas.length === 0 ? 
              <span className="wtrp-fl tip-text">可拖动鼠标选择时间段</span> :
              <span className="wtrp-fl tip-text">已选择时间段</span>
          }
          <a className="wtrp-fr" onClick={handleClear}>清空选择</a>
        </div>
        {
          cacheChecked.map((item, i) => {
            return (
              <div className="wtrp-selected-td__selected-time" key={i}>
                <p className="wtrp-flex wtrp-break">
                  <span className="tip-text">{item.week}：</span>
                  <span className="wtrp-flex-1">
                    {
                      item.mergeTimes.map((time, timeIndex) => {
                        return <span className="wtrp-selected-text" key={timeIndex}>
                          {hasHalfHour ? `${time[0]}~${time[time.length - 1]}` : `${time[0]}~` + fromat(time[time.length - 1])}
                        </span>
                      })
                    }
                  </span>
                </p>
              </div>
            )
          })
        }
      </td>
    </tr>
  )
}

export default WeekTimeRangeSelected