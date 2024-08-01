import { useImperativeHandle, forwardRef, useState, useCallback, useEffect } from 'react';
import { collection, DocumentData, limit, onSnapshot, orderBy, query, QueryDocumentSnapshot, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import Tweet from './tweet';
import styled from 'styled-components';

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
`;

const Timeline = forwardRef((_, ref) => {
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loading, setLoading] = useState(false);

    useImperativeHandle(ref, () => ({
        fetchMoreTweets
    }));

    const fetchTweets = useCallback(() => {
        setLoading(true);
        const tweetQuery = query(
            collection(db, 'tweets'),
            orderBy('createdAt', 'desc'),
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
        }, (error) => {
            console.error('Error fetching tweets: ', error);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const fetchMoreTweets = useCallback(() => {
        if (loading || !lastVisible) return;
        setLoading(true);
        const tweetQuery = query(
            collection(db, 'tweets'),
            orderBy('createdAt', 'desc'),
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
        }, (error) => {
            console.error('Error fetching more tweets: ', error);
            setLoading(false);
        });

        return unsubscribe;
    }, [loading, lastVisible]);

    useEffect(() => {
        const unsubscribe = fetchTweets();
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [fetchTweets]);

    return (
        <Wrapper>
            {tweets.map((tweet, index) => (
                <Tweet key={`${tweet.id}-${index}`} {...tweet} /> 
            ))}
            {loading && <div>Loading...</div>}
        </Wrapper>
    );
});

export default Timeline;
