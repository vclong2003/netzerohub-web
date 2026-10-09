import * as S from "./index.styled";
import { TableProps } from "antd";

interface ITableProps extends TableProps {}
export default function Table({ ...props }: ITableProps) {
  return <S.Table {...props} />;
}
