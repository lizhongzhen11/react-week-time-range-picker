import React from 'react'
import { TheadProps } from '../interface'
import { theadFirstTd, theadTimeRange, theadWithHalfHours, theadWithHours } from '../config/thead.js'

const WeekTimeRangePickerThead: React.FunctionComponent<TheadProps> = (props: TheadProps) => {
  const hours = props.hasHalfHour ? theadWithHalfHours : theadWithHours
  const colspan = props.hasHalfHour ? 1 : 2
  return (
    <thead>
      <tr>
        <th rowSpan={8} className="week-td">{ theadFirstTd }</th>
        {
          theadTimeRange.map((item, i) => {
            return <th colSpan={24} key={i}>{ item }</th>
          })
        }
      </tr>
      <tr>
        {
          hours.map((item, i) => {
            return <td colSpan={colspan} key={i}>{ item.hour }</td>
          })
        }
      </tr>
    </thead>
  )
}

export default WeekTimeRangePickerThead