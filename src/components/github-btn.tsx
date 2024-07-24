import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { GitButton, GitLogo } from "./auth-componet";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function GithubButton(){
    const navigate = useNavigate();
    const onClick = async () => {
        try {
            const provieder = new GithubAuthProvider();
            await signInWithPopup(auth, provieder)
            navigate("/");
        } catch (e) {
            
        }
    }
    return (
        <GitButton onClick={onClick}>
            <GitLogo src="/github-logo.svg"/>
            Continue with Github
        </GitButton>
    )
}