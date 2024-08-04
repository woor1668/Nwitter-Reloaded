import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { Error, Form, Input, Password, Psp, Switcher, Title, Wrapper } from "../css/auth-componet";
import GithubButton from "../components/github-btn";
import { getErrorMessage } from "../components/errors-mesage";
import { validatePwd } from "../components/validationPwd";
import SvgIcon from "../components/svg";

export default function CreateAccount() {
    const navigate = useNavigate();
    const [state, setState] = useState({ isLoading: false, name: "", email: "", password: "", error: "", isPass: false });

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setState({ ...state, [e.target.name]: e.target.value });
    const { isLoading, name, email, password, error, isPass } = state;
    useEffect(() => {
        if (isPass) {
            const timeoutId = setTimeout(() => {
                setState((preState) => ({ ...preState, isPass: !preState.isPass }));
            }, 2000);
            return () => clearTimeout(timeoutId);
        }
    }, [state.isPass]);
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { isLoading, name, email, password } = state;
        if (isLoading || name === "" || email === "" || password === ""){ 
            return setState({...state, error: getErrorMessage("noData")});
        }
        setState({ ...state, error: "", isLoading: true });
        if(validatePwd(password)){
            return setState({...state, error: getErrorMessage("validPwd")});
        };
        try {
            const credentials = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(credentials.user, { displayName: name });
            navigate("/");
        } catch (e) {
            if (e instanceof FirebaseError) {
                setState({ ...state, error: getErrorMessage(e.code) });
            }
        } finally {
            setState((prevState) => ({ ...prevState, isLoading: false }));
        }
    };
    const changePw = () => {
        setState((preState) => ({...preState, isPass: !preState.isPass }))
    };

    return (
        <Wrapper>
            <Title>회원가입</Title>
            <Form onSubmit={onSubmit}>
                <Input onChange={onChange} name="name" value={name} placeholder="Name" type="text"/>
                <Input onChange={onChange} name="email" value={email} placeholder="Email" type="email"/>
                <Password>
                    <Input onChange={onChange} name="password" value={password} placeholder="password" type={isPass ? "text" : "password"} />
                    <Psp onClick={changePw}>
                        <SvgIcon name={isPass ? "s_eye" : "eye"}/>
                    </Psp>
                </Password>
                <Input type="submit" value={isLoading ? "Loading..." : "가입하기"} />
            </Form>
            {error && <Error>{error}</Error>}
            <Switcher>이미 가입하셨나요? <Link to="/login">로그인 &rarr;</Link></Switcher>
            <GithubButton />
        </Wrapper>
    );
}
