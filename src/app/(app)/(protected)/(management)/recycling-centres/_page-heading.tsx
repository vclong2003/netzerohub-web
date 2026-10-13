import Button from "@/components/Button";
import Typo from "@/components/Typo";
import Search from "@/assets/icons/search.png";

import { Input } from "antd";
import styled from "styled-components";

interface IPageHeadingProps {
  title: string;
  variant: "search" | "add" | "update";
  disabled?: boolean;
  loading?: boolean;

  onAdd?: () => void;
  onUpdate?: () => void;

  initSearchValue?: string | undefined | null;
  onSearch?: (value: string) => void;
}
export default function PageHeading({
  title,
  variant,
  disabled,
  loading,

  onAdd,
  onUpdate,

  initSearchValue,
  onSearch,
}: IPageHeadingProps) {
  return (
    <S.PageHeading>
      <S.PageTitle variant="h4">{title}</S.PageTitle>
      {variant === "search" && (
        <S.SearchInput
          allowClear
          placeholder="Search..."
          prefix={<S.SearchIcon src={Search.src} />}
          defaultValue={initSearchValue || ""}
          onChange={(e) => onSearch?.(e.target.value)}
        />
      )}
      {variant === "add" && (
        <Button
          size="large"
          disabled={disabled}
          loading={loading}
          onClick={onAdd}>
          Add Center
        </Button>
      )}
      {variant === "update" && (
        <Button
          size="large"
          onClick={onUpdate}
          disabled={disabled}
          loading={loading}>
          Save Changes
        </Button>
      )}
    </S.PageHeading>
  );
}

namespace S {
  export const PageHeading = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin: var(--s-3) 0;
  `;

  export const PageTitle = styled(Typo)`
    color: #065054;
  `;

  export const SearchInput = styled(Input)`
    width: 200px;
    background-color: var(--c-white-5);
    border-radius: var(--br-2);
    border: 2px solid var(--c-white-4) !important;
    padding: var(--s-2);
  `;

  export const SearchIcon = styled.img`
    width: 20px;
    height: 20px;
    margin: 0 var(--s-1);
  `;
}
