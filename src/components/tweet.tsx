import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import SvgIcon from "./svg";
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
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        if (userId) {
          const avatarRef = ref(storage, `avatar/${userId}`);
          const url = await getDownloadURL(avatarRef);
          setAvatarUrl(url);
        }
      } catch (error) {
        console.error("Error fetching avatar:", error);
      }
    };

    fetchAvatar();
  }, [userId]);

  const onDelete = async () => {
    setShowDropdown(prevState => !prevState);
        if (confirm("트윗을 삭제하시겠습니까?") && user?.uid === userId && !isLoading) {
        try {
            setLoading(true);
            await deleteDoc(doc(db, "tweets", id));
            if (photo_url) {
            const photoRef = ref(storage, `tweets/${userId}/${id}`);
            await deleteObject(photoRef);
            }
        } catch (e) {
        } finally {
            setLoading(false);
        }
    }
  };

  const onEdit = () => {
    // Implement edit functionality or remove if not needed
  };

  const handleMorDivClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent click from closing dropdown
    setShowDropdown(prevState => !prevState);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (morDivRef.current && !morDivRef.current.contains(event.target as Node) 
         && dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
         {
        setShowDropdown(false);
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
          {avatarUrl ? <AvatarImg src={avatarUrl} /> : <SvgIcon name="user" />}
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
    </Wrapper>
  );
}
