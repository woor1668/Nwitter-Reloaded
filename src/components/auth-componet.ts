import styled from "styled-components";

export const Wrapper = styled.div `
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 420px;
    padding: 50px 0px;
`;
export const Title = styled.h1`
    font-size: 42px;
`;
export const Form = styled.form `
    margin-top: 50px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
`;
export const Input = styled.input `
    padding: 10px 20px;
    border-radius: 50px;
    border: none;
    width: 100%;
    font-size: 16px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    &[type="submit"]{
        cursor: pointer;
        background-color: #1D9BF0;
        color: black;
        &:hover{
            opacity: 0.8;
        }
    }
`;
export const Error = styled.span`
    font-weight: 600;
    color: tomato;
`;
export const Switcher = styled.span`
    margin-top: 20px;
    a{
        color: #1d9bf0;
    }
`;

export const GitButton = styled.span`
    margin-top: 50px;
    background-color: white;
    font-weight: 500;
    width: 100%;
    color: black;
    padding: 10px 20px;
    border-radius: 50px;
    border: 0;
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;
export const GitLogo = styled.img`
    height: 25px;
`;

export const Password = styled.div`
    position: relative;
    svg{
        top: 10px;
        right: 10px;
        position: absolute;
        z-index: 1000;
        fill: black;
    }
`;
export const Psp = styled.p``;