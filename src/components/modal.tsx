import React, { useRef, useState } from "react";
import styled from "styled-components";

const ModalWrapper = styled.div<{ top: number; left: number }>`
  position: fixed;
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContentWrapper = styled.div`
  display: grid;
  gap: 10px;
  background-color: black;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0px 0px 2px 2px rgba(255, 255, 255, 0.5);
`;

const ModalTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  cursor: move;
  user-select: none;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  border-radius: 20%;
  box-shadow: 0px 0px 2px 2px rgba(255, 255, 255, 0.5);
  color: white;
  font-size: 20px;
  width: 25px;
  margin-left: auto;
  cursor: pointer;
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: window.innerHeight / 3, left: window.innerWidth / 2.5 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.left, y: e.clientY - position.top });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({ top: e.clientY - dragStart.y, left: e.clientX - dragStart.x });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <ModalWrapper top={position.top} left={position.left}>
      <ModalContentWrapper ref={modalRef}>
        <ModalTitle onMouseDown={handleMouseDown}>
          {title}  
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalTitle>
        {children}
      </ModalContentWrapper>
    </ModalWrapper>
  );
};

export default Modal;
