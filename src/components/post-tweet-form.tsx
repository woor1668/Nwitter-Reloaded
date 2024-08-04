import { addDoc, collection, updateDoc } from "firebase/firestore";
import React, { useRef, useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Form, TextArea, AttachFileButton, AttachFileInput, SubmitBtn, CloseButton, FileForm, Img } from "../css/filecss";
import SvgIcon from "./svg";
import { alretBox, confirmBox } from "./commonBox";

export default function PostTweetForm() {
    const [state, setState] = useState({ isLoading: false, tweet: "" });
    const [file, setFile] = useState<File | null>(null);
    const { isLoading, tweet } = state;
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [postTimes, setPostTimes] = useState<number[]>([]);
    const [timeLimit, setTimeLimit] = useState(false);

    const MAX_ATTEMPTS = 7;
    const COOLDOWN_TIME_MS = 30000; // 30 seconds

    useEffect(() => {
        if (postTimes.length >= MAX_ATTEMPTS) {
            const now = Date.now();
            const thirtySecondsAgo = now - COOLDOWN_TIME_MS;

            // Check if the earliest post time is within the last 30 seconds
            if (postTimes[0] > thirtySecondsAgo) {
                setTimeLimit(true);
                const timeoutId = setTimeout(() => {
                    setTimeLimit(false);
                }, COOLDOWN_TIME_MS);
                return () => clearTimeout(timeoutId);
            }
        }
    }, [postTimes]);

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setState({ ...state, tweet: e.target.value });
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (files && files?.length === 1) {
            if (files[0].size / (1024 * 1024) >= 1) {
                setFile(null);
                setFilePreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                return alretBox('파일 크기가 1MB 이상입니다.\n다른 파일을 선택하세요.');
            }
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview(reader.result as string);
            reader.readAsDataURL(files[0]);
            setFile(files[0]);
        };
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user || isLoading || tweet === "" || tweet.length > 180 || timeLimit) return;
        setState({ ...state, isLoading: true });

        try {
            const doc = await addDoc(collection(db, "tweets"), {
                tweet,
                createdAt: Date.now(),
                userNm: user.displayName || "Anonymous",
                userId: user.uid
            });
            if (file) {
                const locationRef = ref(storage, `tweets/${user.uid}/${doc.id}`);
                const result = await uploadBytes(locationRef, file);
                const url = await getDownloadURL(result.ref);
                await updateDoc(doc, {
                    photo_url: url
                });
            }
            setState({ ...state, tweet: "" });
            setFile(null);
            setFilePreview(null);
            setPostTimes([...postTimes, Date.now()].slice(-MAX_ATTEMPTS));
        } catch (e) {
            // Handle error here
        } finally {
            setState((prevState) => ({ ...prevState, isLoading: false }));
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (tweet.trim()) {
                const syntheticEvent = new Event('submit', { bubbles: true, cancelable: true });
                (e.target as HTMLTextAreaElement).closest('form')?.dispatchEvent(syntheticEvent);
            }
        }
    };

    const deleteFile = async() => {
        if (!file) return;
        const result = await confirmBox('정말로 파일을 삭제하시겠습니까?');
        if (result.isConfirmed) {
            setFile(null);
            setFilePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <Form onSubmit={onSubmit}>
            <TextArea rows={5} maxLength={180} onChange={onChange} value={tweet} onKeyDown={onKeyDown} placeholder="글을 작성하세요(줄바꾸기 shift+enter)" required />
            <AttachFileButton $hasFile={!file} htmlFor="file">{file ? `Photo added` : "Add photo"}</AttachFileButton>
            <AttachFileInput onChange={onFileChange} ref={fileInputRef} type="file" id="file" accept="image/*" />
            {filePreview &&
                <FileForm>
                    <CloseButton onClick={deleteFile}><SvgIcon name="close" /></CloseButton>
                    <Img src={filePreview} alt="Preview" />
                </FileForm>
            }
            {timeLimit && <p style={{ color: 'red' }}>너무 많은 글을 작성하셨습니다. 잠시 후 다시 시도하세요.</p>}
            <SubmitBtn type="submit" value={isLoading ? "포스팅중..." : "작성"} disabled={timeLimit} />
        </Form>
    );
}
