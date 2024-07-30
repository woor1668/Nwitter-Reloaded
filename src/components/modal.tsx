import styled from "styled-components";

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 2%;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContentWrapper  = styled.div`
  display: grid;
  gap: 10px;
  background-color: black;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0px 0px 2px 2px rgba(255, 255, 255, 0.5);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  border-radius: 20%;
  box-shadow: 0px 0px 2px 2px rgba(255, 255, 255, 0.5);
  color: white;
  font-size: 20px;
  width: 25px;
  margin-left:auto;
  cursor: pointer;
`;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }
  
  const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
  
    return (
      <ModalWrapper>
        <ModalContentWrapper>
          <CloseButton onClick={onClose}>×</CloseButton>
          {children}
        </ModalContentWrapper>
      </ModalWrapper>
    );
  };
  
  export default Modal;
