import styled from "styled-components";
import { useState } from "react";
import { Form, TextArea, AttachFileButton, AttachFileInput, File, DelDiv, SubmitBtn } from "./filecss";
import SvgIcon from "./svg";

    const SaveButton = styled.button`
      background: #1da1f2;
      color: white;
      border: none;
      padding: 10px;
      border-radius: 4px;
      cursor: pointer;
`;

interface rePostTweetProps {
  initialContent: string;
  initialFileUrl?: string; // URL for an existing file
  onSave: (newContent: string, file?: File) => void;
}

const ModalContent: React.FC<rePostTweetProps> = ({ initialContent, initialFileUrl, onSave }) => {
    const [content, setContent] = useState(initialContent);
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | undefined>(initialFileUrl);
  
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newFile = event.target.files?.[0] || null;
      setFile(newFile);
  
      if (newFile) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(newFile);
      } else {
        setFilePreview(undefined);
      }
    };
    const delFile = () =>{
        if(!file) return;
        const ok = confirm("파일을 삭제하시겠습니까?");
        if(ok){
            setFile(null);
            setFilePreview(undefined);
        }
    }
  
    const handleSave = () => {
      onSave(content, file || undefined);
    };

  return (
    <Form>
        <TextArea value={content} onChange={(e) => setContent(e.target.value)} rows={5}/>
        <AttachFileButton $hasFile={!file} htmlFor="file">{initialFileUrl ? `Photo added` : "Add photo"}</AttachFileButton>
        <AttachFileInput onChange={handleFileChange} type="file" id="file" accept="image/*"/>
        {file && <File>{file?.name}<DelDiv onClick={delFile}><SvgIcon name="delete"/></DelDiv></File>}
        {filePreview && <img src={filePreview} alt="Preview" style={{ width: "100%", marginTop: "10px" }} />}
      <SaveButton onClick={handleSave}>Save</SaveButton>
    </Form>
  );
};

export default ModalContent;
