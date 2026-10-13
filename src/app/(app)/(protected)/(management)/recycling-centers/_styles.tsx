import styled from "styled-components";
import { Col, Input, Row } from "antd";
import Button from "@/components/Button";
import Typo from "@/components/Typo";
import Search from "@/assets/icons/search.png";

// Match the existing charging-station management pages and shared portal components.
export const Page = styled.div`width: 100%;`;
export const PageHeading = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin: var(--s-3) 0;
`;
export const PageTitle = styled(Typo)`color: #065054;`;
export const HeadingActions = styled.div`display: flex; gap: var(--s-2); align-items: center;`;
export const SearchInput = styled(Input)`
  width: 200px; background-color: var(--c-white-5); border-radius: var(--br-2);
  border: 2px solid var(--c-white-4) !important; padding: var(--s-2);
`;
export const SearchIcon = styled.img.attrs({ src: Search.src, alt: "" })`
  width: 20px; height: 20px; margin: 0 var(--s-1);
`;
export const TableContainer = styled.div`
  padding: var(--s-5); background-color: var(--c-white); border-radius: var(--br-3);
`;
export const Divider = styled.div`
  width: 100%; height: 1px; background-color: var(--c-white-4); margin: var(--s-3) 0;
`;
export const Buttons = styled.div`display: flex; justify-content: flex-end; gap: var(--s-1);`;
export const AddButton = styled(Button)`
  background-color: var(--c-blue-1); color: var(--c-blue); display: flex; align-items: center;
`;
export const DeleteButton = styled(Button)`
  background-color: var(--c-pink); color: var(--c-red); display: flex; align-items: center;
`;
export const CancelButton = styled(Button)`background-color: var(--c-white-1); color: var(--c-black);`;
export const ButtonIcon = styled.img`width: 16px; height: 16px; margin-right: var(--s-1);`;
export const NameButton = styled.button`
  background: transparent; text-align: left; font: inherit; color: inherit; cursor: pointer;
  &:focus-visible { outline: 2px solid var(--c-blue); outline-offset: 2px; }
`;
export const FormPanel = styled.div`
  border: 0; margin: 0;
  background-color: var(--c-white); border-radius: var(--br-3); padding: var(--s-4); padding-top: var(--s-7);
`;
export const FormGroup = styled(Row)`margin-bottom: var(--s-3); padding: 0 var(--s-5);`;
export const LabelCol = styled(Col)`display: flex; align-items: center;`;
export const AttachmentPanel = styled.section`
  background-color: var(--c-white); border-radius: var(--br-3); padding: var(--s-4);
  padding-top: var(--s-6); padding-bottom: var(--s-7); margin-top: var(--s-4);
`;
export const UploadButton = styled.div`
  background-color: var(--c-blue-1); padding: var(--s-1) var(--s-3); width: fit-content;
  border-radius: var(--br-1); border: 1px dashed var(--c-blue); color: var(--c-blue);
  label { position: relative; cursor: pointer; display: block; }
  &:focus-within { outline: 2px solid var(--c-blue); outline-offset: 2px; }
`;
export const FileInput = styled.input`
  position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
`;
export const FileHint = styled.p`font-size: var(--fs-body2); color: var(--c-gray); margin-top: var(--s-2);`;
export const FileTable = styled.div`padding: 0 var(--s-5);`;
export const FileLink = styled.button`
  background: transparent; color: var(--c-blue); text-decoration: underline; cursor: pointer; font: inherit;
  &:focus-visible { outline: 2px solid var(--c-blue); outline-offset: 2px; }
`;
export const FileActions = styled.div`display: flex; justify-content: center; align-items: center; gap: var(--s-1);`;
export const ViewButton = styled(Button)`padding: var(--s-1) var(--s-2); background-color: var(--c-blue-3); color: var(--c-blue);`;
export const RemoveButton = styled(Button)`padding: var(--s-1) var(--s-2); background-color: var(--c-red);`;
export const DownloadLink = styled.a`
  padding: var(--s-1) var(--s-2); background-color: var(--c-green-1); color: var(--c-green);
  font-size: var(--fs-body2); border-radius: var(--br-1); text-decoration: none;
`;
export const Feedback = styled.div`margin-bottom: var(--s-3);`;
export const PdfPreview = styled.iframe`width: 100%; height: 65vh; border: none;`;
export const ImagePreview = styled.img`display: block; max-width: 100%; max-height: 65vh; margin: auto;`;
