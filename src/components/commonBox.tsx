import Swal, { SweetAlertResult } from "sweetalert2";
import "../css/dark-theme.css";


export const alretBox = (msg: string) => {
    return Swal.fire({
        html: msg.replace(/\n/g, '<br>'),
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