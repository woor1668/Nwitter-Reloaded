import { IComment } from "./comments-form";
import { addDoc, collection, onSnapshot, query,  where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { useState, useEffect } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { FirebaseError } from "firebase/app";
import { alretBox, confirmBox } from "./commonBox";
import SvgIcon from "./svg";
import { timeStamp } from "./timeStamp";
import { Comments, CommentItem, CommentHeader, AvatarImg, UserNm, UserId, Delete, CommentMain, CommentFooter, Reply, TextArea, ButtonForm, SaveButton } from "../css/comments-form-css";
import { DownSpan, UpSpan } from "../css/tweetCss";

// Define the Comment type
interface CommentProps extends IComment {
  cmtId: string;
  userId: string;
  userNm: string;
  comment: string;
  createdAt: number;
}
export default function Comment({
    cmtId,
    userId,
    userNm,
    comment,
    createdAt
  }: CommentProps) {
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
    const likeQuery = query(collection(db, 'cmtLikes'), where("cmtId", "==", cmtId));
    const unsubscribe = onSnapshot(likeQuery, (snapshot) => {
      const likesData = snapshot.docs.map(doc => doc.data());
      const likeCount = likesData.filter(like => like.likes).length;
      const dislikeCount = likesData.filter(like => !like.likes).length;
      const userLike = likesData.find(like => like.userId === user?.uid);
      setState(prevState => ({ ...prevState, likes: likeCount, dislikes: dislikeCount, userLikeStatus: userLike ? userLike.likes : null  }));
    });
    return () => unsubscribe();
  }, [cmtId]);

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
        collection(db, 'cmtLikes'),
        where("userId", "==", user?.uid),
        where("cmtId", "==", cmtId)
      );
      const querySnapshot = await getDocs(likeQuery);
      const existingLikes = querySnapshot.docs.map(doc => doc.id);

      if (existingLikes.length > 0) {
        // 이미 좋아요/싫어요 상태가 있는 경우, 삭제
        await deleteDoc(doc(db, "cmtLikes", existingLikes[0]));
      } else {
        await addDoc(collection(db, "cmtLikes"), {
          createdAt: Date.now(),
          userId: user?.uid,
          cmtId: cmtId,
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
    const result = await confirmBox("트윗을 삭제하시겠습니까?");
    if (result.isConfirmed && user?.uid === userId && !isLoading) {
      try {
        setState(prevState => ({ ...prevState, isLoading: true }));
        await deleteDoc(doc(db, "comments", cmtId));
      } catch (e) {
        console.error("Error deleting tweet:", e);
      } finally {
        setState(prevState => ({ ...prevState, isLoading: false }));
      }
    }; 
  };
  const clickReply = () => {
    alretBox("또 속았지");
  };
  const cliCkmtLike = (isLike: boolean) => {
    cilckLike(isLike);
  };
  return ( 
  <Comments>
        <CommentItem key={cmtId}>
          <CommentHeader>
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
          <CommentMain>{comment}</CommentMain>
        </CommentItem>        
        <CommentFooter>
                    <Reply onClick={clickReply}>
                      <SvgIcon name="plus"/>답글
                    </Reply>
                    <UpSpan onClick={() => cliCkmtLike(true)}>
                      <SvgIcon name="up_finger" style={{ fill: userLikeStatus === true ? '#1d9bf0' : 'rgba(255,255,255,0.8)' }} /> {likes}
                    </UpSpan>
                    <DownSpan onClick={() => cliCkmtLike(false)}>
                      <SvgIcon name="down_finger" style={{ fill: userLikeStatus === false ? '#ff5a5f' : 'rgba(255,255,255,0.8)' }} /> {dislikes}
                    </DownSpan>
                  </CommentFooter>
  </Comments>
 );
};