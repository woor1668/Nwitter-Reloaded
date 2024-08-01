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
import { confirmBox } from "../components/commonBox";

const Wrapper = styled.div`
    display: grid;
    grid-template-rows: 1fr 5fr;
    gap: 20px;
    overflow-y: auto; 

    &::-webkit-scrollbar {
        width: 0px;
        background: none;
    }
`;
const AvatarContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const AvatarUpload = styled.label`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #1d9bf0;
    cursor: pointer;
    overflow: hidden; /* Ensure image fits inside the circle */
    position: relative; /* Ensure relative positioning */
    svg {
        height: 50px;
        width: 50px;
    }
`;
const AvatarImg = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover; /* Ensure image covers the container */
`;

const AvatarInput = styled.input`
   display: none; /* Hide the input element */
`;
const NameDiv = styled.div`
margin: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const SvgSpan = styled.span`
    margin-left: 10px; /* Add space between name and edit icon */
    cursor: pointer;
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
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
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
    bottom: 20px; /* Adjusted to be closer to the bottom */
    left: 50%; /* Center horizontally */
    transform: translateX(-50%); /* Center horizontally */
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
`;

export default function Profile() {
    const user = auth.currentUser;
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

    const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (!user) return;
        if (files && files.length === 1) {
            const file = files[0];
            if (file.size / (1024 * 1024) >= 1) {
                return alert("파일 크기가 1MB 이상입니다. 다른 파일을 선택하세요.");
            }
            const locationRef = ref(storage, `avatar/${user.uid}`);
            const result = await uploadBytes(locationRef, file);
            const url = await getDownloadURL(result.ref);
            await updateProfile(user, { photoURL: url });
            setState((prevState) => ({ ...prevState, avatar: url }));
        }
    };

    const onClickEdit = async () => {
        if (isEdit && prevNameRef.current !== name) {
            const result = await confirmBox("저장 하시겠습니까?");
            if (result.isConfirmed) {
                updateProfile(user!, { displayName: name });
                prevNameRef.current = name;
            } else {
                setState((prevState) => ({ ...prevState, name: prevNameRef.current }));
            }
        }
        setState((prevState) => ({ ...prevState, isEdit: !prevState.isEdit }));
    };

    const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState((prevState) => ({ ...prevState, name: e.target.value }));
    };
    const onBlur = () => {
        if (isEdit) {
            onClickEdit();
        }
    };
    useEffect(() => {
        if (isEdit && nameRef.current) {
            nameRef.current.focus();
        }
    }, [isEdit]);

    const fetchTweets = () => {
        setState((prevState) => ({ ...prevState, loading: true }));
        const tweetQuery = query(
            collection(db, "tweets"),
            where("userId", "==", user?.uid),
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
            setState((prevState) => ({ ...prevState, loading: false, isScroll: false }));
        });

        return unsubscribe;
    };

    const fetchMoreTweets = () => {
        if (loading || !lastVisible) return;
        setState((prevState) => ({ ...prevState, loading: true }));
        const tweetQuery = query(
            collection(db, "tweets"),
            where("userId", "==", user?.uid),
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
            setState((prevState) => ({ ...prevState, loading: false }));
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
        setState((prevState) => ({
            ...prevState,
            showUpArrow: scrollTop > 10
        }));
        if (scrollHeight - scrollTop <= clientHeight + 100 && scrollHeight - scrollTop >= clientHeight) {
            if (!isScroll) {
                setState((prevState) => ({ ...prevState, isScroll: true }));
                fetchMoreTweets();
            }
        }
    };

    const scrollToTop = () => {
        if (wrapperRef.current) {
            wrapperRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <Wrapper ref={wrapperRef} onScroll={handleScroll}>
            <AvatarContainer>
                <AvatarUpload htmlFor="avatar" title="이미지 올리기">
                    {avatar ? <AvatarImg src={avatar} /> : <SvgIcon name="user" />}
                </AvatarUpload>
                <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept="image/*" />
            </AvatarContainer>
            <NameDiv>
                <Name
                    type="text"
                    value={name}
                    onChange={onChangeName}
                    $isEditable={isEdit}
                    ref={nameRef}
                    onBlur={onBlur} 
                />
                <SvgSpan onClick={onClickEdit} title={isEdit ? "저장" : "수정"}>
                    <SvgIcon name="edit" />
                </SvgSpan>
            </NameDiv>
            <Tweets>
                {tweets.map(tweet => <Tweet key={tweet.id} {...tweet} />)}
            </Tweets>
            <UpArrow $show={showUpArrow} onClick={scrollToTop}>
                <SvgIcon name="up_arrow" />
            </UpArrow>
        </Wrapper>
    );
}
