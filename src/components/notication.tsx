import styled from "styled-components";
import { INotication } from "./timeline";
import SvgIcon from "./svg";
interface notiProps extends INotication {}

const Wrapper = styled.div`
  display: grid;    
  gap: 10px;
  padding: 20px 20px 10px 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  background: tomato;
  `
 const NotiNm = styled.div`
     display: flex;
     align-items: center;
     font-family: 600;
     font-size: 16px;
 svg {
    height: 30px;
    width: 30px;    
    cursor: default;
    margin-right: 5px;
  }
`
const NotiCont = styled.div`
  margin: 10px 0;
  font-size: 18px;
  word-wrap: break-word;
  white-space: pre-wrap;
`;

export default function Notication({
  id,
  notication
}: notiProps) {
    return(
        <Wrapper>
            <NotiNm><SvgIcon name="excl"/>공지</NotiNm>
            <NotiCont>{notication}</NotiCont>
        </Wrapper>
    )

}
