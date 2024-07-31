import { keyframes } from "styled-components";

export const slideInFromTop = keyframes`
  0% {
    opacity: 0;
    transform: translateY(50px); /* Start from above the viewport */
  }
  100% {
    opacity: 1;
    transform: translateY(0); /* End at the normal position */
  }
`;
export const slideOutToTop = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0); /* Start at the normal position */
  }
  100% {
    opacity: 0;
    transform: translateY(50px); /* Move to above the viewport */
  }
`;