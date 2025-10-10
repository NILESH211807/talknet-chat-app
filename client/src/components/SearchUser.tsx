import React, { useEffect, useState } from 'react'
import { BiSearch } from 'react-icons/bi'
import { IoClose } from 'react-icons/io5'
import { useAxios } from '../hook/useAxios'
import { handleResponse } from '../services/error';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Spinner from './Spinner';
import { useNavigate } from 'react-router-dom';

interface User {
    _id: string;
    name: string;
    username: string;
    profile: {
        image_url: string;
    };
}

interface newChatStart {
    userId: string;
}

const SearchUser = () => {

    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { fetchData } = useAxios();
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const [userId, setUserId] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const handleSearchInput = (value: string) => {
        const formattedValue = value
            .replace(/[^a-zA-Z0-9@.\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        setSearchQuery(formattedValue);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
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


    // handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target as Node)
            ) {
                setSearchResults([]);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    //  user add to chat
    const addToChat = (user: User) => {
        if (!user) return;
        setUserId(user._id);
        mutation.mutate({ userId: user._id });
    }

    const mutation = useMutation({
        mutationKey: ["START_NEW_CHAT"],
        mutationFn: async (data: newChatStart) => await fetchData({
            method: 'POST',
            url: '/api/chat/start-chat',
            data
        }),
        onSuccess: (data) => {
            const { success, message, data: resData } = handleResponse(data);
            if (success && message == "Chat created successfully") {
                // toast.success(message);
                handleClearSearch();
                navigate(`/chat/${resData.chatId}`);
            } else {
                toast.error(message);
                handleClearSearch();
            }
        },
        onError: (error: any) => {
            const { message } = handleResponse(error);
            toast.error(message);
            handleClearSearch();
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['MY_CHATS'] })
    })


    return (
        <div className="py-2 px-2 mt-3 relative">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center gap-2 px-3 py-2 rounded-full focus-within:border-[var(--btn-primary)]">
                <BiSearch className="text-[var(--text-secondary)] text-2xl" />
                <input
                    type="text"
                    placeholder="Search or start new chat"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    className="bg-transparent outline-none w-full text-[var(--text-primary)] font-semibold text-[15px]" />

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

            {searchResults.length > 0 && (
                <div ref={searchInputRef} className='w-[90%] max-h-52 bg-[var(--bg-primary)] absolute top-16 left-1/2 -translate-x-1/2 border border-[var(--border-primary)] rounded-md overflow-y-auto z-[300]'>
                    <div className="flex flex-col">
                        {searchResults.map((user: User) => (
                            <div
                                key={user._id}
                                onClick={() => addToChat(user)}
                                className="flex items-center gap-3 p-3 hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors">
                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                    {user.profile ? (
                                        <img
                                            src={user.profile?.image_url}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[var(--bg-secondary)] flex items-center justify-center">
                                            <span className="text-[var(--text-secondary)] text-md font-semibold">
                                                {user.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-[var(--text-primary)]">
                                        {user.name}
                                    </h4>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        {user.username}
                                    </p>
                                </div>

                                {userId === user._id && mutation.isPending && (
                                    <div className='ml-5'>
                                        <Spinner />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchUser
