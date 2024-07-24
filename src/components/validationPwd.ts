export const validatePwd = (password: string) => {
    // Regular expressions to check password requirements
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength || !hasLetter || !hasNumber || !hasSpecialChar) return true;

    return false;
};