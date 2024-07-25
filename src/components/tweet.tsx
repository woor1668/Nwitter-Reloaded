import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useState } from "react";
import { Delete, Edit } from "./svg";

const Wrapper = styled.div`
    display: grid;    
    grid-template-columns: 6fr 1fr;
    padding: 20px;
    border: 1px solid rgba(255,255,255,0.5);
    border-radius: 15px;
`;
const Column = styled.div`
    `;
const  Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: left;
`
const UserNm = styled.span`
    font-weight: 600;
    font-size: 15px;
    margin-right: 10px;
    `;
const Payload = styled.div`
    margin: 10px 0px;
    font-size: 18px;
`;
const Photo = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 15px;
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

export default function Tweet({userNm, photo_url, tweet, userId, id}:ITweet){
    const [isLoading, setLoading] = useState(false);
    const user = auth.currentUser;
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
    return <Wrapper>
        <Column>
            <Header>
                <UserNm>{userNm}</UserNm>
                {user?.uid === userId ? <EditBtn onClick={onEdit}><Edit/></EditBtn>: null}
                {user?.uid === userId ? <DeleteBtn onClick={onDelete}><Delete/></DeleteBtn>: null}
            </Header>
            <Payload>{tweet}</Payload>
        </Column>
        <Column>
            {photo_url?
                <Photo src={photo_url}/>
        : null}
        </Column>
    </Wrapper>
}