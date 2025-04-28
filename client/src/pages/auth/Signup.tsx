import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../../components/Button';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { handleResponse } from '../../services/error';
import { useMutation } from '@tanstack/react-query';
import { useAxios } from '../../hook/useAxios';

interface FormValues {
    name: string;
    email: string;
    username: string;
    password: string;
    confirm_password: string;
}

interface ErrorResponse {
    success: boolean
    message: string
    statusCode?: number | string,
    data?: any
}


const signupSchema = yup.object().shape({
    name: yup.string().required('Full name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirm_password: yup.string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
});

const Signup: React.FC = () => {
    const [passwordShow, setPasswordShow] = useState<boolean>(false);
    const { fetchData } = useAxios();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: yupResolver(signupSchema)
    });

    const mutation = useMutation({
        mutationKey: ["SIGNUP"],
        mutationFn: async (data: FormValues) => await fetchData({
            method: 'POST',
            url: '/api/auth/signup',
            data
        }),
        onSuccess: (data) => {
            const { success, message } = handleResponse(data);
            if (success && message == "Account created successfully") {
                toast.success(message);
                navigate('/', { replace: true });
            } else {
                toast.error(message);
            }
        },
        onError: (error: any) => {
            console.log(error);
            if (error?.response?.data) {
                const { message } = handleResponse(error.response.data as ErrorResponse);
                toast.error(message);
            } else {
                toast.error(error?.message || 'Something went wrong');
            }
        }
    });

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        mutation.mutate(data);
    };

    return (
        <div className='w-full min-h-screen flex items-center flex-col justify-center bg-[var(--bg-secondary)]'>
            <div className='w-[93%] max-w-md py-6 px-4 bg-[var(--bg-primary)] rounded-md shadow-sm border border-[var(--border-primary)]'>
                <h2 className='text-xl font-bold text-[var(--text-primary)] mb-6 text-center'>Signup</h2>
                <form onSubmit={handleSubmit(onSubmit)} method="post">
                    <div className="input_wrapper">
                        <input
                            type="text"
                            {...register('name')}
                            placeholder='Enter Full Name'
                            autoComplete='off'
                        />
                    </div>
                    {errors.name && (
                        <p className="error_message -mt-2">{errors.name.message}</p>
                    )}

                    <div className="input_wrapper">
                        <input
                            type="text"
                            {...register('username')}
                            placeholder='Enter Username'
                            autoComplete='off'
                        />
                    </div>
                    {errors.username && (
                        <p className="error_message -mt-2">{errors.username.message}</p>
                    )}

                    <div className="input_wrapper">
                        <input
                            type="email"
                            {...register('email')}
                            placeholder='Enter Email'
                            autoComplete='off'
                        />
                    </div>
                    {errors.email && (
                        <p className="error_message -mt-2">{errors.email.message}</p>
                    )}

                    <div className="input_wrapper relative">
                        <input
                            type={passwordShow ? 'text' : 'password'}
                            {...register('password')}
                            placeholder='Enter Password'
                            autoComplete='off'
                        />
                        {
                            passwordShow ? (
                                <span onClick={() => setPasswordShow(prev => !prev)} className='absolute text-md right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-[var(--bg-secondary)] p-2 rounded-full'><FaEyeSlash /></span>
                            ) : (
                                <span onClick={() => setPasswordShow(prev => !prev)} className='absolute text-md right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-[var(--bg-secondary)] p-2 rounded-full'><FaEye /></span>
                            )
                        }
                    </div>
                    {errors.password && (
                        <p className="error_message -mt-2">{errors.password.message}</p>
                    )}

                    <div className="input_wrapper relative">
                        <input
                            type={passwordShow ? 'text' : 'password'}
                            {...register('confirm_password')}
                            placeholder='Confirm Password'
                            autoComplete='off'
                        />
                        {
                            passwordShow ? (
                                <span onClick={() => setPasswordShow(prev => !prev)} className='absolute text-md right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-[var(--bg-secondary)] p-2 rounded-full'><FaEyeSlash /></span>
                            ) : (
                                <span onClick={() => setPasswordShow(prev => !prev)} className='absolute text-md right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-[var(--bg-secondary)] p-2 rounded-full'><FaEye /></span>
                            )
                        }
                    </div>
                    {errors.confirm_password && (
                        <p className="error_message -mt-2">{errors.confirm_password.message}</p>
                    )}

                    <Button
                        type="submit"
                        className='mt-2'
                        isLoading={mutation.isPending}
                    >
                        Create Account
                    </Button>
                    <p className='text-sm text-center font-semibold mt-2'>Already have an account? <Link to='/login' className='text-[var(--btn-primary)]'>Login</Link></p>
                </form>
            </div>
        </div>
    );
};

export default Signup
