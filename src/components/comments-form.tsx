import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { addDoc, collection, onSnapshot, query, orderBy, where, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { FirebaseError } from 'firebase/app';
import Comments from './comment';
import { ButtonForm, CommentWarpper, Form, SaveButton, TextArea } from '../css/comments-form-css';

// Define the Comment type
export interface IComment {
  cmtId: string;
  userId: string;
  userNm: string;
  comment: string;
  createdAt: number;
}

interface CommentsProps {
  tweetId: string;
}

// Define ref type for useImperativeHandle
interface CommentsFormHandle {
  fetchMoreComments: () => void;
}

const MAX_ATTEMPTS = 7;
const COOLDOWN_TIME_MS = 30000; // 30 seconds

const CommentsForm = forwardRef<CommentsFormHandle, CommentsProps>(({ tweetId }, ref) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [lastVisibleComment, setLastVisibleComment] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cmtVal, setCmtVal] = useState<string>('');
  const [postTimes, setPostTimes] = useState<number[]>([]);
  const [timeLimit, setTimeLimit] = useState(false);
  const user = auth.currentUser;

  useImperativeHandle(ref, () => ({
    fetchMoreComments
  }));

  const fetchComments = useCallback(() => {
    setIsLoading(true);
    const commentQuery = query(
      collection(db, 'comments'),
      where('tweetId', '==', tweetId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(commentQuery, async (snapshot) => {
      if (!snapshot.empty) {
          const newComments = await Promise.all(snapshot.docs.map(async (doc) => ({
            cmtId: doc.id,
            userId: doc.data().userId,
            userNm: doc.data().userNm || 'Anonymous',
            comment: doc.data().comment,
            createdAt: doc.data().createdAt,
          })));
          setComments(newComments);
          setLastVisibleComment(snapshot.docs[snapshot.docs.length - 1]);
        }
        setIsLoading(false);
      }, (error) => {
      console.error('Error fetching comments:', error);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [tweetId]);

  const fetchMoreComments = useCallback(() => {
    if (isLoading || !lastVisibleComment) return;
    setIsLoading(true);
    const commentQuery = query(
      collection(db, 'comments'),
      where('tweetId', '==', tweetId),
      orderBy('createdAt', 'desc'),
      startAfter(lastVisibleComment),
      limit(10)
    );

    const unsubscribe = onSnapshot(commentQuery, async (snapshot) => {
      if (!snapshot.empty) {
          const newComments = await Promise.all(snapshot.docs.map(async (doc) => ({
            cmtId: doc.id,
            userId: doc.data().userId,
            userNm: doc.data().userNm || 'Anonymous',
            comment: doc.data().comment,
            createdAt: doc.data().createdAt,
          })));
          setComments((prevComments) => [...prevComments, ...newComments]);
          setLastVisibleComment(snapshot.docs[snapshot.docs.length - 1]);
        }
          setIsLoading(false);
    }, (error) => {
      console.error('Error fetching more comments:', error);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [isLoading, lastVisibleComment, tweetId]);

  useEffect(() => {
    const unsubscribe = fetchComments();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchComments]);

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
    setCmtVal(e.target.value);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (cmtVal.trim()) {
        onCommentSave();
      }
    }
  };

  const onCommentSave = async () => {
    if (isLoading || !cmtVal.trim() || timeLimit) return;
    setIsLoading(true);
    try {
      if (!user) {
        console.warn('User not logged in.');
        return;
      }
      const newComment = {
        createdAt: Date.now(),
        tweetId: tweetId,
        userId: user.uid,
        userNm: user.displayName || 'Anonymous',
        comment: cmtVal,
      };
      await addDoc(collection(db, 'comments'), newComment);
      setPostTimes((prevPostTimes) => [...prevPostTimes, Date.now()].slice(-MAX_ATTEMPTS));
      setCmtVal(''); // Clear comment input after saving
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.error('Error saving comment:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form>
      <CommentWarpper>
        {comments.length === 0 && !isLoading && (
          "댓글을 작성하세요"
        )}
        {comments.map((comment) => (
          <Comments key={comment.cmtId} {...comment} />
        ))}
        {isLoading && <div>Loading...</div>}
      </CommentWarpper>
      <TextArea
        rows={4}
        cols={60}
        value={cmtVal}
        onChange={onChange}
        placeholder={timeLimit ? '잠시 후에 다시 작성해주세요.' : '댓글을 작성하세요...'}
        onKeyDown={onKeyDown}
        disabled={timeLimit}
      />
      <ButtonForm>
        <SaveButton type="button" onClick={onCommentSave} disabled={isLoading || timeLimit}>
          {isLoading ? '저장 중...' : '저장'}
        </SaveButton>
      </ButtonForm>
    </Form>
  );
});

export default CommentsForm;
