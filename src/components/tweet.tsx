import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import { Delete, Edit, MoreHor, User } from "./svg";

const Wrapper = styled.div`
    display: grid;    
    grid-template-columns: 1cm 1fr;
    padding: 20px;
    border: 1px solid rgba(255,255,255,0.5);
    border-radius: 15px;
`;
const UserDiv = styled.div`
    border: 1px solid white;
    height: 30px;
    width: 30px;
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    `;
const Column = styled.div``;
const  Header = styled.div`
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
    :hover {
    border-radius: 50%;
    background-color: rgba(29, 161, 242, 0.4); 
        svg {
        width: 30px;
        height: 30px;
        fill: rgb(29, 161, 242);
        }
    }      
`;
const Payload = styled.div`
    margin: 10px 0px;
    font-size: 14px;
    word-wrap: break-word;
    white-space: pre-wrap;
`;
const Photo = styled.img`
    border: 1px solid rgba(255,255,255,0.5);
    border-radius: 15px;
    max-width: 100%;
    
`;

const DeleteBtn = styled.button`
    background-color: tomato;
    color: white;
    font-weight: 600;
    border: 0;
    font-size: 9px;
    padding: 5px 6px;
    text-transform: uppercase;
    border-radius: 5px;
    margin: 0px;
    cursor: pointer;
    svg{
        width: 15px;
        height: 15px;
    }
`;
const EditBtn = styled.span`
    margin-right: 10px;
    border: 1px solid white;
    padding: 5px 6px;
    border-radius: 5px;
    svg{
        width: 15px;
        height: 15px;
    }
`;
 
  const DropdownMenu = styled.div<{ show: boolean, top: number, left: number }>`
  position: absolute;
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 150px;
  display: ${props => (props.show ? 'block' : 'none')};
  z-index: 10;
`;

const DropdownItem = styled.div`
  padding: 10px;
  cursor: pointer;
  :hover {
    background-color: rgba(29, 161, 242, 0.1);
  }
`;

export default function Tweet({userNm, photo_url, tweet, userId, id}:ITweet){
    const [isLoading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 });  
    const user = auth.currentUser;
    const morDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showDropdown && morDivRef.current) {
          const rect = morDivRef.current.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + window.scrollY, // Position below the MorDiv
            left: rect.left + window.scrollX // Align with the MorDiv horizontally
          });
        }
      }, [showDropdown]);

    const onDelete = async() => {
        const ok = confirm("트윗을 삭제하시겠습니까?");
        if(!ok || user?.uid !== userId || isLoading) return;
        try {
            setLoading(true);
            await deleteDoc(doc(db, "tweets", id));
            if(photo_url){
                const photoRef = ref(storage, `tweets/${userId}/${id}`);
                await deleteObject(photoRef);
            }
        } catch (e) {
            
        }finally{
            setLoading(false);
        }
    }
    const onEdit = () => {

    }
    return (
        //{user?.uid === userId ? <EditBtn onClick={onEdit}><Edit/></EditBtn>: null}
        //{user?.uid === userId ? <DeleteBtn onClick={onDelete}><Delete/></DeleteBtn>: null}
        <Wrapper>
            <Column>
                <UserDiv><User/></UserDiv>
            </Column>
            <Column>
                <Header>
                    <UserNm>{userNm}</UserNm>
                    <MorDiv ref={morDivRef} onClick={() => setShowDropdown(prev => !prev)}><MoreHor/></MorDiv>
                    <DropdownMenu show={showDropdown} top={dropdownPosition.top} left={dropdownPosition.left}>
                        <DropdownItem onClick={onEdit}>Edit</DropdownItem>
                        <DropdownItem onClick={onDelete}>Delete</DropdownItem>
                    </DropdownMenu>
                </Header>
                <Payload>{tweet}</Payload>
                {photo_url?
                    <Photo src={photo_url}/>
            : null}
            </Column>
        </Wrapper>
    )
}