import Typo from "@/components/Typo";
import styled from "styled-components";
import { IoLeaf } from "react-icons/io5";

import Footer from "@/components/Footer";
import Image from "next/image";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <S.AuthPage>
      <S.Logo>
        <IoLeaf color="#128085" size={50} />
        <S.LogoText variant="h3">NetZero Hub</S.LogoText>
      </S.Logo>
      {/* Content goes here ------- */}
      {children}
      {/* End of content ---------- */}
      <Footer />
    </S.AuthPage>
  );
}

namespace S {
  export const AuthPage = styled.div`
    padding-top: var(--s-10);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    align-items: center;
  `;

  export const Logo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--s-2);
    margin-bottom: var(--s-10);
  `;

  export const LogoImage = styled(Image)`
    width: 160px;
    height: auto;
  `;

  export const LogoText = styled(Typo)`
    color: #128085;
  `;
}
