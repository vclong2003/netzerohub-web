"use client";

import { IoLeaf } from "react-icons/io5";
import styled, { keyframes } from "styled-components";

export function Splash() {
  return (
    <S.Wrapper>
      <S.Icon color="#128085" size={125} />
    </S.Wrapper>
  );
}

namespace S {
  const pulse = keyframes`
    0% {
      transform: scale(0.95);
      opacity: 0.8;
      filter: drop-shadow(0 0 0 rgba(18, 128, 133, 0));
    }
    50% {
      transform: scale(1.1);
      opacity: 1;
      filter: drop-shadow(0 0 18px rgba(18, 128, 133, 0.45));
    }
    100% {
      transform: scale(0.95);
      opacity: 0.8;
      filter: drop-shadow(0 0 0 rgba(18, 128, 133, 0));
    }
  `;

  export const Wrapper = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: var(--c-white);
  `;

  export const Icon = styled(IoLeaf)`
    animation: ${pulse} 2s ease-in-out infinite;
    will-change: transform, filter;
  `;
}
