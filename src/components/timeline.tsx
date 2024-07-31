import { collection, DocumentData, limit, onSnapshot, orderBy, query, QueryDocumentSnapshot, startAfter } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components"
import { db } from "../firebase";
import Tweet from "./tweet";
import SvgIcon from "./svg";
import { slideInFromTop, slideOutToTop } from "../css/animation";

export interface ITweet {
    id: string;
    createdAt: number;
    photo_url?: string;
    tweet: string;
    userId: string;
    userNm: string;
}
const Wrapper = styled.div`
    position: relative;
    display: flex;
    gap: 10px;
    flex-direction: column;
    overflow-y: auto; 

    /* Safari and Chrome */
    &::-webkit-scrollbar {
        width: 0px; /* Hides scrollbar width */
        background: none; /* Optional: hides scrollbar track */
    }
`
;
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
export default function Timeline(){
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [state, setState] = useState({
        loading: false,
        isScroll: false,
        showUpArrow: false
      });

    const { loading, isScroll, showUpArrow } = state;
    //select문
        /*const snapshot = await getDocs(tweetQuery);
        const tweets = snapshot.docs.map((doc)=>{
            const {createdAt, photo_url, tweet, userId, userNm} = doc.data();
            return{
                id: doc.id,
                createdAt, photo_url, tweet, userId, userNm
            }
            });*/

    //실시간 select문
    const fetchTweets = () => {
        setState(prevState => ({ ...prevState, loading: true }));
        const tweetQuery = query(
            collection(db, "tweets"),
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
            showUpArrow: scrollTop > 300
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
    return (
        <Wrapper onScroll={handleScroll} ref={wrapperRef}>
            {tweets.map((tweet) => (
                <Tweet key={tweet.id} {...tweet} />
            ))}
            {loading && <div>Loading...</div>}
            <UpArrow $show={showUpArrow} onClick={scrollToTop}>
                <SvgIcon name="up_arrow"/>
            </UpArrow>
        </Wrapper>
    );
}