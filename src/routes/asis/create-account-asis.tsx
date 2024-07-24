import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { Error, Form, Input, Switcher, Title, Wrapper } from "../../components/auth-componet";
import GithubButton from "../../components/github-btn";

export default function CreateAccountAsis(){
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    
    const onChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        const {target: {name, value}}  = e;
        if(name === "name"){
            setName(value);
        }else if(name === "email"){
            setEmail(value);
        }else if(name === "password"){
            setPassword(value);
        }
    }
    
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        setError("");
        if(isLoading || name === "" || email === "" || password === ""){
            return;
        }
        try{
          setLoading(true);
          const credentials = await createUserWithEmailAndPassword(auth, email, password)
          await updateProfile(credentials.user, {
            displayName : name
          });
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
            <Title>회원가입</Title>
            <Form onSubmit={onSubmit}>
                <Input onChange = {onChange} name="name" value={name} placeholder="Name" type="text" required/>
                <Input onChange = {onChange} name="email" value={email} placeholder="Email" type="email" required/>
                <Input onChange = {onChange} name="password" value={password} placeholder="password" type="password" required/>
                <Input type="submit" value={isLoading ? "Loading..." : "Create Accout"}/>
            </Form>
            {error !== "" ? <Error>{error}</Error> : null}
            <Switcher>이미 가입하셨나요? <Link to={"/login"}>로그인 &rarr;</Link></Switcher>
            <GithubButton />
        </Wrapper>
    )
}