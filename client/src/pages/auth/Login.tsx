import React from 'react';
import * as yup from 'yup';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '../../components/Button';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAxios } from '../../hook/useAxios';
import { handleResponse } from '../../services/error';
import toast from 'react-hot-toast';

interface loginValues {
    email: string,
    password: string
}

const loginSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Login: React.FC = () => {
    const [passwordShow, setPasswordShow] = React.useState<boolean>(false);
    const { fetchData } = useAxios();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors },
    } = useForm<loginValues>({
        resolver: yupResolver(loginSchema)
    });

    const mutation = useMutation({
        mutationKey: ["LOGIN"],
        mutationFn: async (data: loginValues) => await fetchData({
            method: 'POST',
            url: '/api/auth/login',
            data
        }),
        onSuccess: (data) => {
            const { success, message } = handleResponse(data);
            if (success && message == "Login successful") {
                toast.success(message);
                navigate('/', { replace: true });
            } else {
                toast.error(message);
            }
        },
        onError: (error: any) => {
            const { message } = handleResponse(error);
            toast.error(message || 'Something went wrong');
        }
    })

    const onSubmit: SubmitHandler<loginValues> = async (data) => {
        mutation.mutate(data);
    }


    return (
        <div className='w-full min-h-screen flex items-center flex-col justify-center bg-[var(--bg-secondary)]'>
            <div className='w-[93%] max-w-md py-6 px-4 bg-[var(--bg-primary)] rounded-md shadow-sm border border-[var(--border-primary)]'>
                <h2 className='text-xl font-bold text-[var(--text-primary)] mb-6 text-center'>Login</h2>
                <form onSubmit={handleSubmit(onSubmit)} method="post">
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

                    <Button
                        type="submit"
                        className='mt-2'
                        isLoading={mutation.isPending}>
                        Login
                    </Button>


                    {/* test login credentials */}
                    <p className='text-sm text-left font-semibold mt-2 mb-3 w-full'>Test Login Credentials</p>
                    <div className='w-full bg-gray-100 px-5 py-2 rounded-md'>
                        <p className='text-sm text-left font-semibold'>Email: test@test.com</p>
                        <p className='text-sm text-left font-semibold'>Password: test@123</p>
                    </div>

                    <p className='text-sm text-center font-semibold mt-2'>Don't have an account? <Link to='/signup' className='text-[var(--btn-primary)]'>Signup</Link></p>
                </form>
            </div>
        </div>
    )
}

export default Login
