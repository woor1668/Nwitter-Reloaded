import {signInWithEmailAndPassword} from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { Error, Form, Input, Switcher, Title, Wrapper } from "../../css/auth-componet";
import GithubButton from "../../components/github-btn";

export default function LoginAsis(){
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    
    const onChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        const {target: {name, value}}  = e;
        if(name === "email"){
            setEmail(value);
        }else if(name === "password"){
            setPassword(value);
        }
    }
    
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        setError("");
        if(isLoading || email === "" || password === ""){
            return;
        }
        try{
          setLoading(true);
          await signInWithEmailAndPassword(auth, email, password)
         
          navigate("/");
        }catch(e){
            if(e instanceof FirebaseError){
                setError(e.name)
            }
            
        }finally{
            setLoading(false);
        }
        console.log(name, email, password);
    }

    return (
        <Wrapper>
            <Title>로그인</Title>
            <Form onSubmit={onSubmit}>
                <Input onChange = {onChange} name="email" value={email} placeholder="Email" type="email" required/>
                <Input onChange = {onChange} name="password" value={password} placeholder="password" type="password" required/>
                <Input type="submit" value={isLoading ? "Loading..." : "Log in"}/>
            </Form>
            {error !== "" ? <Error>{error}</Error> : null}
            <Switcher>아직 계정이 없으신가요? <Link to={"/create-account"}>회원가입 &rarr;</Link></Switcher>
            <GithubButton />
        </Wrapper>
    )
}