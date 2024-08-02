import Swal, { SweetAlertResult } from "sweetalert2";
import "../css/dark-theme.css";


export const alretBox = (msg: string) => {
    return Swal.fire({
        html: msg.replace(/\n/g, '<br>')
        .replace(/좋아요/g, '<span style="color: #1d9bf0;">좋아요</span>')
        .replace(/싫어요/g, '<span style="color: #ff5a5f;">싫어요</span>'),
        text: msg,
        showCancelButton: true,
        showConfirmButton: false,
        background: 'black',
        color: 'white',
        cancelButtonColor: '#1d9bf0',
        cancelButtonText: '확인',
        customClass: {
            container: 'main',
            popup: 'dark-theme'
        }
    });
};
export const confirmBox = (msg: string): Promise<SweetAlertResult<any>> => {
    return Swal.fire({
        html: msg.replace(/\n/g, '<br>'),
        text: msg,
        showCancelButton: true,
        background: 'black',
        color: 'white',
        confirmButtonText: '예',
        cancelButtonText: '아니오',
        confirmButtonColor: 'tomato',
        cancelButtonColor: '#1d9bf0',
        customClass: {
            container: 'main',
            popup: 'dark-theme'
        }
    });
};