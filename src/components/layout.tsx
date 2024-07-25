import { Link, Outlet, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth } from "../firebase";
import { Home, Logout, User } from "./svg";

const Wrapper = styled.div`
    display: grid;
    gap: 20px;
    grid-template-columns: 1fr 4fr;
    height: 100%;
    padding: 50px 0px;
    width: 100%;
    max-width: 860px;
`;
const Menu = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
`;
const MenuItem = styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    height: 50px;
    width: 50px;
    border-radius: 50px;
    svg{
            width: 30px;
            height: 30px;
        }
    &.log-out{
        border-radius: tomato;
        svg{
            fill: tomato;
        }
    }
`;

export default function Layout(){
    const navigate = useNavigate();
    const onLogout = async() => {
        const ok = confirm("로그아웃 하시겠습니까?");
        if(ok){
            await auth.signOut();
            navigate("/login");
        }
    }
    return (
        <Wrapper>
            <Menu>
                <Link to={"/"}>
                    <MenuItem>
                        <Home/>
                    </MenuItem>
                </Link>
                <Link to={"/profile"}>
                    <MenuItem>
                        <User/>
                    </MenuItem>
                </Link>
                <MenuItem className="log-out" onClick={onLogout}>
                   <Logout/>
                </MenuItem>
            </Menu>
            <Outlet/>
        </Wrapper>
    )
}