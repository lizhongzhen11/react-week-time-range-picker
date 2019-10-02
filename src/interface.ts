import { PropsWithChildren } from "react";

export interface SelectedDataProps {
  iden?: string;
  mergeTimes?: string[][];
  times?: string[];
  week?: string;
}

export interface ReactWeekTimeRangePickerProps extends PropsWithChildren<{}> {
  hasHalfHour?: boolean;
  selectedData?: SelectedDataProps[];
  selectTimeRange?: (checked: SelectedDataProps[]) => void
}

export interface DragProps {
  type: string;
  clientX?: number;
  clientY?: number;
  layerX?: number;
  layerY?: number;
  iden?: string;
  hour?: string;
  value?: string;
  isDrag?: boolean;
}

export interface TheadProps extends PropsWithChildren<{}> {
  hasHalfHour: Boolean;
}

export interface TbodyProps extends PropsWithChildren<{}> {
  hasHalfHour: Boolean;
  checkedDatas?: SelectedDataProps[];
  handleDrag: (props: DragProps) => void;
  handleSelect: (selected: SelectedDataProps[]) => void;
  handleMoveout: (isOut: boolean) => void;
}

export interface SelectedProps extends PropsWithChildren<{}> {
  hasHalfHour: Boolean;
  checkedDatas?: SelectedDataProps[];
  handleEmpty: () => void
}