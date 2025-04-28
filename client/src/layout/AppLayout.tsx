import React from 'react';
import { useAuth } from '../context/Auth'
import Loader from '../components/Loader';
import { ChatProvider } from '../context/Chats';

const AppLayout = ({ children }: { children: React.ReactNode }) => {

   const { loading } = useAuth();

   if (loading) {
      return <Loader />
   }

   return (
      <main>
         <ChatProvider>
            {children}
         </ChatProvider>
      </main>
   )
}

export default AppLayout
