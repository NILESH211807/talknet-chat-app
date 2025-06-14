import { useQuery } from '@tanstack/react-query';
import { createContext, useContext } from 'react'
import { useAxios } from '../hook/useAxios';

export interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    token: string;
    profile: { image_url: string, public_id: string } | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { fetchData } = useAxios();

    const { data, isPending } = useQuery({
        queryKey: ['USER'],
        queryFn: async () => await fetchData({
            method: 'GET',
            url: '/api/user/profile'
        }),
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
    })

    const values = {
        user: data?.data || null,
        loading: isPending,
    };


    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export default AuthContext;