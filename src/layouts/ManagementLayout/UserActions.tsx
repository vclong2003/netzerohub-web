"use client";

import { Popover } from "antd";
import { Avatar } from "@/components/Avatar";
import styled from "styled-components";
import Typo from "@/components/Typo";
import Button from "@/components/Button";
import Link from "next/link";
import { AuthQueries } from "@/services/service.auth";
import { useQueryClient } from "@tanstack/react-query";
import { AuthStorage } from "@/auth/auth.utils";
import { useRouter } from "next/navigation";

export default function UserActions() {
  const router = useRouter();
  const { data: me } = AuthQueries.useMyAccount();
  const queryClient = useQueryClient();

  const logout = () => {
    AuthStorage.clearAuthStorage();
    queryClient.clear();
    router.replace("/login");
  };

  const Menu = (
    <S.UserActionsMenu>
      <S.UserInfo>
        <Avatar username="admin" />
        <div>
          <S.Username variant="body1">
            {me?.firstName + " " + me?.lastName}
          </S.Username>
          <S.Email variant="body2">{me?.email}</S.Email>
        </div>
      </S.UserInfo>
      <S.LogoutBtn size="large" onClick={logout}>
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
  export const Email = styled(Typo)`
    color: #a5a5a5;
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
