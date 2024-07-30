import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref } from "firebase/storage";
import { useEffect, useRef, useState, useCallback } from "react";
import SvgIcon from "./svg";
import Dropdown from "./dropdown";
import { FirebaseError } from "firebase/app";
import Modal from "./modal";
import RePostTweetForm from "./re-post-tweet-form";

const Wrapper = styled.div`
  display: grid;    
  grid-template-columns: 1.2cm 1fr;
  padding: 20px;
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
    modalFileUrl: photo_url as string | null
  });

  const { isLoading, avatarUrl, showDropdown, isModalOpen, modalContent, modalFileUrl  } = state;

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

  const onDelete = useCallback(async () => {
    setState(prevState => ({ ...prevState, showDropdown: false }));
    if (confirm("트윗을 삭제하시겠습니까?") && user?.uid === userId && !isLoading) {
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

  const onEdit = useCallback(() => {
    setState(prevState => ({ ...prevState, isModalOpen: true, showDropdown: false }));
  }, []);

  const handleMorDivClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent click from closing dropdown
    setState(prevState => ({ ...prevState, showDropdown: !prevState.showDropdown }));
  }, []);

  const reConentSave = useCallback((newContent: string, newFile?: File) => {
    // Handle save logic here
    console.log('New content:', newContent);
    console.log('New file:', newFile);
    setState(prevState => ({
      ...prevState,
      isModalOpen: false,
      modalContent: newContent,
      modalFileUrl: newFile ? URL.createObjectURL(newFile) : modalFileUrl,
    }));
  }, [modalFileUrl]);

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

  const options = [
    { label: 'Delete', onClick: onDelete },
    { label: 'Edit', onClick: onEdit }
  ];

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
          <UserNm>{userNm}</UserNm>
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
          initialFileUrl={modalFileUrl}
          onSave={reConentSave}
        />
      </Modal>
    </Wrapper>
  );
}
