import { useImperativeHandle, forwardRef, useState, useCallback, useEffect } from 'react';
import { collection, DocumentData, getDocs, limit, onSnapshot, orderBy, query, QueryDocumentSnapshot, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import Tweet from './tweet';
import Notication from './notication';
import styled from 'styled-components';

export interface ITweet {
    id: string;
    createdAt: number;
    photo_url?: string;
    tweet: string;
    userId: string;
    userNm: string;
}

export interface INotication {
    id: string;
    notication: string;
}

const Wrapper = styled.div`
    position: relative;
    display: flex;
    gap: 10px;
    flex-direction: column;
`;

const Timeline = forwardRef((_, ref) => {
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [notications, setNotications] = useState<INotication[]>([]);
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

        const unsubscribe = onSnapshot(tweetQuery, async (snapshot) => {
            if (!snapshot.empty) {
                const newTweets = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    createdAt: doc.data().createdAt,
                    photo_url: doc.data().photo_url,
                    tweet: doc.data().tweet,
                    userId: doc.data().userId,
                    userNm: doc.data().userNm
                }));
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
                const newTweets = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    createdAt: doc.data().createdAt,
                    photo_url: doc.data().photo_url,
                    tweet: doc.data().tweet,
                    userId: doc.data().userId,
                    userNm: doc.data().userNm
                }));
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

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const notiQuery = query(
                    collection(db, 'notication'),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                );
                const querySnapshot = await getDocs(notiQuery);
                const notiList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    notication: doc.data().notication
                }));
                setNotications(notiList);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <Wrapper>
             {notications.length !== 0  && notications.map((noti, index) => (
                <Notication key={`${noti.id}-${index}`} {...noti} /> 
            ))}
            {tweets.map((tweet, index) => (
                <Tweet key={`${tweet.id}-${index}`} {...tweet} /> 
            ))}
            {loading && <div>Loading...</div>}
        </Wrapper>
    );
});

export default Timeline;
