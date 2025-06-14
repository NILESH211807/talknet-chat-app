import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { BiSearch } from 'react-icons/bi';
import { FaCamera, FaUser } from 'react-icons/fa';
import Button from './Button';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAxios } from '../hook/useAxios';
import { handleResponse } from '../services/error';
import toast from 'react-hot-toast';
import Spinner from './Spinner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateGroupProps {
    isOpen: boolean;
    onClose: () => void;
}

interface User {
    _id: string;
    name: string;
    username: string,
    profile: {
        image_url: string;
        public_id: string;
    };
}

interface Group {
    name: string;
}

interface CreateGroup {
    name: string;
}

const createGroupSchema = yup.object().shape({
    name: yup.string().required('Group name is required'),
});

const CreateGroup: React.FC<CreateGroupProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { fetchData } = useAxios();
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const queryClient = useQueryClient();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(createGroupSchema),
    });


    const handleSelectUser = (user: User) => {
        setSelectedUsers(prev => ([...prev, user]));
        setSearchQuery('');
    };

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers(prev => prev.filter(user => user._id !== userId));
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedUsers([]);
        setValue('name', '');
    };


    // handle search onchange
    const handleSearchInput = (value: string) => {
        const formattedValue = value
            .replace(/[^a-zA-Z0-9@.\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        setSearchQuery(formattedValue);
    };

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            fetchSearchResults(searchQuery);
        }, 500);

        return () => {
            clearTimeout(timeoutId);
        }
    }, [searchQuery])

    const fetchSearchResults = async (value: string) => {
        setIsLoading(true);
        try {
            const response = await fetchData({
                method: 'GET',
                url: `/api/user/search`,
                params: { query: value }
            });

            const { success, message } = handleResponse(response);

            if (!success) toast.error(message);

            // filter selected users from search results
            response.data = response.data.filter((user: User) =>
                !selectedUsers.find(selected => selected._id === user._id));

            if (response.data.length <= 0) toast.error('No users found');
            setSearchResults(response?.data);
        } catch (error: any) {
            console.error('Error fetching search results:', error);
            const { message } = handleResponse(error);
            toast.error(message || 'Failed to fetch search results');
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateGroup = async (data: Group) => {
        if (!data) return;
        if (selectedUsers.length <= 0) return;

        const formData = new FormData();
        if (selectedImage || selectedFile) {
            formData.append('profile_image', selectedFile as File);
        }
        // filter only id from members 
        const membersList = selectedUsers?.map(user => user._id);

        formData.append('name', data.name);
        formData.append('members', JSON.stringify(membersList));
        mutation.mutate(formData);
    };


    const mutation = useMutation({
        mutationKey: ["CREATE_GROUP"],
        mutationFn: async (data: FormData) => await fetchData({
            method: 'POST',
            url: '/api/group/create',
            data,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }),
        onSuccess: (data) => {
            const { success, message } = handleResponse(data);
            if (success && message == "Group created successfully") {
                queryClient.invalidateQueries({ queryKey: ["MY_CHATS"] });
                toast.success(message);
                handleClearSearch();
                onClose();
            } else {
                toast.error(message);
            }
        },
        onError: (error: any) => {
            const { message } = handleResponse(error);
            toast.error(message);
        }
    })

    return (
        <>
            <div className={`fixed top-0 right-0 w-full h-screen bg-[#00000067] backdrop:blur-2xl ${isOpen ? 'block' : 'hidden'} z-40`} onClick={onClose}></div>
            <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-[var(--bg-primary)] shadow-lg rounded-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'scale-100' : 'scale-0'} z-50`}>
                {/* Header */}
                <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Create New Group</h2>
                    <button
                        onClick={onClose}
                        className="p-2 cursor-pointer hover:bg-[var(--bg-secondary)] rounded-full">
                        <IoClose className="text-[var(--text-secondary)] text-2xl" />
                    </button>
                </div>

                <form className="p-4" onSubmit={handleSubmit(handleCreateGroup)}>
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center overflow-hidden">
                                {selectedImage ? (
                                    <img
                                        src={selectedImage}
                                        alt="Group"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl text-[var(--text-secondary)]">G</span>
                                )}
                            </div>
                            <label htmlFor="upload_profile_image" className="absolute bottom-0 right-0 cursor-pointer">
                                <div className="p-2 bg-[var(--bg-primary)] rounded-full border border-[var(--border-primary)]">
                                    <FaCamera className="text-[var(--text-secondary)]" />
                                </div>
                                <input
                                    type="file"
                                    id="upload_profile_image"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>
                    </div>



                    <div className="input_wrapper">
                        <input
                            type="text"
                            placeholder="Group Name"
                            {...register('name')} />
                    </div>
                    {errors.name && (
                        <p className="error_message -mt-2">{errors.name.message}</p>)}

                    {/* Search Users */}
                    <p className="text-xs text-[var(--text-primary)]">
                        Enter a name, email, or username to search. Click 'Search' to proceed.
                    </p>

                    <div className="input_wrapper">
                        <div className="flex items-center">
                            <BiSearch className="text-[var(--text-secondary)] text-xl ml-2" />
                            <input
                                type="text"
                                placeholder="Search users to add"
                                value={searchQuery}
                                onChange={(e) => handleSearchInput(e.target.value)} />

                            {isLoading && (
                                <div className='absolute right-8'>
                                    <Spinner />
                                </div>
                            )}
                            {!isLoading && searchQuery && (
                                <button
                                    onClick={handleClearSearch}
                                    className="p-1 absolute right-7 cursor-pointer rounded-full">
                                    <IoClose className="text-xl transition-colors text-red-300" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4 max-h-40 overflow-y-scroll">
                            {selectedUsers.map(user => (
                                <div
                                    key={user._id}
                                    className="flex items-center gap-2 bg-[var(--bg-secondary)] px-2 py-1 rounded-md border border-[var(--border-primary)]">
                                    {user?.profile && user?.profile?.image_url ? (
                                        <img
                                            src={user?.profile?.image_url}
                                            alt={user.name}
                                            className="w-7 h-7 rounded-full"
                                        />
                                    ) : (
                                        <div className="border border-[var(--border-primary)] p-2 flex items-center justify-center rounded-full overflow-hidden">
                                            <FaUser size={14} className="text-[var(--text-secondary)]" />
                                        </div>
                                    )}
                                    <span className="text-xs font-semibold text-[var(--text-secondary)]">{user.name}</span>
                                    <button
                                        onClick={() => handleRemoveUser(user._id)}
                                        className="text-[var(--text-secondary)] mr-1 hover:text-red-500 cursor-pointer">
                                        <IoClose size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* User List */}
                    {searchResults.length > 0 && (
                        <div className="max-h-[150px] overflow-y-auto border border-[var(--border-primary)] rounded-sm shadow-sm mt-2">
                            {searchResults.map(user => (
                                <div
                                    key={user._id}
                                    className="flex items-center border-b border-b-[var(--border-primary)] gap-3 p-2 hover:bg-[var(--bg-secondary)] cursor-pointer"
                                    onClick={() => handleSelectUser(user)}>
                                    {user?.profile && user?.profile?.image_url ? (
                                        <img
                                            src={user?.profile?.image_url}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full" />
                                    ) : (
                                        <div className="border border-[var(--border-primary)] p-2 flex items-center justify-center rounded-full overflow-hidden">
                                            <FaUser size={20} className="text-[var(--text-secondary)]" />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-[var(--text-secondary)]">{user.name}</span>
                                        <span className="text-sm text-[var(--text-secondary)]">{user.username}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button
                        disabled={selectedUsers.length <= 0}
                        isLoading={mutation.isPending}
                        className="mt-4">
                        Create Group
                    </Button>
                </form>
            </div>
        </>
    );
};

export default CreateGroup
