import styled, { css } from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, DocumentData, limit, onSnapshot, orderBy, query, QueryDocumentSnapshot, startAfter, where } from "firebase/firestore";
import Tweet from "../components/tweet";
import { ITweet } from "../components/timeline";
import SvgIcon from "../components/svg";
import { slideInFromTop, slideOutToTop } from "../css/animation";

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 20px;
`;
const AvatarUpload = styled.label`
    display: flex;
    align-items: center;
    justify-content: center;
    width:80px;
    height: 80px;
    overflow: hidden;
    border-radius: 50%;
    background-color: #1d9bf0;
    cursor: pointer;
    svg{
        height: 50px;
        width: 50px;
    }
`;
const AvatarImg = styled.img`
    width: 100%;
    height: 100%;
`;
const AvatarInput = styled.input`
    display:none;
`;
const NameDiv = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;
const SvgSpan = styled.span`
   
`;
const Name = styled.input<{ $isEditable: boolean }>`
    background-color: transparent;
    border: none;
    color: white;
    text-align: center;
    pointer-events: ${(props) => (props.$isEditable ? "auto" : "none")};
    font-size: 22px;
    border-bottom: ${(props) => (props.$isEditable ? "1px solid white" : "none")};
    outline: none;
`;
const Tweets = styled.div`
    width: 100% ;
    display: flex;
    gap: 10px;
    flex-direction: column;
    overflow-y: auto; 

    /* Safari and Chrome */
    &::-webkit-scrollbar {
        width: 0px; /* Hides scrollbar width */
        background: none; /* Optional: hides scrollbar track */
    }
`;
const UpArrow = styled.div<{ $show: boolean }>`
    display: ${({ $show }) => ($show ? 'flex' : 'none')};
    justify-content: center;
    align-items: center;
    position: fixed;
    background-color: rgba(29, 155, 240);
    color: white;
    border: 3px solid white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    z-index: 1000;
    bottom: 60px;
    right: 33%;
    opacity: 0;
    animation: ${({ $show }) =>
        $show
            ? css`${slideInFromTop} 0.8s ease-out forwards`
            : css`${slideOutToTop} 0.8s ease-in forwards`};
    svg {
        width: 25px;
        height: 25px;
        stroke: white;
        stroke-width: 2;
    }
`

export default function Profile(){
    const user = auth.currentUser;
    //const[avatar, setAvatar] = useState(user?.photoURL);
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [state, setState] = useState({
        avatar: user?.photoURL, 
        name: `${user?.displayName ?? "Anonymous"}`,
        loading: false,
        isEdit: false,
        isScroll: false,
        showUpArrow: false
        });
    const { avatar, name, isEdit, isScroll, showUpArrow, loading } = state;
    const nameRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const prevNameRef = useRef(name);

    const onAvatarChange =  async(e:React.ChangeEvent<HTMLInputElement>) =>{
        const {files} = e.target;
        if(!user) return;
        if(files && files.length === 1){
            const file = files[0];
            if(files[0].size / (1024 * 1024) >= 1){
                return alert("파일 크기가 1MB 이상입니다. 다른 파일을 선택하세요.");
            };
            const localtionRef = ref(storage, `avatar/${user?.uid}`)
            const result = await uploadBytes(localtionRef, file);
            const url = await getDownloadURL(result.ref);
            await updateProfile(user, {photoURL:url});
            setState({ ...state, avatar: url });
        }
    };
    const onClickEdit = () =>{
        if (isEdit && prevNameRef.current !== name) {
            if (confirm("저장 하시겠습니까?")) {
                updateProfile(user!, { displayName: name });
            } else {
                setState((prevState) => ({ ...prevState, name: prevNameRef.current }));
            }
        }
        setState((prevState) => ({ ...prevState, isEdit: !prevState.isEdit }));
    };
    const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState((prevState) => ({ ...prevState, name: e.target.value }));
    };
    useEffect(() => {
        if (isEdit && nameRef.current) {
            nameRef.current.focus();
        }
    }, [isEdit]);

    const fetchTweets = () => {
        setState(prevState => ({ ...prevState, loading: true }));
        const tweetQuery = query(
            collection(db, "tweets"),
            where("userId","==",user?.uid),
            orderBy("createdAt", "desc"),
            limit(25)
        );

        const unsubscribe = onSnapshot(tweetQuery, (snapshot) => {
            if (!snapshot.empty) {
                const newTweets = snapshot.docs.map((doc) => {
                    const { createdAt, photo_url, tweet, userId, userNm } = doc.data();
                    return {
                        id: doc.id,
                        createdAt,
                        photo_url,
                        tweet,
                        userId,
                        userNm
                    };
                });
                setTweets(newTweets);
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            }
            setState(prevState => ({ ...prevState, loading: false, isScroll: false }));
        });

        return unsubscribe;
    };

    const fetchMoreTweets = () => {
        if (loading || !lastVisible) return;
        setState(prevState => ({ ...prevState, loading: true }));
        const tweetQuery = query(
            collection(db, "tweets"),
            where("userId","==",user?.uid),
            orderBy("createdAt", "desc"),
            startAfter(lastVisible),
            limit(25)
        );

        const unsubscribe = onSnapshot(tweetQuery, (snapshot) => {
            if (!snapshot.empty) {
                const newTweets = snapshot.docs.map((doc) => {
                    const { createdAt, photo_url, tweet, userId, userNm } = doc.data();
                    return {
                        id: doc.id,
                        createdAt,
                        photo_url,
                        tweet,
                        userId,
                        userNm
                    };
                });
                setTweets((prevTweets) => [...prevTweets, ...newTweets]);
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            }
            setState(prevState => ({ ...prevState, loading: false }));
        });

        return unsubscribe;
    };
    useEffect(() => {
        const unsubscribe = fetchTweets();
        
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        setState(prevState => ({
            ...prevState,
            showUpArrow: scrollTop > 10
        }));
        if (scrollHeight - scrollTop <= clientHeight + 100 && scrollHeight - scrollTop >= clientHeight) {
            if(!isScroll){
                setState(prevState => ({ ...prevState, isScroll: true }));
                fetchMoreTweets();
            }
        }
    };
    const scrollToTop = () => {
        if (wrapperRef.current) {
            wrapperRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    return( 
    <Wrapper rel="wrapperRef" onScroll={handleScroll}>
        <AvatarUpload htmlFor="avatar" title="이미지 올리기">
            {avatar ? <AvatarImg src={avatar}/> : <SvgIcon name="user" />}
        </AvatarUpload>
        <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept= "image/*"/>
        <NameDiv>
        <Name
            type="text"
            value={name}
            onChange={onChangeName}
            $isEditable={isEdit}
            ref={nameRef}
        />
            <SvgSpan onClick={onClickEdit}  title={isEdit ? "저장" : "수정"}>
                <SvgIcon name="edit"/>
            </SvgSpan>
        </NameDiv>
            <Tweets>
                {tweets.map(tweet => <Tweet key={tweet.id}{...tweet} />)}
            </Tweets>
            <UpArrow $show={showUpArrow} onClick={scrollToTop}>
                <SvgIcon name="up_arrow"/>
            </UpArrow>
    </Wrapper>
    )
}