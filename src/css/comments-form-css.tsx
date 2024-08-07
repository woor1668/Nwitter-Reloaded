// ModalContentStyles.ts

import styled from "styled-components";

export const Form = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

export const CommentWarpper = styled.div`
  
  display: grid;
  gap: 5px;
  max-height: 500px; /* Adjust the height as needed */
  overflow-y: auto;
  border-radius: 5px; 
  &::-webkit-scrollbar {
        width: 0px;
        background: none;
    }
`;

export const Comments = styled.div`
    border: 2px solid #444;
    border-radius: 10px;    
`;

export const CommentItem = styled.div`
    color: white;
`;

export const CommentHeader = styled.div`
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #444;
    background-color: #222;
`;

export const AvatarImg = styled.img`
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid gray;
    vertical-align: middle;
    margin-right: 5px;
`;

export const UserNm = styled.span`
    font-weight: bold;
    font-size: 16px;
    margin-right: 10px;
`;

export const UserId = styled.span`
    font-weight: 200;
    font-size: 14px;
    color: gray;
`;

export const Delete = styled.p`
    color: white;
    font-size: 16px;
    margin-left: auto;
    cursor: pointer;
    &:hover {
        color: rgb(29, 161, 242);
    }
`;

export const CommentMain = styled.div`
    padding: 10px;
    word-wrap: break-word;
    white-space: pre-wrap;
`;

export const CommentFooter = styled.div`
    display: flex;
    align-items: center; 
    padding: 10px; 
    border-radius: 8px;
`;

export const Reply = styled.span`
    cursor: pointer;
    font-size: 12px;
    margin-right: 10px;
    svg {
        margin-right: 5px;
        vertical-align: middle;
        background: rgb(29, 161, 242);
        width: 15px;
        height: 15px;
        border: 1px solid darkgray;
    }
    &:hover {
        svg {
            background: rgba(29, 161, 242, 0.7);
        }
    }
`;

export const TextArea = styled.textarea`
    border: 2px solid white;
    padding: 20px;
    border-radius: 20px;
    font-size: 16px;
    color: white;
    background-color: black;
    width: 100%;
    resize: none;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    &:focus {
        outline: none;
        border-color: #1d9bf0;
    }
`;

export const ButtonForm = styled.span`
    display: flex;
    justify-content: center;
`;

export const SaveButton = styled.button`
    background: rgb(29, 161, 242);
    color: white;
    border: none;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    &:hover {
        background: rgba(29, 161, 242, 0.7);
    }
`;

export const ReplyWrapper = styled.form``;
export const Rples = styled.div``;
export const RepIcon = styled.span`
    margin-right: 7px;
    width: 15px;
    height: 15px;
    background: tomato;
    svg{
        width: 15px;
        height: 15px;
        fill: none;
        color: black;
    }
`;