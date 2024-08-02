import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useRef, useState, useCallback } from "react";
import SvgIcon from "./svg";
import Dropdown from "./dropdown";
import { FirebaseError } from "firebase/app";
import Modal from "./modal";
import RePostTweetForm from "./re-post-tweet-form";
import { alretBox, confirmBox } from "./commonBox";
import { AvatarImg, ChatSpan, Column, DownSpan, Foopter, Header, MorDiv, Payload, Photo, UpSpan, UserDiv, UserId, UserNm, Wrapper } from "../css/tweetCss";
import { timeStamp } from "./timeStamp";

interface TweetProps extends ITweet {}

export default function Tweet({
  userNm,
  photo_url,
  tweet,
  userId,
  id,
  createdAt
}: TweetProps) {
  const user = auth.currentUser;
  const morDivRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [state, setState] = useState({
    isLoading: false,
    avatarUrl: null as string | null,
    showDropdown: false,
    isModalOpen: false,
    modalContent: tweet,
    modalFileUrl: photo_url as string | null,
    tweetId: id,
    likes: 0,
    dislikes: 0,
    userLikeStatus: null as boolean | null
  });

  const { isLoading, avatarUrl, showDropdown, isModalOpen, modalContent, tweetId, likes, dislikes, userLikeStatus } = state;

  // 프로필 이미지 가져오기
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        if (userId) {
          const avatarRef = ref(storage, `avatar/${userId}`);
          const url = await getDownloadURL(avatarRef);
          setState(prevState => ({ ...prevState, avatarUrl: url }));
        }
      } catch (e) {
        if (e instanceof FirebaseError && e.code !== "storage/object-not-found") {
          console.error("Error fetching avatar:", e);
        }
        setState(prevState => ({ ...prevState, avatarUrl: null })); // Fallback to default avatar
      }
    };
    fetchAvatar();
  }, [userId]);

  // 트윗 삭제
  const onDelete = useCallback(async () => {
    setState(prevState => ({ ...prevState, showDropdown: false }));
    const result = await confirmBox("트윗을 삭제하시겠습니까?");
    if (result.isConfirmed && user?.uid === userId && !isLoading) {
      try {
        setState(prevState => ({ ...prevState, isLoading: true }));
        await deleteDoc(doc(db, "tweets", id));
        if (photo_url) {
          const photoRef = ref(storage, `tweets/${userId}/${id}`);
          await deleteObject(photoRef);
        }
      } catch (e) {
        console.error("Error deleting tweet:", e);
      } finally {
        setState(prevState => ({ ...prevState, isLoading: false }));
      }
    }
  }, [user?.uid, userId, isLoading, id, photo_url]);

  // 트윗 수정
  const onEdit = useCallback(() => {
    setState(prevState => ({ ...prevState, isModalOpen: true, showDropdown: false }));
  }, []);

  // 트윗 수정 콜백
  const reConentSave = useCallback(async (newContent: string, newFile?: File, isDelete?: boolean) => {
    setState(prevState => ({
        ...prevState,
        isModalOpen: false,
        modalContent: newContent,
        modalFileUrl: newFile ? URL.createObjectURL(newFile) : prevState.modalFileUrl,
    }));
    try {
        const tweetRef = doc(db, "tweets", tweetId);
        console.log(newContent);
        await updateDoc(tweetRef, {
            tweet: newContent,
            updatedAt: Date.now()
        });
        const locationRef = ref(storage, `tweets/${user?.uid}/${tweetId}`);
        if (isDelete) {  
          await deleteObject(locationRef);
          await updateDoc(tweetRef, {
            photo_url: ""
          });
        } else {
          if (newFile) {
            const result = await uploadBytes(locationRef, newFile);
            const url = await getDownloadURL(result.ref);
            await updateDoc(tweetRef, {
              photo_url: url
            });
          }
        }
    } catch (e) {
        console.error("Error updating document: ", e);
    }
  }, [tweetId]);

  // 드롭다운 이벤트
  const handleMorDivClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setState(prevState => ({ ...prevState, showDropdown: !prevState.showDropdown }));
  }, []);

  // 드롭다운 옵션
  const options = [
    { label: 'Delete', onClick: onDelete },
    { label: 'Edit', onClick: onEdit }
  ];

  // 드롭다운 닫기 이벤트
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (morDivRef.current && !morDivRef.current.contains(event.target as Node) 
        && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setState(prevState => ({ ...prevState, showDropdown: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 실시간 likes 및 dislikes 업데이트
  useEffect(() => {
    const likeQuery = query(collection(db, 'likes'), where("tweetId", "==", tweetId));
    const unsubscribe = onSnapshot(likeQuery, (snapshot) => {
      const likesData = snapshot.docs.map(doc => doc.data());
      const likeCount = likesData.filter(like => like.likes).length;
      const dislikeCount = likesData.filter(like => !like.likes).length;
      const userLike = likesData.find(like => like.userId === user?.uid);
      setState(prevState => ({ ...prevState, likes: likeCount, dislikes: dislikeCount, userLikeStatus: userLike ? userLike.likes : null  }));
    });
    return () => unsubscribe();
  }, [tweetId]);

  const cilckLike = async (isLike: boolean) => {
    try {
      if (userLikeStatus === false)  {
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
        collection(db, 'likes'),
        where("userId", "==", user?.uid),
        where("tweetId", "==", tweetId)
      );
      const querySnapshot = await getDocs(likeQuery);
      const existingLikes = querySnapshot.docs.map(doc => doc.id);
  
      if (existingLikes.length > 0) {
        // 이미 좋아요/싫어요 상태가 있는 경우, 삭제
        await deleteDoc(doc(db, "likes", existingLikes[0]));
      }else{
        await addDoc(collection(db, "likes"), {
          createdAt: Date.now(),
          userId: user?.uid,
          tweetId: tweetId,
          likes: isLike
        });
      }
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e)
      }
    }
  };

  const clickChat = () => {
    alretBox("되는 줄 알았지");
  };

  const clickUp = () => {
    cilckLike(true);
  };

  const clickDown = () => {
    cilckLike(false);
  };
  return (
    <Wrapper>
      <Column>
        <UserDiv>
          {avatarUrl ? (
            <AvatarImg
              src={avatarUrl}
              onError={() => setState(prevState => ({ ...prevState, avatarUrl: null }))}
            />
          ) : (
            <SvgIcon name="user" />
          )}
        </UserDiv>
      </Column>
      <Column>
        <Header>
          <UserNm>{userNm}<UserId> @{userId.slice(0, 4)} · {timeStamp(createdAt)}</UserId></UserNm>
          {user?.uid === userId && (
            <MorDiv ref={morDivRef} onClick={handleMorDivClick}>
              <SvgIcon name="moreHor" />
            </MorDiv>
          )}
          {showDropdown && (
            <Dropdown ref={dropdownRef} option={options} />
          )}
        </Header>
        <Payload>{tweet}</Payload>
        {photo_url && <Photo src={photo_url} />}
      </Column>
      <Modal isOpen={isModalOpen} onClose={() => setState(prevState => ({ ...prevState, isModalOpen: false }))}>
        <RePostTweetForm
          initialContent={modalContent}
          initialFileUrl={photo_url}
          onSave={reConentSave}
        />
      </Modal>
        <Foopter>
            <ChatSpan onClick={clickChat}><SvgIcon name="chat"/> 0</ChatSpan>
            <UpSpan onClick={clickUp}>
              <SvgIcon name="up_finger" style={{ fill: userLikeStatus === true ? '#1d9bf0' : 'rgba(255,255,255,0.8)' }} /> {likes}
            </UpSpan>
            <DownSpan onClick={clickDown}>
              <SvgIcon name="down_finger" style={{ fill: userLikeStatus === false ? '#ff5a5f' : 'rgba(255,255,255,0.8)' }} />  {dislikes}
            </DownSpan>
      </Foopter>
    </Wrapper>
  );
}
