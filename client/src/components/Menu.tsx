import React, { useEffect, useRef, useState } from 'react';
import { FaUserAlt } from 'react-icons/fa';
import { IoLogOut } from 'react-icons/io5';
import { MdGroupAdd } from 'react-icons/md';
import ConfirmLogout from './ConfirmLogout';

interface MenuProps {
    setShowMenu: (show: boolean) => void;
    setIsCreateGroupOpen: (open: boolean) => void;
    setIsProfileOpen: (open: boolean) => void;
    buttonRef: React.RefObject<HTMLButtonElement>;
}

const Menu: React.FC<MenuProps> = ({
    setShowMenu,
    setIsCreateGroupOpen,
    setIsProfileOpen,
    buttonRef
}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [IsLogoutOpen, setIsLogoutOpen] = useState<boolean>(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node) &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setShowMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [buttonRef, setShowMenu]);

    return (
        <div
            ref={menuRef}
            className="absolute right-0 top-12 w-48 bg-[var(--bg-primary)] flex flex-col rounded-md shadow-lg border border-[var(--border-primary)] z-50">
            <button
                className="w-full text-[var(--text-secondary)] cursor-pointer font-semibold text-sm px-4 py-3 text-left hover:bg-[var(--bg-secondary)] flex items-center gap-2"
                onClick={() => {
                    setShowMenu(false);
                    setIsCreateGroupOpen(true);
                }}>
                <MdGroupAdd size={18} />
                Create Group
            </button>

            <button
                className="w-full text-[var(--text-secondary)] cursor-pointer font-semibold text-sm px-4 py-3 text-left hover:bg-[var(--bg-secondary)] flex items-center gap-2"
                onClick={() => {
                    setShowMenu(false);
                    setIsProfileOpen(true);
                }}>
                <FaUserAlt size={15} />
                Profile
            </button>

            <button
                className="w-full text-red-400 cursor-pointer font-semibold text-sm px-4 py-3 text-left hover:bg-[var(--bg-secondary)] flex items-center gap-2"
                onClick={() => setIsLogoutOpen(true)}>
                <IoLogOut size={15} />
                Logout
            </button>

            {
                IsLogoutOpen && (
                    <ConfirmLogout isOpen={IsLogoutOpen} setIsLogoutOpen={setIsLogoutOpen} />
                )
            }
        </div>
    );
};

export default Menu
