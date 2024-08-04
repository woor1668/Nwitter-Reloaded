import styled from "styled-components";
import { useRef, useState } from "react";
import { Form, TextArea, AttachFileButton, AttachFileInput, CloseButton, Img, FileForm } from "../css/filecss";
import SvgIcon from "./svg";
import { alretBox, confirmBox } from "./commonBox";

const SaveButton = styled.button`
  background: rgb(29,161,242);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  &:hover{
    background: rgba(29,161,242, 0.7);
  }
`;

interface rePostTweetProps {
  initialContent: string;
  initialFileUrl: string | undefined;
  onSave: (newContent: string, file?: File, isDelete?: boolean) => void;
}

const ModalContent: React.FC<rePostTweetProps> = ({ initialContent, initialFileUrl, onSave }) => {
    const [content, setContent] = useState(initialContent);
    const [reFile, setreFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | undefined>(initialFileUrl);
    const [toDelete, setDelete] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {files} = e.target;
        if(files && files?.length === 1){
            if(files[0].size / (1024 * 1024) >= 1){
              setreFile(null);
                setFilePreview(undefined);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                return alretBox('파일 크기가 1MB 이상입니다.\n다른 파일을 선택하세요.');
            }
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview(reader.result as string);
            reader.readAsDataURL(files[0]);
            setreFile(files[0]);
            setDelete(false);
        } else {
        setreFile(null);
        setFilePreview(undefined);
        }
    };

    const deleteFile = async() =>{
      if(!filePreview) return;
      const result = await confirmBox('정말로 파일을 삭제하시겠습니까?');
      if (result.isConfirmed) {
        setreFile(null);
        setFilePreview(undefined);
        setDelete(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
     }
  };

  const handleSave = () => {
      onSave(content, reFile || undefined, toDelete);
   };
  return (
    <Form>
        <TextArea value={content} onChange={(e) => setContent(e.target.value)} rows={5}/>
        <AttachFileButton $hasFile={!filePreview} htmlFor="reFile">{filePreview ? `Photo added` : "Add photo"}</AttachFileButton>
        <AttachFileInput onChange={handleFileChange} type="file" ref={fileInputRef} id="reFile" accept="image/*"/>
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
