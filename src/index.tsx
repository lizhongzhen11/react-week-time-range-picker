import React, { useState, useEffect } from "react";
import "./less/base.less"
import "./less/index.less"
import "./less/time-range-picker-common.less"
import { SelectedDataProps, ReactWeekTimeRangePickerProps, DragProps } from './interface'
import WeekTimeRangePickerThead from './components/weekTimeRangePickerThead'
import WeekTimeRangePickerTbody from './components/WeekTimeRangePickerTbody'


let isFocus = false // 判断是否是由点击获取的焦点
let isMoveout = false // 判断是否移出时间选择范围
let startX = 0 // 记录起始点点击时e.clientX
let startY = 0 // 记录起始点点击时e.clientY
let startLayerX = 0 // 记录起始点对应td的左上角距table的x轴距离
let startLayerY = 0 // 记录起始点对应td的左上角距table的y轴距离
let topY = 0 // 记录起始点点击时边界纵向偏差
let leftX = 0 // 记录起始点点击时layerX - 该td左侧距table左侧的距离
let popperTop = 0 // 记录提示框相较于table底部偏移值
let popperLeft = 0 // 记录提示框table左侧偏移值
let currentVal = '' // 缓存当前td对应的星期和小时拼接后的字符串
let nextTime = '' // 缓存当前时间的下一时间，例如当前在 00:00位置，其下一时刻应该是00:30或者01:00(根据hasHalfHour确定)

const ReactWeekTimeRangePicker: React.FunctionComponent<ReactWeekTimeRangePickerProps> = (props: ReactWeekTimeRangePickerProps) => {
  const [isDrag, setIsDrag] = useState(false) // 控制拖拽框显影
  const [top, setTop] = useState(0)
  const [left, setLeft] = useState(0)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [cacheChecked, setCacheChecked] = useState<SelectedDataProps[]>(props.selectedData || []) // 缓存被选中的时间数据

  useEffect(() => {
    document.body.addEventListener('mouseup', handleMouseup)
    document.body.addEventListener('mousemove', handleMousemove)
    return () => {
      document.body.removeEventListener('mouseup', handleMouseup)
      document.body.removeEventListener('mousemove', handleMousemove)
    }
  })

  const { hasHalfHour, selectTimeRange } = props


  // 获取被选中的数据，并抛给父组件
  const handleSelect = (selected: SelectedDataProps[]) => {
    setCacheChecked(selected)
    selectTimeRange && selectTimeRange(selected)
  }

  // 拖拽超过table范围后才释放
  const handleMouseup = (e) => {
    if (e && !e.target.dataset.hour) {
      setIsDrag(false)
    }
  }
  // 拖拽超过table范围
  const handleMousemove = (e) => {
    if (!e.target.dataset.hour) {
      isMoveout = true
    }
  }

  const handleMoveout = (isOut: boolean) => {
    isMoveout = isOut
  }

  // 计算拖拽框区域的核心代码
  const handleDrag = (props: DragProps) => {
    const { type, clientX, clientY, layerX, layerY, iden, hour, value, isDrag } = props
    if (type === 'up') {
      setIsDrag(false)
      isFocus = false
      return
    }
    let tempWidth, tempHeight
    const factor = hasHalfHour ? 2 : 1 // 根据是否有半小时来确定td偏移的倍数
    // 将起始点所在td对应的时间，例如'10:00'转换成['10', '00']格式
    const hourMinuteArr = hour.split(':')
    // 确定起始点所在td对应该行第几个td，用来确定 起始点所在td的clientX和clientY
    const tdIndex = ~~hourMinuteArr[1] ? ~~hourMinuteArr[0] * factor + 1 : ~~hourMinuteArr[0] * factor
    type === 'down' ? 
      handleDragDown({ clientX, clientY, layerX, layerY, iden, tdIndex }) :
        handleDragMove({ isDrag, layerX, layerY, tempWidth, tempHeight, iden, hour, value })
  }
  // 按下
  const handleDragDown = ({ clientX, clientY, layerX, layerY, iden, tdIndex }) => {
    setWidth(0)
    setHeight(0)
    setIsDrag(true)
    startX = clientX
    startY = clientY
    topY = layerY - iden * 20 - 40
    leftX = layerX - tdIndex * 16 - 60
    startLayerX = tdIndex * 16 + 60
    startLayerY = (~~iden * 20) + 40
    isFocus = false
    setTop(startY - topY)
    setLeft(startX - leftX)
  }
  // 可能是普通移动，也可能是拖拽移动
  const handleDragMove = ({ isDrag, layerX, layerY, tempWidth, tempHeight, iden, hour, value }) => {
    if (isDrag) {
      let diffX = layerX - startLayerX
      let diffY = layerY - startLayerY
      tempWidth = diffX > 0 ? diffX : 16 - diffX
      tempHeight = diffY > 0 ? diffY : 20 - diffY
      const newWidth = tempWidth % 20 === 0 && diffX > 0 ? Math.ceil(tempWidth / 16) * 16 + 1 : Math.ceil(tempWidth / 16) * 16
      const newHeight = tempHeight % 20 === 0 && diffY > 0 ? Math.ceil(tempHeight / 20) * 20 + 20 : Math.ceil(tempHeight / 20) * 20
      setWidth(newWidth)
      setHeight(newHeight)
      diffX < 0 ? setLeft(startX - leftX - width + 16) : setLeft(startX - leftX)
      diffY < 0 ? setTop(startY - topY - height + 20) : setTop(startY - topY)
    }
    isFocus = true
    // setIsFocus(true)
    // tipPosition(iden, hour, value)
  }

  /**
   * @param {string} iden 当前td所在的星期几
   * @param {string} tdIndex 当前td位于该tr的位置
   * @desc 计算提示框的位置
   *       popperLeft: 计算提示框距table左侧偏移值，
   *       popperLeft = 该td距离 week-td 右侧的水平距离 - ? (根据带不带半小时来计算)
   *       ? ==> 依赖提醒框内容宽度，不带半小时的话 === 内容框宽度一半，正好是31 近似 32
   *       popperTop: 计算提示框距table下方偏移值，
   *       popperTop = 该td所在的星期距离thead的垂直高度 + thead高度 - (table实时高度 + 提醒框高度)
   *       bug修复：
   *          1.当选中超过7个间隔的时间段后，该星期会占两行，高度由21增加为42，所以需要遍历所选时间数据，确定一共占几行
   */
  //  const tipPosition = (iden, time, value) => {
  //    const hour = ~~time.substring(0, 2)
  //    const minute = ~~time.substring(3)
  //    currentVal = value
  //   //  const tableHeight = this.$refs.table.clientHeight
  //   //  popperTop = (~~iden + 1) * 20 + 40 - tableHeight - 55
  //    // 只有小时
  //    if (!hasHalfHour) {
  //      nextTime = hour + 1 >= 10 ? `${hour + 1}:00` : `0${hour + 1}:00`
  //      popperLeft = (hour - 1) * 16 + 13
  //      return
  //    }
  //    if (minute === 30) {
  //      nextTime = hour + 1 >= 10 ? `${hour + 1}:00` : `0${hour + 1}:00`
  //      popperLeft = (hour * 2) * 16 + 13
  //      return
  //    }
  //    nextTime = time.substring(0, 2) + ':30'
  //    popperLeft = (hour * 2 - 1) * 16 + 13
  //  }

  return (
    <div className="week-time-range-picker" style={
      hasHalfHour ? {maxWidth: '830px'} : {maxWidth: '450px'}
    }>
      {/* 拖拽框 */}
      {
        isDrag ? 
          <div className="wtrp-schedule" style={
            {
              left: `${left}px`,
              top: `${top}px`,
              width: `${width}px`,
              height: `${height}px`
            }
          }>
          </div> : null
      }
      <table className="wtrp-table">
        <WeekTimeRangePickerThead hasHalfHour={hasHalfHour} />
        <WeekTimeRangePickerTbody hasHalfHour={hasHalfHour} checkedDatas={cacheChecked} 
          handleDrag={handleDrag} 
          handleSelect={handleSelect} 
          handleMoveout={handleMoveout} 
        />
      </table >
      {/* <div className="wtrp-byted-popover-wrapper">
        <div className="ant-tooltip ant-tooltip-placement-top ant-tooltip-hidden">
          <div className="ant-tooltip-content">
            <div className="ant-tooltip-arrow"></div>
            <div className="ant-tooltip-inner">{1}</div>
          </div>
        </div>
      </div> */}
    </div >
  )
}

export default ReactWeekTimeRangePicker