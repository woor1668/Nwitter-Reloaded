import styled from "styled-components";
import { useEffect, useState } from "react";
import { Form, TextArea, AttachFileButton, AttachFileInput, CloseButton, Img, FileForm } from "./filecss";
import SvgIcon from "./svg";
import Swal from "sweetalert2";
import "../css/dark-theme.css";

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
    const deleteFile = () =>{
      if(!file) return;
      Swal.fire({
          text: '이미지를 삭제하시겠습니까?',
          showCancelButton: true,
          background: 'black',
          color: 'white',
          confirmButtonText: '예', 
          cancelButtonText: '아니오',
          confirmButtonColor: 'tomato',
          cancelButtonColor: '#1d9bf0',
          customClass: {
              container: 'main',
              popup : 'dark-theme'
          }
      }).then((result) => {
          if (result.isConfirmed) {
            setFile(null);
            setFilePreview(null);
          }
        });
  };
    const handleSave = () => {
      onSave(content, file || undefined);
    };
  useEffect(()=>{
    console.log(filePreview)
  },[])
  return (
    <Form>
        <TextArea value={content} onChange={(e) => setContent(e.target.value)} rows={5}/>
        <AttachFileButton $hasFile={!filePreview} htmlFor="reFile">{filePreview ? `Photo added` : "Add photo"}</AttachFileButton>
        <AttachFileInput onChange={handleFileChange} type="file" id="reFile" accept="image/*"/>
        {filePreview && 
                <FileForm>
                    <CloseButton onClick={deleteFile}><SvgIcon name="close"/></CloseButton>
                    <Img src={filePreview} alt="Preview"/>
                </FileForm>
            }
      <SaveButton onClick={handleSave}>Save</SaveButton>
    </Form>
  );
};

export default ModalContent;
