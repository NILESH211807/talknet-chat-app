import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { BiSearch } from 'react-icons/bi';
import { FaUser, FaCamera } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import Button from './Button';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAxios } from '../hook/useAxios';
import { handleResponse } from '../services/error';
import toast from 'react-hot-toast';
import Spinner from './Spinner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/Auth';
import { useParams } from 'react-router-dom';

interface GroupEditProps {
    setIsGroupEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
    groupData: {
        _id: string;
        name: string;
        members: User[];
        isGroup: boolean;
        profile?: { image_url: string, public_id: string };
    };
}

interface User {
    _id: string;
    name: string;
    username: string;
    profile?: {
        image_url: string;
        public_id: string;
    };
}

const groupEditSchema = yup.object().shape({
    name: yup.string().required('Group name is required'),
});

const GroupEdit: React.FC<GroupEditProps> = ({ groupData, setIsGroupEditOpen }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { fetchData } = useAxios();
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const queryClient = useQueryClient();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { user } = useAuth();
    const { id } = useParams();

    useEffect(() => {
        const filteredUsers = groupData?.members.filter(u => u._id !== user?._id);
        setSelectedUsers(filteredUsers);
    }, []);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(groupEditSchema),
        defaultValues: {
            name: groupData?.name || '',
        },
    });

    const handleSelectUser = (user: User) => {
        setSelectedUsers(prev => ([...prev, user]));
        handleClearSearch();
    };

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers(prev => prev.filter(user => user._id !== userId));
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleSearchInput = async (value: string) => {
        setSearchQuery(value);
        if (value.length >= 1) {
            await fetchSearchResults(value);
        } else {
            setSearchResults([]);
        }
    };

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

            // Filter out already selected users
            response.data = response.data.filter((user: User) =>
                !selectedUsers.find(selected => selected._id === user._id));

            if (response.data.length <= 0) toast.error('No users found');
            setSearchResults(response?.data);
        } catch (error: any) {
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

    const handleUpdateGroup = async (data: any) => {
        if (!data) return;
        if (selectedUsers.length <= 0) return;

        const formData = new FormData();
        if (selectedImage || selectedFile) {
            formData.append('profile_image', selectedFile as File);
        }
        // filter only id from members 
        const membersList = selectedUsers?.map(user => user._id);
        formData.append('chatId', groupData._id);
        formData.append('name', data.name);
        formData.append('members', JSON.stringify(membersList));
        mutation.mutate(formData);
    };

    const mutation = useMutation({
        mutationKey: ["UPDATE_GROUP"],
        mutationFn: async (data: FormData) => await fetchData({
            method: 'PUT',
            url: '/api/group/update-group',
            data,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }),
        onSuccess: (data) => {
            const { success, message } = handleResponse(data);
            if (success) {
                queryClient.invalidateQueries({ queryKey: ["CHAT_ID", id] });
                queryClient.invalidateQueries({ queryKey: ["MY_CHATS"] });
                toast.success(message);
                handleClearSearch();
                setIsGroupEditOpen(false);
            } else {
                toast.error(message);
            }
        },
        onError: (error: any) => {
            const { message } = handleResponse(error);
            toast.error(message);
        }
    });


    return (
        <>
            <div className={`fixed top-0 right-0 w-full z-[1100] h-screen bg-[#00000067] backdrop:blur-2xl`}></div>
            <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 z-[1200] -translate-y-1/2 w-[95%] max-w-md bg-[var(--bg-primary)] shadow-lg rounded-lg transform transition-transform duration-300 ease-in-out`}>
                <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Edit Group</h2>
                    <button
                        onClick={() => setIsGroupEditOpen(false)}
                        className="p-2 cursor-pointer hover:bg-[var(--bg-secondary)] rounded-full">
                        <IoClose className="text-[var(--text-secondary)] text-2xl" />
                    </button>
                </div>

                <form className="p-4" onSubmit={handleSubmit(handleUpdateGroup)}>
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center overflow-hidden">
                                {selectedImage || groupData?.profile && groupData?.profile?.image_url ? (
                                    <img src={selectedImage || groupData?.profile?.image_url} alt="Group" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl text-[var(--text-secondary)]">G</span>
                                )}
                            </div>
                            <button type='button' className="absolute bottom-0 right-0 p-2 bg-[var(--bg-primary)] rounded-full border border-[var(--border-primary)]">
                                <FaCamera className="text-[var(--text-secondary)]" />
                            </button>

                            <label htmlFor="upload_profile_image2" className="absolute bottom-0 right-0 cursor-pointer">
                                <div className="p-2 bg-[var(--bg-primary)] rounded-full border border-[var(--border-primary)]">
                                    <FaCamera className="text-[var(--text-secondary)]" />
                                </div>
                                <input
                                    type="file"
                                    id="upload_profile_image2"
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
                        <p className="error_message -mt-2">{errors.name.message}</p>
                    )}

                    <div className="input_wrapper mt-4">
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
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="p-1 absolute right-7 cursor-pointer rounded-full">
                                    <IoClose className="text-xl transition-colors text-red-300" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="mt-4">
                        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">Members</h3>
                        <div className="max-h-[150px] overflow-y-auto">
                            {selectedUsers.map(user => (
                                <div
                                    key={user._id}
                                    className="flex items-center justify-between p-2 hover:bg-[var(--bg-secondary)] rounded-md">
                                    <div className="flex items-center gap-2">
                                        {user?.profile?.image_url ? (
                                            <img
                                                src={user?.profile?.image_url}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                                                <FaUser className="text-[var(--text-secondary)]" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold text-[var(--text-secondary)]">{user.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveUser(user._id)}
                                        className="p-1 hover:bg-red-100 rounded-full">
                                        <MdDelete className="text-red-500 cursor-pointer" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="mt-4 border border-[var(--border-primary)] rounded-md">
                            <h3 className="text-sm font-semibold text-[var(--text-secondary)] p-2 border-b border-[var(--border-primary)]">
                                Search Results
                            </h3>
                            <div className="max-h-[150px] overflow-y-auto">
                                {searchResults.map(user => (
                                    <div
                                        key={user._id}
                                        className="flex items-center gap-2 p-2 hover:bg-[var(--bg-secondary)] cursor-pointer"
                                        onClick={() => handleSelectUser(user)}>
                                        {user?.profile?.image_url ? (
                                            <img
                                                src={user.profile.image_url}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                                                <FaUser className="text-[var(--text-secondary)]" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold text-[var(--text-secondary)]">{user.name}</p>
                                            <p className="text-xs text-[var(--text-secondary)]">@{user.username}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button
                        disabled={selectedUsers.length < 2}
                        isLoading={mutation.isPending}
                        className="mt-4 w-full">
                        Update Group
                    </Button>
                </form>
            </div>
        </>
    );
};

export default GroupEdit
