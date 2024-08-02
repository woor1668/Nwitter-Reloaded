import styled, { css } from "styled-components";
import { slideInFromTop, slideOutToTop } from "./animation";

export const Wrapper = styled.div`
    display: grid;
    grid-template-rows: 1fr 5fr;
    gap: 20px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 0px;
        background: none;
    }
`;

export const AvatarContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const AvatarUpload = styled.label`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #1d9bf0;
    cursor: pointer;
    overflow: hidden;
    position: relative;
    svg {
        height: 50px;
        width: 50px;
    }
`;

export const AvatarImg = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

export const AvatarInput = styled.input`
    display: none;
`;

export const NameDiv = styled.div`
    margin: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const SvgSpan = styled.span`
    margin-left: 10px;
    cursor: pointer;
`;

export const Name = styled.input<{ $isEditable: boolean }>`
    background-color: transparent;
    border: none;
    color: white;
    text-align: center;
    pointer-events: ${(props) => (props.$isEditable ? "auto" : "none")};
    font-size: 22px;
    border-bottom: ${(props) => (props.$isEditable ? "1px solid white" : "none")};
    outline: none;
`;

export const Tweets = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

export const UpArrow = styled.div<{ $show: boolean }>`
    display: ${({ $show }) => ($show ? 'flex' : 'none')};
    justify-content: center;
    align-items: center;
    position: fixed;
    background-color: rgba(29, 155, 240);
    color: white;
    border: 3px solid white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    z-index: 1000;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    animation: ${({ $show }) =>
        $show
            ? css`${slideInFromTop} 0.8s ease-out forwards`
            : css`${slideOutToTop} 0.8s ease-in forwards`};
    svg {
        width: 25px;
        height: 25px;
        stroke: white;
        stroke-width: 2;
    }
`;
