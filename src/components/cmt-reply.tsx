import { useEffect, useState } from "react";
import { AvatarImg, CommentFooter, CommentHeader, CommentItem, CommentMain, Delete, RepIcon, Rples, UserId, UserNm } from "../css/comments-form-css";
import { DownSpan, UpSpan } from "../css/tweetCss";
import { IReply } from "./comment";
import SvgIcon from "./svg";
import { timeStamp } from "./timeStamp";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref } from "firebase/storage";
import { FirebaseError } from "firebase/app";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { alretBox, confirmBox } from "./commonBox";

interface ReplyProps extends IReply {
    repId: string;
    userId: string;
    userNm: string;
    reply: string;
    createdAt: number;
  }

export default function CmtReply({
    repId,
    userId,
    userNm,
    reply,
    createdAt
}: ReplyProps) {
    const user = auth.currentUser;  
    const [state, setState] = useState({
      isLoading: false,
      avatarUrl: null as string | null,
      likes: 0,
      dislikes: 0,
      userLikeStatus: null as boolean | null
    });
    const { avatarUrl, likes, dislikes, userLikeStatus, isLoading } = state;

    useEffect(() => {
      const fetchAvatar = async () => {
        try {
          const avatarRef = ref(storage, `avatar/${userId}`);
          const url = await getDownloadURL(avatarRef);
          setState((prevState) => ({ ...prevState, avatarUrl: url }));
        } catch (e) {
          if (e instanceof FirebaseError && e.code !== 'storage/object-not-found') {
            console.error('Error fetching avatar:', e);
          }
        }
      };
  
      fetchAvatar();
    }, [userId]);
  useEffect(() => {
    const likeQuery = query(collection(db, 'repLikes'), where("repId", "==", repId));
    const unsubscribe = onSnapshot(likeQuery, (snapshot) => {
      const likesData = snapshot.docs.map(doc => doc.data());
      const likeCount = likesData.filter(like => like.likes).length;
      const dislikeCount = likesData.filter(like => !like.likes).length;
      const userLike = likesData.find(like => like.userId === user?.uid);
      setState(prevState => ({ ...prevState, likes: likeCount, dislikes: dislikeCount, userLikeStatus: userLike ? userLike.likes : null  }));
    });
    return () => unsubscribe();
  }, [repId]);

  const cilckLike = async (isLike: boolean) => {
    try {
      if (state.userLikeStatus === false)  {
        alretBox("해당 글에 싫어요를 했습니다.");
        return;
      }
      if(!isLike){
        const result = await confirmBox("싫어요를 하시겠습니까?\n싫어요는 취소가 불가능합니다.");
        if(!result.isConfirmed){
          return;
        }
      }
      const likeQuery = query(
        collection(db, 'repLikes'),
        where("userId", "==", user?.uid),
        where("repId", "==", repId)
      );
      const querySnapshot = await getDocs(likeQuery);
      const existingLikes = querySnapshot.docs.map(doc => doc.id);

      if (existingLikes.length > 0) {
        // 이미 좋아요/싫어요 상태가 있는 경우, 삭제
        await deleteDoc(doc(db, "repLikes", existingLikes[0]));
      } else {
        await addDoc(collection(db, "repLikes"), {
          createdAt: Date.now(),
          userId: user?.uid,
          repId: repId,
          likes: isLike
        });
      }
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e)
      }
    }
  };

  const clickDelete = async() =>{
    const result = await confirmBox("답글을 삭제하시겠습니까?");
    if (result.isConfirmed && user?.uid === userId && !isLoading) {
      try {
        setState({...state, isLoading: true });
        await deleteDoc(doc(db, "reples", repId));
      } catch (e) {
        console.error("Error deleting tweet:", e);
      } finally {
        setState(prevState => ({ ...prevState, isLoading: false }));
      }
    }; 
  };

  const cliCkmtLike = (isLike: boolean) => {
    cilckLike(isLike);
  };
    return (
        <Rples>
            <CommentItem key={repId}>
            <CommentHeader>
                <RepIcon>
                    <SvgIcon name="left_up_arrow"/>
                </RepIcon>
                <UserNm>
                <AvatarImg
                    src={avatarUrl ? avatarUrl : "/user.svg"}
                />
                {userNm}
                <UserId> @{userId.slice(0, 4)} · {timeStamp(createdAt)}</UserId>
                </UserNm>
                {user?.uid === userId && (
                <Delete onClick={clickDelete}>x</Delete>
                )}
            </CommentHeader>
            <CommentMain>{reply}</CommentMain>
            <CommentFooter>
                <UpSpan onClick={() => cliCkmtLike(true)}>
                <SvgIcon name="up_finger" style={{ fill: userLikeStatus === true ? '#1d9bf0' : 'rgba(255,255,255,0.8)' }} /> {likes}
                </UpSpan>
                <DownSpan onClick={() => cliCkmtLike(false)}>
                <SvgIcon name="down_finger" style={{ fill: userLikeStatus === false ? '#ff5a5f' : 'rgba(255,255,255,0.8)' }} /> {dislikes}
                </DownSpan>
            </CommentFooter>
            </CommentItem>  
        </Rples>  
    )
};
