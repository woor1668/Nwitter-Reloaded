import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components"
import { db } from "../firebase";
import Tweet from "./tweet";
import { Unsubscribe } from "firebase/auth";

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
    const [tweets, setTweet] = useState<ITweet[]>([]);
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
    useEffect(()=> {
        let unsubscribe : Unsubscribe | null = null;
        const fetchTweets = async() =>{
            const tweetQuery = query(
                collection(db,"tweets"),
                orderBy("createdAt", "desc"),
                limit(25)
            );
            
        unsubscribe = await onSnapshot(tweetQuery, (snapshot) => {
            const tweets = snapshot.docs.map((doc)=>{
                const {createdAt, photo_url, tweet, userId, userNm} = doc.data();
                return{
                    id: doc.id,
                    createdAt, photo_url, tweet, userId, userNm
                };
            })
            setTweet(tweets);
        });
    };
        fetchTweets()
        return() =>{
            unsubscribe && unsubscribe();
        }
    },[]);
    return(
        <Wrapper>
            {tweets.map(tweet => <Tweet key={tweet.id}{...tweet} />)}            
        </Wrapper>
    )
}