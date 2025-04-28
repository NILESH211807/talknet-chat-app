// hooks/useAxios.ts
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface AxiosOptions<T = unknown> {
    method: Method;
    url: string;
    data?: T;
    params?: Record<string, any>;
}

export const useAxios = <Response = any, Request = any>() => {
    const navigate = useNavigate();
    const fetchData = async ({ method, url, data, params }: AxiosOptions<Request>) => {
        try {
            const res = await axiosInstance.request<Response>({
                method,
                url,
                data,
                params,
            });
            return res.data;
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Something went wrong';
            if (message == "Unauthorized. Please login.") {
                navigate('/login', { replace: true });
            }

            throw new Error(message);
        }
    };

    return { fetchData };
};
