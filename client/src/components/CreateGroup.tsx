import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { BiSearch } from 'react-icons/bi';
import { FaUser } from 'react-icons/fa';
import Button from './Button';

interface CreateGroupProps {
    isOpen: boolean;
    onClose: () => void;
}

interface User {
    id: string;
    name: string;
    avatar: string;
}

const CreateGroup: React.FC<CreateGroupProps> = ({ isOpen, onClose }) => {
    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Dummy users data for demonstration
    const users: User[] = [
        { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: '2', name: 'Alice Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
        { id: '3', name: 'Bob Johnson', avatar: 'https://i.pravatar.cc/150?img=3' },
        { id: '4', name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/150?img=4' },
        { id: '5', name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/150?img=4' },
        { id: '6', name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/150?img=4' },
        { id: '7', name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/150?img=4' },
    ];

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedUsers.find(selected => selected.id === user.id)
    );

    const handleSelectUser = (user: User) => {
        setSelectedUsers([...selectedUsers, user]);
        setSearchQuery('');
    };

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) return;

        setIsLoading(true);
        try {
            // Add your group creation logic here
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Group created:', {
                name: groupName,
                members: selectedUsers
            });
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={`fixed top-0 right-0 w-full h-screen bg-[#00000067] backdrop:blur-2xl ${isOpen ? 'block' : 'hidden'} z-40`} onClick={onClose}></div>
            <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-[var(--bg-primary)] shadow-lg rounded-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'scale-100' : 'scale-0'} z-50`}>
                {/* Header */}
                <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Create New Group</h2>
                    <button
                        onClick={onClose}
                        className="p-2 cursor-pointer hover:bg-[var(--bg-secondary)] rounded-full"
                    >
                        <IoClose className="text-[var(--text-secondary)] text-2xl" />
                    </button>
                </div>

                <div className="p-4">
                    {/* Group Name Input */}
                    <div className="input_wrapper">
                        <input
                            type="text"
                            placeholder="Group Name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </div>

                    {/* Search Users */}
                    <div className="input_wrapper">
                        <div className="flex items-center">
                            <BiSearch className="text-[var(--text-secondary)] text-xl ml-2" />
                            <input
                                type="text"
                                placeholder="Search users to add"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {selectedUsers.map(user => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-2 bg-[var(--bg-secondary)] px-3 py-1 rounded-full"
                                >
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-6 h-6 rounded-full"
                                    />
                                    <span className="text-sm font-semibold text-[var(--text-secondary)]">{user.name}</span>
                                    <button
                                        onClick={() => handleRemoveUser(user.id)}
                                        className="text-[var(--text-secondary)] hover:text-red-500 cursor-pointer"
                                    >
                                        <IoClose />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* User List */}
                    {searchQuery && (
                        <div className="max-h-[150px] overflow-y-auto border border-[var(--border-primary)] rounded-sm shadow-sm mt-2">
                            {filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    className="flex items-center border-b border-b-[var(--border-primary)] gap-3 p-2 hover:bg-[var(--bg-secondary)] cursor-pointer"
                                    onClick={() => handleSelectUser(user)}
                                >
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <span className="text-sm font-semibold text-[var(--text-secondary)]">{user.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button
                        onClick={handleCreateGroup}
                        disabled={!groupName.trim() || selectedUsers.length === 0}
                        isLoading={isLoading}
                        className="mt-4"
                    >
                        Create Group
                    </Button>
                </div>
            </div>
        </>
    );
};

export default CreateGroup
