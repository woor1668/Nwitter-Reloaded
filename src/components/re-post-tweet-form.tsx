import styled from "styled-components";
import { useState } from "react";
import { Form, TextArea, AttachFileButton, AttachFileInput, CloseButton, Img, FileForm } from "./filecss";

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
  initialFileUrl: string | null; // URL for an existing file
  onSave: (newContent: string, file?: File) => void;
}

const ModalContent: React.FC<rePostTweetProps> = ({ initialContent, initialFileUrl, onSave }) => {
    const [content, setContent] = useState(initialContent);
    const [file, setFile] = useState<File | null>();
    const [filePreview, setFilePreview] = useState<string | null>(initialFileUrl);
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFile = event.target.files?.[0] || null;
        setFile(newFile);
        if (newFile) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(newFile);
        } else {
        setFile(null);
        setFilePreview(null);
        }
    };
    const delFile = () =>{
        if(confirm("파일을 삭제하시겠습니까?")){
            setFile(null);
            setFilePreview(null);
        }
    };
    const handleSave = () => {
      onSave(content, file || undefined);
    };

  return (
    <Form>
        <TextArea value={content} onChange={(e) => setContent(e.target.value)} rows={5}/>
        <AttachFileButton $hasFile={!filePreview} htmlFor="reFile">{filePreview ? `Photo added` : "Add photo"}</AttachFileButton>
        <AttachFileInput onChange={handleFileChange} type="file" id="reFile" accept="image/*"/>
        {filePreview && 
            <FileForm>
                <CloseButton onClick={delFile}>×</CloseButton>
                <Img src={filePreview} alt="Preview"/>
            </FileForm>
        }
      <SaveButton onClick={handleSave}>Save</SaveButton>
    </Form>
  );
};

export default ModalContent;
