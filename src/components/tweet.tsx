import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useRef, useState, useCallback } from "react";
import SvgIcon from "./svg";
import Dropdown from "./dropdown";
import { FirebaseError } from "firebase/app";
import Modal from "./modal";
import RePostTweetForm from "./re-post-tweet-form";
import { alretBox, confirmBox } from "./commonBox";

const Wrapper = styled.div`
  display: grid;    
  grid-template-columns: 1.2cm 1fr;
  padding: 20px 20px 10px 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const UserDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
  height: 40px;
  width: 40px;
  border-radius: 50%;
  svg {
    height: 30px;
    width: 30px;
  }
`;

const AvatarImg = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const Column = styled.div``;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const UserNm = styled.span`
  font-weight: bold;
  font-size: 16px;
  margin-right: 10px;
`;
const UserId  = styled.span`
    font-weight: 200;
    font-size: 14px;
    color: gray;
`;
const MorDiv = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center; 
  &:hover {
    border-radius: 50%;
    background-color: rgba(29, 161, 242, 0.4); 
    svg {
      fill: rgb(29, 161, 242);
    }
  }      
`;

const Payload = styled.div`
  margin: 10px 0;
  font-size: 14px;
  word-wrap: break-word;
  white-space: pre-wrap;
`;

const Photo = styled.img`
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  max-width: 100%;
  max-height: 516px;
`;
const Foopter = styled.div`
    margin-left: 30px;
    display: flex;
    justify-content: space-around; /* Adjust spacing between items */
    align-items: center; /* Optional: background color for visibility */
    padding: 10px; /* Optional: padding for overall space */
    border-radius: 8px; /* Optional: rounded corners */
`;

const Span = styled.span`
    display: flex;
    align-items: center;
    font-size: 11px; /* Adjust as needed */
    cursor: pointer; /* Change cursor to pointer to indicate clickability */
    transition: color 0.3s ease; /* Smooth color transition on hover */
    margin-right: 10px;
    svg {
        fill: rgba(255,255,255,0.8);
        margin-right: 8px; /* Space between icon and text */
        &:hover {
            fill: #1d9bf0; /* Color on hover */
        }
    }
`;

const ChatSpan = styled(Span)``;
const UpSpan = styled(Span)``;
const DownSpan = styled(Span)``;

interface TweetProps extends ITweet {}

export default function Tweet({
  userNm,
  photo_url,
  tweet,
  userId,
  id
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
    tweetId: id
  });

  const { isLoading, avatarUrl, showDropdown, isModalOpen, modalContent, tweetId } = state;
//프로필 이미지 가져오기
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
//트윗 삭제
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
///트윗 수정
  const onEdit = useCallback(() => {
    setState(prevState => ({ ...prevState, isModalOpen: true, showDropdown: false }));
  }, []);
//트윗 수정 콜백
  const reConentSave = useCallback(async (newContent: string, newFile?: File, isDelete?: boolean) => {
    setState(prevState => ({
        ...prevState,
        isModalOpen: false,
        modalContent: newContent,
        modalFileUrl: newFile ? URL.createObjectURL(newFile) : prevState.modalFileUrl,
    }));
    try {
        const tweetRef = doc(db, "tweets", tweetId); // state에 tweetId가 있다고 가정
        console.log(newContent);
        await updateDoc(tweetRef, {
            tweet: newContent,
            updatedAt: Date.now()
        });
        const locationRef = ref(storage, `tweets/${user?.uid}/${tweetId}`);
        if(isDelete){  
          console.log(`tweets/${user?.uid}/${tweetId}`);
          await deleteObject(locationRef);
          await updateDoc(tweetRef, {
            photo_url: ""
        });
        }else{
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
//드롭다운 이벤트
const handleMorDivClick = useCallback((event: React.MouseEvent) => {
  event.stopPropagation();
  setState(prevState => ({ ...prevState, showDropdown: !prevState.showDropdown }));
}, []);
//드롭다운 옵션
const options = [
  { label: 'Delete', onClick: onDelete },
  { label: 'Edit', onClick: onEdit }
];
  //드롭다운 닫기 이벤트
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

  const clickChat = () =>{
    alretBox("되는 줄 알았지");
  }
  const clickUp = () =>{
    alretBox("사실 안됨");
  }
  const clickDown = () =>{
    alretBox("이것도");
  }
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
          <UserNm>{userNm}<UserId> @{userId.slice(0, 4)}</UserId></UserNm>
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
            <UpSpan onClick={clickUp}><SvgIcon name="up_finger"/> 0</UpSpan>
            <DownSpan onClick={clickDown}><SvgIcon name="down_finger"/> 0</DownSpan>
      </Foopter>
    </Wrapper>
  );
}
