import { addDoc, collection, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import styled from "styled-components"
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import SvgIcon from "./svg";

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;
const TextArea = styled.textarea`
    border: 2px solid white;
    padding: 20px;
    border-radius: 20px;
    font-size: 16px;
    color: white;
    background-color: black;
    width: 100%;
    resize: none;
    font-size: 16px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    &:focus{
        outline: none;
        border-color: #1d9bf0;
    }
`;
const File = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 14px;
`;
const AttachFileButton = styled.label<{ $hasFile: boolean }>`
    padding: 10px 0px;
    color: #1d9bf0;
    text-align: center;
    border-radius: 20px;
    border: 1px solid #1d9bf0;
    background-color: ${props => (props.$hasFile ? "transparent" : "white")};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
`;
const AttachFileInput = styled.input`
    display: none;
`;
const SubmitBtn = styled.input`
    background-color: #1d9bf0;
    color: white;
    border: none;
    padding: 10px 0px;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
    &:hover,
    &:active{
        opacity: 0.9;
    }
`;
const DelDiv = styled.div`
    
`

export default function PostTweetForm(){
    const [state, setState] = useState({ isLoading: false, tweet: ""});
    const [file, setFile] = useState<File|null>(null);
    const {isLoading, tweet} = state
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>)=>{
        setState({...state, tweet: e.target.value});
    };
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        const {files} = e.target;
        if(files && files?.length === 1){
            if(files[0].size / (1024 * 1024) >= 1){
                setFile(null);
                return alert("파일 크기가 1MB 이상입니다. 다른 파일을 선택하세요.");
            }
            setFile(files[0]);
        };
    };
    const delFile = () =>{
        if(!file) return;
        const ok = confirm("파일을 삭제하시겠습니까?");
        if(ok){
            setFile(null);
        }
    }
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
        } catch (e) {
            
        }finally{
            setState((prevState) => ({ ...prevState, isLoading: false }));
        }
    }
    return(
         /* htmlFor: 동일한 이름을 가진 ID와 연결 */
        <Form onSubmit={onSubmit}>
            <TextArea rows={5} maxLength={180} onChange={onChange} value={tweet} placeholder="글을 작성하세요" required/>
            {file && <File>{file?.name}<DelDiv onClick={delFile}><SvgIcon name="delete"/></DelDiv></File>}
            <AttachFileButton $hasFile={!file} htmlFor="file">{file ? `Photo added` : "Add photo"}</AttachFileButton>
            <AttachFileInput onChange={onFileChange} type="file" id="file" accept="image/*"/>
            <SubmitBtn type="submit" value={isLoading ? "포스팅중...":"작성"}/>
        </Form>
    )
}