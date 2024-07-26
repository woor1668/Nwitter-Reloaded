import { forwardRef } from "react";
import styled from "styled-components";
import SvgIcon from "./svg";

const Wrapper = styled.div`
    position: absolute;
    top: -5px; /* Adjust this value to control the vertical position */
    width: 100px;
    right: 0;
    background-color: black;
    border-radius: 15px;
    box-shadow: 0px 0px 2px 2px rgba(255, 255, 255, 0.3);
    z-index: 1000;
`;

const Menu = styled.div`
    font-size: 14px;
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    &:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
    &:first-child:hover {
        border-top-left-radius: 15px;
        border-top-right-radius: 15px;
    }
    &:last-child {
        border-bottom: 0px;
    }
    &:last-child:hover {
        border-bottom-left-radius: 15px;
        border-bottom-right-radius: 15px;
    }
    svg{
        margin-right: 5px;
        margin-left: 0px;
        width: 14px;
    }
    &.Delete{
        color: tomato;
        svg{
            fill: tomato;
        }
    }
`;

interface DropdownProps {
  option: { label: string; onClick: () => void }[];
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(({ option = [] }, ref) => (
  <Wrapper ref={ref}>
    {option.map((item, index) => (
      <Menu className={item.label} key={index} onClick={item.onClick}><SvgIcon name={item.label}/>{item.label}</Menu>
    ))}
  </Wrapper>
));

export default Dropdown;
