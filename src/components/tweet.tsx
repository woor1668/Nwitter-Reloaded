import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import { MoreHor, User } from "./svg";
import Dropdown from "./dropdown";

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
`;

interface TweetProps extends ITweet {}

export default function Tweet({
  userNm,
  photo_url,
  tweet,
  userId,
  id
}: TweetProps) {
  const [isLoading, setLoading] = useState(false);
  const user = auth.currentUser;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const morDivRef = useRef<HTMLDivElement | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const updateDropdownPosition = () => {
    if (morDivRef.current) {
      const rect = morDivRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
      });
    }
  };

  useEffect(() => {
    // Initial position update
    updateDropdownPosition();

    const handleResize = () => updateDropdownPosition();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [showDropdown]);

  const handleMoreOptionsClick = () => {
    setShowDropdown(prev => !prev);
  };

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const avatarQuery = query(
          collection(db, "avatar"),
        );
        const snapshot = await getDocs(avatarQuery);
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data();
          setAvatarUrl(docData.photoURL || null);
        }
      } catch (error) {
        console.error("Error fetching avatar:", error);
      }
    };

    fetchAvatar();
  }, [userId]);

  const onDelete = async () => {
    if (confirm("트윗을 삭제하시겠습니까?") && user?.uid === userId && !isLoading) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, "tweets", id));
        if (photo_url) {
          const photoRef = ref(storage, `tweets/${userId}/${id}`);
          await deleteObject(photoRef);
        }
      } catch (error) {
        console.error("트윗 삭제 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const onEdit = () => {
    // Implement edit functionality or remove if not needed
  };

  return (
    <Wrapper>
      <Column>
        <UserDiv>
            {avatarUrl ?  <AvatarImg src={avatarUrl}/> : <User />}
        </UserDiv>
      </Column>
      <Column>
        <Header>
          <UserNm>{userNm}</UserNm>     
          {user?.uid === userId && (
            <MorDiv ref={morDivRef} onClick={handleMoreOptionsClick}>
              <MoreHor />
            </MorDiv>
          )}
          <Dropdown
            moreOptionsRef={morDivRef}
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            dropdownPosition={dropdownPosition}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Header>
        <Payload>{tweet}</Payload>
        {photo_url && <Photo src={photo_url} />}
      </Column>
    </Wrapper>
  );
}
