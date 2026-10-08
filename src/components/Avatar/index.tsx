import { JSX } from "react";

import * as S from "./index.styled";

interface IAvatarProps extends JSX.IntrinsicAttributes {
  username?: string;
}
export function Avatar({ username, ...props }: IAvatarProps) {
  return <S.Avatar {...props}>{username?.slice(0, 2).toUpperCase()}</S.Avatar>;
}
