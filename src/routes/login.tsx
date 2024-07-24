import {signInWithEmailAndPassword} from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { Error, Form, Input, Switcher, Title, Wrapper } from "../components/auth-componet";
import GithubButton from "../components/github-btn";
import { getErrorMessage } from "../components/errors-mesage";

export default function Login(){
    const navigate = useNavigate();
    const [state, setState] = useState({ isLoading: false, email: "", password: "", error: "" , isLogin: false});
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setState({ ...state, [e.target.name]: e.target.value });
    const pwdRef = useRef<HTMLInputElement | null>(null);
    useEffect(() =>{
        if(pwdRef.current){
            pwdRef.current.focus();     
            setState((prevState) => ({ ...prevState, password: "", isLogin: false }));
        }
    },[state.isLogin])
    
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        const { isLoading, email, password} = state;
        if (isLoading || email === "" || password === ""){
             return setState({...state, error: getErrorMessage("noData")})
            };
        setState({ ...state, error: "", isLoading: true });
        try{
          await signInWithEmailAndPassword(auth, email, password)         
          navigate("/");
        }catch (e) {
            if (e instanceof FirebaseError) {
                console.log(e.code);
                setState({ ...state, error: getErrorMessage(e.code),  isLogin: true });
            }
        }finally{
            setState((prevState) => ({ ...prevState, isLoading: false }));
        }
    }

    const { isLoading, email, password, error } = state;
    
    return (
        <Wrapper>
            <Title>로그인</Title>
            <Form onSubmit={onSubmit}>
                <Input onChange = {onChange} name="email" value={email} placeholder="Email" type="email"/>
                <Input onChange = {onChange} name="password" value={password} placeholder="password" type="password" ref={pwdRef}/>
                <Input type="submit" value={isLoading ? "Loading..." : "로그인"}/>
            </Form>
            {error !== "" ? <Error>{error}</Error> : null}
            <Switcher>아직 계정이 없으신가요? <Link to={"/create-account"}>회원가입 &rarr;</Link></Switcher>
            <GithubButton />
        </Wrapper>
    )
}