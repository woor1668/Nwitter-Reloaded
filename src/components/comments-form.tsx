import { addDoc, collection, onSnapshot, query, orderBy, where, limit } from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { useState, useEffect } from "react";
import { timeStamp } from "./timeStamp";
import { getDownloadURL, ref } from "firebase/storage";
import { FirebaseError } from "firebase/app";
import SvgIcon from "./svg";
import { DownSpan, UpSpan } from "../css/tweetCss";
import { alretBox } from "./commonBox";
import { Form, Comments, CommentItem, CommentHeader, AvatarImg, UserNm, UserId, Delete, CommentMain, CommentFooter, Reply, TextArea, ButtonForm, SaveButton }  from "../css/comments-form-css";

interface CommentsProps {
  tweetId: string;
}

const MAX_ATTEMPTS = 7;
const COOLDOWN_TIME_MS = 30000; // 30 seconds

const ModalContent: React.FC<CommentsProps> = ({ tweetId }) => {
  const [state, setState] = useState({
    isLoading: false,
    comment: "",
    avatarUrl: null as string | null,
    userId: auth.currentUser?.uid || "",
    userNm: auth.currentUser?.displayName || "Anonymous",
  });
  const [postTimes, setPostTimes] = useState<number[]>([]);
  const [timeLimit, setTimeLimit] = useState(false);
  const [comments, setComments] = useState<{ userId: string, comment: string, userNm: string, createdAt: number}[]>([]);
  const { isLoading, avatarUrl, comment} = state;
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true); 
  
  const fetchAvatar = async (userId: string) => {
    try {
      const avatarRef = ref(storage, `avatar/${userId}`);
      const url = await getDownloadURL(avatarRef);
      return url;
    } catch (e) {
      if (e instanceof FirebaseError && e.code !== "storage/object-not-found") {
        console.error("Error fetching avatar:", e);
      }
      return null; // Fallback to default avatar
    }
  };

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "comments"),
      where("tweetId", "==", tweetId),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedComments: { userId: string, comment: string, userNm: string, createdAt: number, avatarUrl: string | null }[] = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const avatarUrl = await fetchAvatar(data.userId);
        fetchedComments.push({
          userId: data.userId,
          userNm: data.userNm ? data.userNm : "Anonymous",
          comment: data.comment,
          createdAt: data.createdAt,
          avatarUrl: avatarUrl,
        });
      }
      setComments(fetchedComments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tweetId]); 

  useEffect(() => {
    if (postTimes.length >= MAX_ATTEMPTS) {
        const now = Date.now();
        const thirtySecondsAgo = now - COOLDOWN_TIME_MS;

        // Check if the earliest post time is within the last 30 seconds
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
    setState({ ...state, comment: e.target.value });
  };

  const onCommentSave = async () => {
    if (isLoading || !comment.trim()) return; // Prevent saving if already loading or comment is empty
    setState({ ...state, isLoading: true });
    try {
      if (!comment || timeLimit) return;
      await addDoc(collection(db, "comments"), {
        createdAt: Date.now(),
        tweetId: tweetId,
        userId: user?.uid,
        userNm: user?.displayName,
        comment: comment,
        level: 1
      });
      setState({ ...state, comment: "" });
      setPostTimes([...postTimes, Date.now()].slice(-MAX_ATTEMPTS));
    } catch (e) {
      console.error("Error saving comment: ", e);
    } finally {
      setState((prevState) => ({ ...prevState, isLoading: false }));
    }
  };
  const clickReply = () => {
    alretBox("또 속았지");
  };
  const cliCkmtUp = () => {
    alretBox("아직 안되지롱");
  };
  const cliCkmtDown = () => {
    alretBox("쓸말없다");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (comment.trim()) {
        onCommentSave();
      }
    }
  };

  return (
    <Form>
      {loading ? ( "불러오는중"
      ) : (
      <Comments>
        {comments.length > 0 ? (
          comments.map((c, index) => (
            <CommentItem key={index}>
              <CommentHeader>
                <UserNm>
                    {avatarUrl ? (
                  <AvatarImg
                    src={avatarUrl}
                    onError={() => setState(prevState => ({ ...prevState, avatarUrl: null }))}
                      />
                    ) : (
                      <SvgIcon name="user" />
                    )}
                    {c.userNm}
                  <UserId> @{c.userId.slice(0, 4)} · {timeStamp(c.createdAt)}</UserId></UserNm>
                  {user?.uid === c.userId && (
                    <Delete>x</Delete>
                  )}
              </CommentHeader>
              <CommentMain>
                {c.comment}
              </CommentMain>
              <CommentFooter>
                  <Reply onClick={clickReply}>
                    <SvgIcon name="plus"/>답글
                  </Reply>
                <UpSpan onClick={cliCkmtUp}>
                  <SvgIcon name="up_finger" style={{ fill: true === true ? '#1d9bf0' : 'rgba(255,255,255,0.8)' }} /> 0
                </UpSpan>
                <DownSpan onClick={cliCkmtDown}>
                    <SvgIcon name="down_finger" style={{ fill: false === false ? '#ff5a5f' : 'rgba(255,255,255,0.8)' }} />  0
                </DownSpan>
              </CommentFooter>
            </CommentItem>
          ))
          ) : (
          <CommentItem>
            <CommentMain>
              댓글을 작성해주세요
            </CommentMain>
          </CommentItem>
        )}
      </Comments>
      )}
      <TextArea 
        rows={3} 
        maxLength={120} 
        onChange={onChange} 
        value={comment} 
        onKeyDown={onKeyDown} 
        placeholder="글을 작성하세요(줄바꾸기 shift+enter)" 
        required
      />
      {timeLimit && <p style={{ color: 'red' }}>너무 많은 글을 작성하셨습니다. 잠시 후 다시 시도하세요.</p>}
      <ButtonForm>
        <SaveButton onClick={onCommentSave} disabled={isLoading || timeLimit}>Save</SaveButton>
      </ButtonForm>
    </Form>
  );
};

export default ModalContent;
