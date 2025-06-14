import React, { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { FaCamera, FaEye, FaEyeSlash, FaUser } from 'react-icons/fa'
import Button from './Button'
import { useAuth } from '../context/Auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAxios } from '../hook/useAxios';
import { handleResponse } from '../services/error';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ProfileProps {
    isOpen: boolean;
    onClose: () => void;
}

interface profileUpdateValues {
    name: string | null;
    username: string | null;
}

const profileUpdateSchema = yup.object().shape({
    name: yup
        .string()
        .required('Name is required')
        .min(3, 'Name must be at least 3 characters')
        .max(50, 'Name must be at most 50 characters'),
    username: yup
        .string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be at most 50 characters'),
})

interface PasswordUpdateValues {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const passwordUpdateSchema = yup.object().shape({
    oldPassword: yup
        .string()
        .required('Current password is required')
        .min(6, 'Password must be at least 6 characters'),
    newPassword: yup
        .string()
        .required('New password is required')
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: yup
        .string()
        .required('Confirm password is required')
        .oneOf([yup.ref('newPassword')], 'Passwords must match')
});

const Profile: React.FC<ProfileProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
    const [passwordShow, setPasswordShow] = useState(false);
    const [passwordShow2, setPasswordShow2] = useState(false);
    const { user } = useAuth();
    const { fetchData } = useAxios();
    const queryClient = useQueryClient();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register: registerProfile,
        handleSubmit: profileUpdateSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: user?.name || '',
            username: user?.username || ''
        },
        resolver: yupResolver(profileUpdateSchema)
    })

    const handleClosePage = () => {
        onClose();
        setTimeout(() => {
            setActiveTab('profile');
            setPasswordShow(false);
            setPasswordShow2(false);
            setPreviewImage(null);
            setSelectedFile(null);
        }, 300)
    }

    const handleProfileUpdate = async (data: profileUpdateValues) => {
        mutation.mutate(data);
    };


    const mutation = useMutation({
        mutationKey: ["UPDATE_PROFILE"],
        mutationFn: async (data: profileUpdateValues) => await fetchData({
            method: 'PUT',
            url: '/api/user/update-profile',
            data
        }),
        onSuccess: (data) => {
            const { success, message } = handleResponse(data);
            if (success && message == "Profile updated successfully") {
                queryClient.invalidateQueries({ queryKey: ['USER'] });
                toast.success(message);
                handleClosePage();
            } else {
                toast.error(message);
            }
        },
        onError: (error: any) => {
            const { message } = handleResponse(error);
            toast.error(message);
        }
    })

    const {
        register: registerPassword,
        handleSubmit: passwordUpdateSubmit,
        formState: { errors: passwordErrors },
    } = useForm<PasswordUpdateValues>({
        resolver: yupResolver(passwordUpdateSchema)
    });

    const passwordMutation = useMutation({
        mutationKey: ["CHANGE_PASSWORD"],
        mutationFn: async (data: PasswordUpdateValues) => await fetchData({
            method: 'PUT',
            url: '/api/user/change-password',
            data: {
                oldPassword: data.oldPassword,
                newPassword: data.newPassword
            }
        }),
        onSuccess: (data) => {
            const { success, message } = handleResponse(data);
            if (success && message == "Password changed successfully") {
                toast.success(message);
                handleClosePage();
            } else {
                toast.error(message);
            }
        },
        onError: (error: any) => {
            const { message } = handleResponse(error);
            toast.error(message);
        }
    });

    const handlePasswordUpdate = async (data: PasswordUpdateValues) => {
        passwordMutation.mutate(data);
    };


    // handle Image File Upload
    const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {

            const file = e.target.files?.[0];

            if (!file) {
                throw new Error("No file selected");
            }

            const imageType = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"];

            if (!imageType.includes(file.type)) {
                throw new Error("Only JPEG, PNG, GIF, WEBP, and JPG images are allowed");
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error("Image size should not exceed 5MB");
            }

            e.target.value = '';
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload image');
        }
    }

    /// upload image to server using axios and FormData
    const fetchImageData = async (file: File) => {
        if (!file) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('profile_image', file);

            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/upload-profile`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true,
                timeout: 10000,
                timeoutErrorMessage: 'Request timed out',
            });

            if (response.data.message === "Profile image updated successfully") {
                queryClient.invalidateQueries({ queryKey: ['USER'] });
                toast.success(response.data.message);
                setPreviewImage(null);
                setSelectedFile(null);
                // handleClosePage();
            }

        } catch (error: any) {
            console.log(error);
            const { message } = handleResponse(error);
            toast.error(message || 'Failed to upload image');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className={`fixed top-0 right-0 w-full h-screen bg-[#00000067] backdrop:blur-2xl ${isOpen ? 'block' : 'hidden'} z-40`} onClick={handleClosePage}></div>
            <div className={`fixed top-0 right-0 w-full sm:w-[400px] h-screen bg-[var(--bg-primary)] shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}>
                {/* Header */}
                <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Profile Settings</h2>
                    <button
                        onClick={handleClosePage}
                        className="p-2 cursor-pointer hover:bg-[var(--bg-secondary)] rounded-full"
                    >
                        <IoClose className="text-[var(--text-secondary)] text-2xl" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex select-none">
                    <button
                        className={`flex-1 py-3 cursor-pointer text-sm font-semibold border-b-2 border-[var(--border-primary)] ${activeTab === 'profile' ? 'text-[var(--btn-primary)] border-[var(--btn-primary)]' : 'text-[var(--text-secondary)]'}`}
                        onClick={() => setActiveTab('profile')}>
                        Profile Details
                    </button>
                    <button
                        className={`flex-1 py-3 cursor-pointer text-sm font-semibold border-b-2 border-[var(--border-primary)] ${activeTab === 'password' ? 'text-[var(--btn-primary)] border-[var(--btn-primary)]' : 'text-[var(--text-secondary)]'}`}
                        onClick={() => setActiveTab('password')}>
                        Change Password
                    </button>
                </div>

                {/* Content */}

                <div className="p-4">
                    {activeTab === 'profile' ? (
                        <>
                            {/* Profile Image */}
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    {
                                        previewImage || user?.profile ? (
                                            <div className="w-24 h-24 rounded-full overflow-hidden">
                                                <img src={previewImage || user?.profile?.image_url} alt="Profile" className="w-full h-full object-cover" />
                                            </div>

                                        ) : <div className="w-20 h-20 flex border border-[var(--border-primary)] items-center justify-center rounded-full overflow-hidden">
                                            <FaUser size={40} className="text-[var(--text-secondary)]" />
                                        </div>
                                    }
                                    <label className="absolute bottom-0 right-0 p-2 bg-[var(--btn-primary)] rounded-full cursor-pointer hover:bg-[var(--btn-secondary)]">
                                        <FaCamera className="text-white" />
                                        <input
                                            type="file"
                                            onChange={handleImageFileUpload}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </label>
                                </div>
                            </div>

                            {
                                previewImage && (
                                    <div className="flex gap-2 justify-center mt-4 mb-5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPreviewImage(null);
                                                setSelectedFile(null);
                                            }}
                                            className="px-3 py-1.5 cursor-pointer text-sm font-medium text-red-500 border border-red-500 rounded-md hover:bg-red-50">
                                            Remove
                                        </button>
                                        <button
                                            disabled={!selectedFile || isLoading}
                                            type="button"
                                            onClick={() => fetchImageData(selectedFile!)}
                                            className="px-3 py-1.5 cursor-pointer text-sm font-medium text-white bg-[var(--btn-primary)] rounded-md hover:bg-[var(--btn-secondary)]">
                                            {isLoading ? <span className="ml-2">Uploading...</span> : 'Upload'}
                                        </button>
                                    </div>
                                )
                            }

                            <form onSubmit={profileUpdateSubmit(handleProfileUpdate)}>
                                <div className="input_wrapper">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        {...registerProfile('name')}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="error_message -mt-2">{errors.name.message}</p>
                                )}

                                <div className="input_wrapper">
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        {...registerProfile('username')}
                                    />
                                </div>
                                {errors.username && (
                                    <p className="error_message -mt-2">{errors.username.message}</p>
                                )}

                                <div className="input_wrapper">
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        defaultValue={user?.email}
                                        readOnly
                                        disabled
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-4"
                                    isLoading={mutation.isPending}
                                >
                                    Update Profile
                                </Button>
                            </form>
                        </>
                    ) : (
                        <form onSubmit={passwordUpdateSubmit(handlePasswordUpdate)}>
                            <div className="input_wrapper relative">
                                <input
                                    type={passwordShow ? 'text' : 'password'}
                                    placeholder='Enter Current Password'
                                    autoComplete='off'
                                    {...registerPassword('oldPassword')}
                                />
                                {
                                    passwordShow ? (
                                        <span onClick={() => setPasswordShow(prev => !prev)} className='absolute text-md right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-[var(--bg-secondary)] p-2 rounded-full'><FaEyeSlash /></span>
                                    ) : (
                                        <span onClick={() => setPasswordShow(prev => !prev)} className='absolute text-md right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-[var(--bg-secondary)] p-2 rounded-full'><FaEye /></span>
                                    )
                                }
                            </div>
                            {passwordErrors.oldPassword && (
                                <p className="error_message">{passwordErrors.oldPassword.message}</p>
                            )}

                            <div className="input_wrapper relative">
                                <input
                                    type={passwordShow2 ? 'text' : 'password'}
                                    placeholder='Enter New Password'
                                    autoComplete='off'
                                    {...registerPassword('newPassword')}
                                />
                                {
                                    passwordShow2 ? (
                                        <span onClick={() => setPasswordShow2(prev => !prev)} className='absolute text-md right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-[var(--bg-secondary)] p-2 rounded-full'><FaEyeSlash /></span>
                                    ) : (
                                        <span onClick={() => setPasswordShow2(prev => !prev)} className='absolute text-md right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-[var(--bg-secondary)] p-2 rounded-full'><FaEye /></span>
                                    )
                                }
                            </div>
                            {passwordErrors.newPassword && (
                                <p className="error_message">{passwordErrors.newPassword.message}</p>
                            )}
                            <div className="input_wrapper relative">
                                <input
                                    type={passwordShow2 ? 'text' : 'password'}
                                    placeholder='Confirm New Password'
                                    autoComplete='off'
                                    {...registerPassword('confirmPassword')}
                                />
                                {
                                    passwordShow2 ? (
                                        <span onClick={() => setPasswordShow2(prev => !prev)} className='absolute text-md right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-[var(--bg-secondary)] p-2 rounded-full'><FaEyeSlash /></span>
                                    ) : (
                                        <span onClick={() => setPasswordShow2(prev => !prev)} className='absolute text-md right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-[var(--bg-secondary)] p-2 rounded-full'><FaEye /></span>
                                    )
                                }
                            </div>
                            {passwordErrors.confirmPassword && (
                                <p className="error_message">{passwordErrors.confirmPassword.message}</p>
                            )}
                            <Button
                                type="submit"
                                className="mt-4"
                                isLoading={passwordMutation.isPending}
                            >
                                Update Password
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </>
    )
}

export default Profile
