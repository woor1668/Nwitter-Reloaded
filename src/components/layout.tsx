import { Link, Outlet, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth } from "../firebase";
import SvgIcon from "./svg";
import { confirmBox } from "./commonBox";

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
        const result =await confirmBox("로그아웃 하시겠습니까?");
        if (result.isConfirmed) {
            await auth.signOut();
            navigate("/login");
        }
    }
    return (
        <Wrapper>
            <Menu>
                <Link to={"/"}>
                    <MenuItem>
                        <SvgIcon name="home"/>
                    </MenuItem>
                </Link>
                <Link to={"/profile"}>
                    <MenuItem>
                        <SvgIcon name="user"/>
                    </MenuItem>
                </Link>
                <MenuItem className="log-out" onClick={onLogout}>
                    <SvgIcon name="logout"/>
                </MenuItem>
            </Menu>
            <Outlet/>
        </Wrapper>
    )
}