import styled from "styled-components";

interface DropdownMenuProps {
  show: boolean;
}

export const DropdownMenu = styled.div<DropdownMenuProps>`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 150px;
  display: ${props => (props.show ? 'block' : 'none')};
  z-index: 10;
`;
