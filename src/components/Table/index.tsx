import { Table as BaseTable } from "antd";
import * as S from "./index.styled";
import { ComponentProps } from "react";

export default function Table({ ...props }: ComponentProps<typeof BaseTable>) {
  return <S.Table {...props} />;
}
