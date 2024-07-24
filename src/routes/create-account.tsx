import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { Error, Form, Input, Switcher, Title, Wrapper } from "../components/auth-componet";
import GithubButton from "../components/github-btn";
import { getErrorMessage } from "../components/errors-mesage";
import { validatePwd } from "../components/validationPwd";

export default function CreateAccount() {
    const navigate = useNavigate();
    const [state, setState] = useState({ isLoading: false, name: "", email: "", password: "", error: "" });

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setState({ ...state, [e.target.name]: e.target.value });

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

    const { isLoading, name, email, password, error } = state;

    return (
        <Wrapper>
            <Title>회원가입</Title>
            <Form onSubmit={onSubmit}>
                <Input onChange={onChange} name="name" value={name} placeholder="Name" type="text"/>
                <Input onChange={onChange} name="email" value={email} placeholder="Email" type="email"/>
                <Input onChange={onChange} name="password" value={password} placeholder="password" type="password"/>
                <Input type="submit" value={isLoading ? "Loading..." : "가입하기"} />
            </Form>
            {error && <Error>{error}</Error>}
            <Switcher>이미 가입하셨나요? <Link to="/login">로그인 &rarr;</Link></Switcher>
            <GithubButton />
        </Wrapper>
    );
}
