import { collection, DocumentData, limit, onSnapshot, orderBy, query, QueryDocumentSnapshot, startAfter } from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components"
import { db } from "../firebase";
import Tweet from "./tweet";

export interface ITweet {
    id: string;
    createdAt: number;
    photo_url?: string;
    tweet: string;
    userId: string;
    userNm: string;
}

const Wrapper = styled.div`
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

export default function Timeline(){
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loading, setLoading] = useState(false);
    const [isScroll, setScroll] = useState(false);
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
        setLoading(true);
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
            setLoading(false);
            setScroll(false);
        });

        return unsubscribe;
    };

    const fetchMoreTweets = () => {
        if (loading || !lastVisible) return;
        setLoading(true);
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
            setLoading(false);
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
        if (scrollHeight - scrollTop <= clientHeight + 100 && scrollHeight - scrollTop >= clientHeight) {
            if(!isScroll){
                setScroll(true);
                fetchMoreTweets();
            }
        }
    };

    return (
        <Wrapper onScroll={handleScroll}>
            {tweets.map((tweet) => (
                <Tweet key={tweet.id} {...tweet} />
            ))}
            {loading && <div>Loading...</div>}
        </Wrapper>
    );
}