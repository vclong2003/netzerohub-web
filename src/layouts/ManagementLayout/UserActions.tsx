"use client";

import { Popover } from "antd";
import { Avatar } from "@/components/Avatar";
import styled from "styled-components";
import Typo from "@/components/Typo";
import Button from "@/components/Button";
import Link from "next/link";

export default function UserActions() {
  // const { me } = useMe();

  const Menu = (
    <S.UserActionsMenu>
      <S.UserInfo>
        <Avatar username="admin" />
        <S.Username variant="h5">
          okok
          {/* {me?.firstName + " " + me?.lastName} */}
        </S.Username>
      </S.UserInfo>
      <S.LogoutBtn
        size="large"
        // onClick={logout}
      >
        Sign Out
      </S.LogoutBtn>
    </S.UserActionsMenu>
  );

  return (
    <Popover content={Menu} trigger={"click"}>
      <Avatar username="admin" />
    </Popover>
  );
}

namespace S {
  export const UserActionsMenu = styled.div`
    width: 300px;
    padding: var(--s-1) var(--s-2);
  `;

  export const UserInfo = styled.div`
    display: flex;
    gap: var(--s-2);
    align-items: center;
    margin-bottom: var(--s-5);
  `;
  export const Username = styled(Typo)`
    color: var(--c-black);
  `;

  export const LogoutBtn = styled(Button)`
    width: 100%;
    margin-bottom: var(--s-2);
  `;

  export const ResetPasswordBtn = styled(Link)`
    text-decoration: none;
    color: var(--c-blue);
    font-size: var(--fs-body2);
  `;
}
