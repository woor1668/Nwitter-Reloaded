import styled from "styled-components";

export const Wrapper = styled.div`
  display: grid;    
  grid-template-columns: 1.2cm 1fr;
  padding: 20px 20px 10px 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;
export const UserDiv = styled.div`
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
export const AvatarImg = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;
export const Column = styled.div``;
export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;
export const UserNm = styled.span`
  font-weight: bold;
  font-size: 16px;
  margin-right: 10px;
`;
export const UserId  = styled.span`
    font-weight: 200;
    font-size: 14px;
    color: gray;
`;
export const MorDiv = styled.div`
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
export const Payload = styled.div`
  margin: 10px 0;
  font-size: 14px;
  word-wrap: break-word;
  white-space: pre-wrap;
`;
export const Photo = styled.img`
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  max-width: 100%;
  max-height: 516px;
`;
export const Foopter = styled.div`
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
  transition: color 0.3s ease, transform 0.3s ease; /* Smooth color and transform transitions */
  margin-right: 10px;
  svg {
    fill: rgba(255, 255, 255, 0.8);
    margin-right: 8px; /* Space between icon and text */
    transition: fill 0.3s ease; /* Smooth color transition */
  }
  &:hover svg {
    fill: #1d9bf0; /* Color on hover */
  }
  &.liked::before, &.disliked::before {
    content: '';
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.1);
    animation: pulse 1s ease-out;
  }
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.5;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
`;

export const ChatSpan = styled(Span)``;
export const UpSpan = styled(Span)``;
export const DownSpan = styled(Span)``;