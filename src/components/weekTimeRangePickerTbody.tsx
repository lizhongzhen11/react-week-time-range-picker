import React, { useState, useEffect } from 'react'
import { TbodyProps, SelectedDataProps } from '../interface'
import { theadWithHalfHours, theadWithHours } from '../config/thead.js'
import { weeks } from '../config/tbody.js'
import { sort, sortHour, handleRange, handleDayRange, handleCheckedData } from '../util'
import "../less/time-range-picker-tbody.less"
import WeekTimeRangeSelected from './weekTimeRangeSelected'

let hasStart = false // 判断mousedown时起始点是否在cacheChecked中
let isDrag = false
let cach = {
  cacheStart: { // 缓存mousedown的起始时间数据
    iden: '',
    hour: '',
    group: ''
  },
  cacheEnd: { // 缓存mouseup的终点时间数据
    iden: '',
    hour: '',
    group: ''
  }
}


const WeekTimeRangePickerTbody: React.FunctionComponent<TbodyProps> = (props: TbodyProps) => {
  const [checkedDatas, setCheckedDatas] = useState<SelectedDataProps[]>(props.checkedDatas)
  const { hasHalfHour, handleDrag, handleSelect, handleMoveout } = props
  const hours = hasHalfHour ? theadWithHalfHours : theadWithHours
  const colspan = hasHalfHour ? 1 : 2

  useEffect(() => {
    document.body.addEventListener('mouseup', handleBodyMouseup)
    return () => document.body.removeEventListener('mouseup', handleBodyMouseup)
  })

  const handleBodyMouseup = (e) => {
    if (e && !e.target.dataset.hour) {
      isDrag = false
    }
  }

  /**
   * @desc mousedown事件时记录下对应的起始时间数据
   *       头条是根据起始点来确定选中或者取消选中的，所以应先判断起始点是否处于选中状态，
   *       如果是则框选范围内的时间全部取消选中，否则全部选中。
   */
  const handleMousedown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    isDrag = true
    if (setVal(e, 'cacheStart')) {
      const dragData = {
        type: 'down',
        clientX: e.clientX,
        clientY: e.clientY,
        layerX: e.nativeEvent.layerX,
        layerY: e.nativeEvent.layerY,
        iden: cach.cacheStart.iden,
        hour: cach.cacheStart.hour
      }
      handleDrag(dragData)
    }
    isHasStart(cach.cacheStart.iden, cach.cacheStart.hour)
  }
  /**
   * @desc mouseup事件时记录下对应的终点时间数据，同时去计算选中的时间范围
   */
  const handleMouseup = (e) => {
    e.preventDefault()
    e.stopPropagation()
    isDrag = false
    setVal(e, 'cacheEnd')
    clearCache('cacheStart')
    clearCache('cacheEnd')
    handleDrag({type: 'up'})
    handleSelect(checkedDatas)
  }
  const handleMousemove = (e) => {
    if (!e.target.dataset.hour) {
      return
    }
    handleMoveout(false)
    const dragData = {
      type: 'move',
      clientX: e.clientX,
      clientY: e.clientY,
      layerX: e.nativeEvent.layerX,
      layerY: e.nativeEvent.layerY,
      iden: e.target.dataset.iden,
      hour: e.target.dataset.hour,
      value: e.target.dataset.value,
      isDrag: isDrag
    }
    handleDrag(dragData)
  }
  /**
   * @desc 处理数据 移入/移出 cacheChecked。
   *       1.需要判断cacheChecked中该日期是否已存在该hour，若没有需要加入，否则删除
   *       2.需要判断cacheChecked中是否已存在该iden，若没有需要加入，若存在但是该iden中的hour全部取消选中则删除该iden
   */
  const handleData = (iden, hour) => {
    let cacheChecked = checkedDatas
    const {has, idenIndex, index} = isHasStart(iden, hour)
    if (!has) {
      cacheChecked.push({
        iden: iden,
        times: [hour]
      })
      setCheckedDatas([...cacheChecked]) // 大坑，重新开辟一个数组引用才行
      return
    }
    if (!hasStart) {
      cacheChecked[idenIndex].times.push(hour)
      setCheckedDatas([...cacheChecked])
      return
    }
    const exist = cacheChecked[idenIndex].times.length === 1
    exist ? cacheChecked.splice(idenIndex, 1) : cacheChecked[idenIndex].times.splice(index, 1)
    setCheckedDatas([...cacheChecked])
  }
  /**
   * @desc 触发事件时，抽出相同赋值代码
   */
  const setVal = (e, key) => {
    if (e.target.dataset.hour) {
      let iden = e.target.dataset.iden,
          hour = e.target.dataset.hour
      cach[key].iden = iden
      cach[key].hour = hour
      cach[key].group = iden + hour
      key === 'cacheStart' && isHasStart(iden, hour)
      key === 'cacheEnd' && cach[key].group === cach.cacheStart.group && handleData(iden, hour)
      key === 'cacheEnd' && cach[key].group !== cach.cacheStart.group && confirmRange()
      return true
    }
    return false
  }
  // 清除缓存的cacheStart和cacheEnd
  const clearCache = (key) => {
    cach[key].iden = ''
    cach[key].hour = ''
    cach[key].group = ''
  }
  // 清空所有数据
  const handleEmpty = () => {
    hasStart = false
    clearCache('cacheStart')
    clearCache('cacheEnd')
    setCheckedDatas([])
  }
  /**
   * @desc 鉴于click和mousedown时都需要遍历数组去确定当前时间是否已经存在，所以抽出公共代码
   *       返回的值：
   *       has: 判断cacheChecked中是否存在该iden，即周一至周日的某天
   *       idenIndex: 该iden在cacheChecked中下标，
   *       index：该hour在cacheChecked中对应日期中的下标
   */
  const isHasStart = (iden, hour?: string) => {
    hasStart = false
    let cacheChecked = checkedDatas,
        l = cacheChecked.length,
        has = false,
        index,
        idenIndex
    for (let i = 0; i < l; i++) {
      if (cacheChecked[i].iden === iden) {
        idenIndex = i
        index = cacheChecked[i].times.indexOf(hour)
        has = true
        hasStart = index !== -1
        break
      }
    }
    return {has, idenIndex, index}
  }
  /**
   * @desc 根据 cacheStart 和 cacheEnd 确定时间范围，修改cacheChecked
   *       hasStart false 框选范围内 时间做选中操作
   *                true 框选范围内 时间做取消选中操作
   */
  const confirmRange = () => {
    let daysArr = [cach.cacheStart.iden, cach.cacheEnd.iden],
        hoursArr = [cach.cacheStart.hour, cach.cacheEnd.hour],
        cacheChecked = checkedDatas,
        tempHasStart = hasStart;
    const dayRange = handleDayRange(daysArr.sort(sort))
    const timeRange = handleRange(hasHalfHour, hoursArr.sort(sortHour)) // 框选的时间范围
    for (let i = 0; i < dayRange.length; i++) {
      let {has, idenIndex} = isHasStart(dayRange[i])
      handleCheckedData({ cacheChecked, hasStart: tempHasStart, has, idenIndex, iden: dayRange[i], timeRange})
    }
  }

  return (
    <tbody className="wtrp-tbody" 
      onMouseDown={handleMousedown}
      onMouseUp={handleMouseup}
      onMouseMove={handleMousemove}
    >
      {
        weeks.map((item, i) => {
          return (
            <tr className="wtrp-tbody-tr" key={i}>
              <td className="week-td">{item.week}</td>
              {
                hours.map((hour, index) => {
                  return (
                    <td colSpan={colspan} 
                      className={
                        checkedDatas.some(checked => {
                          return checked.iden === item.iden && checked.times.includes(hour.time)
                        }) ? 'wtrp-active-td' : 'wtrp-freeze-td'
                      }
                      key={index} 
                      data-hour={hour.time} 
                      data-iden={item.iden}
                      data-value={`${item.week} ${hour.time}`}
                    >
                    </td>
                  )
                })
              }
            </tr>
          )
        })
      }
      <WeekTimeRangeSelected hasHalfHour={hasHalfHour} checkedDatas={checkedDatas} handleEmpty={handleEmpty}/>
    </tbody>
  )
}

export default WeekTimeRangePickerTbody