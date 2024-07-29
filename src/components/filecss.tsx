import styled from "styled-components";

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;
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
    font-size: 16px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    &:focus{
        outline: none;
        border-color: #1d9bf0;
    }
`;
export const File = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 14px;
`;
export const AttachFileButton = styled.label<{ $hasFile: boolean }>`
    padding: 10px 0px;
    color: #1d9bf0;
    text-align: center;
    border-radius: 20px;
    border: 1px solid #1d9bf0;
    background-color: ${props => (props.$hasFile ? "transparent" : "white")};
    width: 100%;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
`;
export const AttachFileInput = styled.input`
    display: none;
`;
export const SubmitBtn = styled.input`
    background-color: #1d9bf0;
    color: white;
    border: none;
    padding: 10px 0px;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
    &:hover,
    &:active{
        opacity: 0.9;
    }
`;

export const DelDiv = styled.div``;
