import { IComment } from "./comments-form";
import { addDoc, collection, onSnapshot, query,  where, getDocs, deleteDoc, doc, orderBy } from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { useState, useEffect, useCallback } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { FirebaseError } from "firebase/app";
import { alretBox, confirmBox } from "./commonBox";
import SvgIcon from "./svg";
import { timeStamp } from "./timeStamp";
import { Comments, CommentItem, CommentHeader, AvatarImg, UserNm, UserId, Delete, CommentMain, CommentFooter, Reply, TextArea, ButtonForm, SaveButton, ReplyWrapper } from "../css/comments-form-css";
import { DownSpan, UpSpan } from "../css/tweetCss";
import CmtReply from "./cmt-reply";

export interface IReply {
  repId: string;
  userId: string;
  userNm: string;
  reply: string;
  createdAt: number;
}
interface CommentProps extends IComment {
  cmtId: string;
  userId: string;
  userNm: string;
  comment: string;
  createdAt: number;
}
const MAX_ATTEMPTS = 7;
const COOLDOWN_TIME_MS = 30000; // 30 seconds
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
      isReply: false,
      likes: 0,
      dislikes: 0,
      userLikeStatus: null as boolean | null
    });
    const [reples, setReples] = useState<IReply[]>([]);
    const [repVal, setRepVal] = useState<string>('');
    const [postTimes, setPostTimes] = useState<number[]>([]);
    const [timeLimit, setTimeLimit] = useState(false);
    const { avatarUrl, likes, dislikes, userLikeStatus, isLoading, isReply } = state;

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
    const result = await confirmBox("댓글을 삭제하시겠습니까?");
    if (result.isConfirmed && user?.uid === userId && !isLoading) {
      try {
        setState({...state, isLoading: true });
        await deleteDoc(doc(db, "comments", cmtId));
      } catch (e) {
        console.error("Error deleting tweet:", e);
      } finally {
        setState(prevState => ({ ...prevState, isLoading: false }));
      }
    }; 
  };
  //답글 로직
  const fetchReply = useCallback(() => {
    setState({...state, isLoading: true });
    const ReplyQuery = query(
      collection(db, 'reples'),
      where('cmtId', '==', cmtId),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(ReplyQuery, async (snapshot) => {
      if (!snapshot.empty) {
          const newReples = await Promise.all(snapshot.docs.map(async (doc) => ({
            repId: doc.id,
            userId: doc.data().userId,
            userNm: doc.data().userNm || 'Anonymous',
            reply: doc.data().comment,
            createdAt: doc.data().createdAt,
          })));
          setReples(newReples);
        }
        setState(prevState => ({ ...prevState, isLoading: false }));
      }, (error) => {
      console.error('Error fetching Replys:', error);
      setState(prevState => ({ ...prevState, isLoading: false }));
    });

    return unsubscribe;
  }, [cmtId]);

  useEffect(() => {
    const unsubscribe = fetchReply();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchReply]);

  const clickReply = () => {
    setState({...state, isReply: !isReply});
  };
  const cliCkmtLike = (isLike: boolean) => {
    cilckLike(isLike);
  };

  const onReplySave = async () => {
    if (isLoading || !repVal.trim() || timeLimit) return;
    setState({...state, isLoading: true});
    try {
      if (!user) {
        console.warn('User not logged in.');
        return;
      }
      const newComment = {
        createdAt: Date.now(),
        cmtId: cmtId,
        userId: user.uid,
        userNm: user.displayName || 'Anonymous',
        comment: repVal,
      };
      await addDoc(collection(db, 'reples'), newComment);
      setPostTimes((prevPostTimes) => [...prevPostTimes, Date.now()].slice(-MAX_ATTEMPTS));
      setRepVal(''); // Clear comment input after saving
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.error('Error saving comment:', e);
      }
    } finally {
      setState(prevState => ({ ...prevState,  isLoading: true, isReply: false}));
    }
  };

  useEffect(() => {
    if (postTimes.length >= MAX_ATTEMPTS) {
      const now = Date.now();
      const thirtySecondsAgo = now - COOLDOWN_TIME_MS;

      if (postTimes[0] > thirtySecondsAgo) {
        setTimeLimit(true);
        const timeoutId = setTimeout(() => {
          setTimeLimit(false);
        }, COOLDOWN_TIME_MS);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [postTimes]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRepVal(e.target.value);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (repVal.trim()) {
        onReplySave();
      }
    }
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
    </CommentItem>  
    {isReply &&
      <ReplyWrapper>
        <TextArea
          rows={4}
          cols={60}
          value={repVal}
          onChange={onChange}
          placeholder={timeLimit ? '잠시 후에 다시 작성해주세요.' : '답글을 작성하세요...'}
          onKeyDown={onKeyDown}
          disabled={timeLimit}
        />
        <ButtonForm>
          <SaveButton type="button" onClick={onReplySave} disabled={isLoading || timeLimit}>
            {isLoading ? '저장 중...' : '답글 저장'}
          </SaveButton>
        </ButtonForm>
      </ReplyWrapper>
    }      
    {reples.map((reply) => (
      <CmtReply key={reply.repId} {...reply} />
    ))}
  </Comments>
 );
};