import { useEffect, useRef } from "react";
import styled from "styled-components";

interface DropdownMenuProps {
  show: boolean;
  top: number;
  left: number;
}

interface DropdownProps {
  moreOptionsRef: React.RefObject<HTMLDivElement>;
  showDropdown: boolean;
  setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  dropdownPosition: { top: number; left: number };
  onEdit: () => void;
  onDelete: () => void;
}

const DropdownMenu = styled.div<DropdownMenuProps>`
  position: absolute;
  top: ${({ top }) => top - 20}px;
  left: ${({ left }) => left - 130}px;
  background-color: black;
  border-radius: 15px;
  box-shadow: 0 0 2px 2px rgba(255, 255, 255, 0.8);
  width: 150px;
  display: ${({ show }) => (show ? 'block' : 'none')};
  z-index: 1;
`;

const DropdownItem = styled.div`
  font-size: 14px;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  cursor: pointer;
  &:hover {
    background-color: rgba(29, 161, 242, 0.4);
  }
  &:last-child {
    border-bottom: none;
  }
`;

export default function Dropdown({
  moreOptionsRef,
  showDropdown,
  setShowDropdown,
  dropdownPosition,
  onEdit,
  onDelete,
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        moreOptionsRef.current &&
        !moreOptionsRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    // 스크롤과 리사이즈 이벤트 핸들러 등록
    const updateDropdownPosition = () => {
      if (moreOptionsRef.current) {
        const rect = moreOptionsRef.current.getBoundingClientRect();
        
        dropdownPosition.top = rect.bottom;
        dropdownPosition.left = rect.left;
      }
    };

    // 드롭다운이 보일 때만 클릭 외부 처리기 등록
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      updateDropdownPosition(); // 위치 업데이트
      window.addEventListener('resize', updateDropdownPosition);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [showDropdown, setShowDropdown, moreOptionsRef, dropdownPosition]);

 

  return (
    <DropdownMenu
      show={showDropdown}
      top={dropdownPosition.top}
      left={dropdownPosition.left}
      ref={dropdownRef}
    >
      <DropdownItem onClick={() => { onEdit(); setShowDropdown(false); }}>Edit</DropdownItem>
      <DropdownItem onClick={() => { onDelete(); setShowDropdown(false); }}>Delete</DropdownItem>
    </DropdownMenu>
  );
}
