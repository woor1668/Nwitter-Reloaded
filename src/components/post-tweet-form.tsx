import { addDoc, collection, updateDoc } from "firebase/firestore";
import React, { useRef, useState } from "react";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Form, TextArea, AttachFileButton, AttachFileInput, SubmitBtn, CloseButton, FileForm, Img } from "./filecss";
import SvgIcon from "./svg";
import Swal from "sweetalert2";
import "../css/dark-theme.css";

export default function PostTweetForm(){
    const [state, setState] = useState({ isLoading: false, tweet: ""});
    const [file, setFile] = useState<File|null>(null);
    const {isLoading, tweet} = state
    const [filePreview, setFilePreview] = useState<string | null>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>)=>{
        setState({...state, tweet: e.target.value});
    };
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        const {files} = e.target;
        if(files && files?.length === 1){
            if(files[0].size / (1024 * 1024) >= 1){
                setFile(null);
                setFilePreview(null);
                return alert("파일 크기가 1MB 이상입니다. 다른 파일을 선택하세요.");
            }
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview(reader.result as string);
            reader.readAsDataURL(files[0]);
            setFile(files[0]);
        };
    };
    const onSubmit = async(e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        const user = auth.currentUser;
        if(!user || isLoading || tweet=== "" || tweet.length > 180) return;
        setState({ ...state, isLoading: true });
        try {
            const doc = await addDoc(collection(db, "tweets"),{
                tweet,
                createdAt: Date.now(),
                userNm: user.displayName || "Anouymous",
                userId: user.uid
            });
            if(file){
                const locationRef = ref(storage, `tweets/${user.uid}/${doc.id}`);
                const result = await uploadBytes(locationRef, file);
                const url = await getDownloadURL(result.ref);
                await updateDoc(doc, {
                    photo_url: url
                }) 
            }
            setState({...state, tweet: ""});
            setFile(null);
            setFilePreview(null);
        } catch (e) {
            
        }finally{
            setState((prevState) => ({ ...prevState, isLoading: false }));
        }
    };
    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (tweet.trim()) {
                // Create a synthetic submit event to trigger onSubmit
                const syntheticEvent = new Event('submit', { bubbles: true, cancelable: true });
                (e.target as HTMLTextAreaElement).closest('form')?.dispatchEvent(syntheticEvent);
            }
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
              if (fileInputRef.current) {
                  fileInputRef.current.value = "";
              }
            }
          });
    };
    return(
         /* htmlFor: 동일한 이름을 가진 ID와 연결 */
        <Form onSubmit={onSubmit}>
            <TextArea rows={5} maxLength={180} onChange={onChange} value={tweet}  onKeyDown={onKeyDown} placeholder="글을 작성하세요(줄바꾸기 shift+enter)" required/>
            <AttachFileButton $hasFile={!file} htmlFor="file">{file ? `Photo added` : "Add photo"}</AttachFileButton>
            <AttachFileInput onChange={onFileChange} ref={fileInputRef} type="file" id="file" accept="image/*"/>
            {filePreview && 
                <FileForm>
                    <CloseButton onClick={deleteFile}><SvgIcon name="close"/></CloseButton>
                    <Img src={filePreview} alt="Preview"/>
                </FileForm>
            }
            <SubmitBtn type="submit" value={isLoading ? "포스팅중...":"작성"}/>
        </Form>
    )
}