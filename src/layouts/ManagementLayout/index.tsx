import styled from "styled-components";
import NavBar from "./NavBar";
import Drawer from "./Drawer";
import Footer from "@/components/Footer";

export function ManagementLayout({ children }: LayoutProps<"/">) {
  return (
    <ManagementPage>
      <NavBar />
      <Drawer />
      <ContentContainer>
        {children}
        <Footer />
      </ContentContainer>
    </ManagementPage>
  );
}

const ManagementPage = styled.div`
  background-color: var(--c-white-2);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  min-width: 1200px;
`;

const ContentContainer = styled.div`
  flex: 1;
  min-height: 100vh;
  padding-top: var(--s-6);
  padding-left: var(--s-8);
  padding-right: var(--s-8);
  padding-bottom: var(--s-1);
  display: flex;
  flex-direction: column;
`;
