import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { User } from "../components/svg";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Unsubscribe, updateProfile } from "firebase/auth";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import Tweet from "../components/tweet";
import { ITweet } from "../components/timeline";

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
const Name = styled.span`
    font: 22px;
`;
const Tweets = styled.div`
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
export default function Profile(){
    const user = auth.currentUser;
    const[avatar, setAvatar] = useState(user?.photoURL);
    const [tweets, setTweet] = useState<ITweet[]>([]);
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
            setAvatar(url);
        }
    };

    useEffect(()=> {
        let unsubscribe : Unsubscribe | null = null;
        const fetchTweets = async() =>{
            const tweetQuery = query(
                collection(db,"tweets"),
                where("userId","==",user?.uid),
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
        <AvatarUpload htmlFor="avatar" title="이미지 올리기">
            {avatar ? <AvatarImg src={avatar}/> : <User/>}
        </AvatarUpload>
        <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept= "image/*"/>
        <Name>
            {user?.displayName ?? "Anonymous"}
        </Name>
        <Tweets>
            {tweets.map(tweet => <Tweet key={tweet.id}{...tweet} />)}
        </Tweets>
    </Wrapper>
)
}