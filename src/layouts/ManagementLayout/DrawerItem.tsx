"use client";

import Typo from "@/components/Typo";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";

interface IDrawerItemProps {
  to: string;
  label: string;
  icon: StaticImageData;
  exact?: boolean;
}
export default function DrawerItem({
  to,
  label,
  icon,
  exact = false,
}: IDrawerItemProps) {
  const pathname = usePathname();

  // 3. Check if active (supports both exact match and sub-paths)
  const isActive = exact
    ? pathname === to
    : pathname === to || (to !== "/" && pathname.startsWith(`${to}/`));

  return (
    <S.DrawerItem href={to} className={isActive ? "active" : ""}>
      <S.Icon>
        <S.IconImage src={icon} alt="icon" />
      </S.Icon>
      <S.Text variant="body1">{label}</S.Text>
    </S.DrawerItem>
  );
}

namespace S {
  export const DrawerItem = styled(Link)`
    display: flex;
    font-display: row;
    align-items: center;
    padding: var(--s-2) var(--s-3);
    padding-right: var(--s-4);
    margin-bottom: var(--s-3);
    border-radius: var(--br-2);
    cursor: pointer;
    text-decoration: none;
    background-color: transparent;
    &.active {
      background-color: #127f851a;
    }
  `;

  export const Icon = styled.div`
    background-color: var(--c-white);
    margin-right: var(--s-3);
    display: flex;
    padding: var(--s-2);
    border-radius: 50%;
  `;

  export const IconImage = styled(Image)`
    width: 24px;
    height: 24px;
  `;

  export const Text = styled(Typo)`
    color: #0b6267;
  `;
}
