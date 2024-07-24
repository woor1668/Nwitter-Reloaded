const errors: { [key: string]: string } = {
        "auth/email-already-in-use": "이미 존재하는 이메일입니다.",
        "auth/invalid-email": "유효하지 않은 이메일 주소입니다.",
        "auth/operation-not-allowed": "이 작업은 허용되지 않습니다.",
//        "auth/weak-password": "비밀번호는 6자 이상이어야 합니다.",
        "auth/user-disabled": "이 계정은 비활성화되었습니다.",
        "auth/user-not-found": "사용자를 찾을 수 없습니다.",
        "auth/invalid-login-credentials": "이메일 또는 비밀번호가 틀렸습니다.",
        "auth/wrong-password": "잘못된 비밀번호입니다.",
        "auth/account-exists-with-different-credential": "다른 자격 증명으로 계정이 이미 존재합니다.",
        "auth/credential-already-in-use": "이미 사용 중인 자격 증명입니다.",
        "auth/email-change-needs-recent-login": "이메일을 변경하려면 최근에 로그인해야 합니다.",
        "auth/invalid-credential": "유효하지 않은 자격 증명입니다.",
        "auth/invalid-verification-code": "유효하지 않은 인증 코드입니다.",
        "auth/invalid-verification-id": "유효하지 않은 인증 ID입니다.",
        "auth/invalid-app-credential": "유효하지 않은 앱 자격 증명입니다.",
        "auth/invalid-user-token": "유효하지 않은 사용자 토큰입니다.",
        "auth/too-many-requests": "너무 많은 요청이 발생했습니다. 나중에 다시 시도해주세요.",
        "auth/expired-action-code": "작업 코드가 만료되었습니다.",
        "auth/invalid-action-code": "유효하지 않은 작업 코드입니다.",
        "noData": "이메일 또는 비밀번호를 입력해주세요.",
        "validPwd": "비밀번호는 8자리 이상 문자, 숫자, 특수문자가 포함되어야 합니다."
};

export const getErrorMessage = (errorCode : string) => {
    return errors[errorCode] || "알 수 없는 오류가 발생했습니다.";
};