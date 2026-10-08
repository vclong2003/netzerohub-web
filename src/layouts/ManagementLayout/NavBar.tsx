import UserActions from "./UserActions";
import styled from "styled-components";
import Image from "next/image";
import Typo from "@/components/Typo";
import { IoLeaf } from "react-icons/io5";

export default function NavBar() {
  return (
    <S.NavBar>
      <S.Logo>
        <IoLeaf color="#128085" size={36} />
        <S.LogoText variant="h5">NetZero Hub</S.LogoText>
      </S.Logo>
      <S.Divider />
      <UserActions />
    </S.NavBar>
  );
}

namespace S {
  export const NavBar = styled.nav`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    box-shadow: var(--box-shadow);
    padding: var(--s-3) var(--s-8);
    background-color: var(--c-white);
  `;

  export const Logo = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--s-3);
  `;

  export const LogoImage = styled(Image)`
    width: 36px;
    height: 36px;
  `;

  export const LogoText = styled(Typo)`
    color: #128085;
  `;

  export const Divider = styled.div`
    flex: 1;
  `;
}
