import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import Chat from './pages/Chat';
import Messages from './pages/Message';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import Loader from './components/Loader';
import ProtectedRoute from './layout/ProtectedRoute';

const App = () => {

   const queryClient = new QueryClient()

   return (
      <BrowserRouter>
         <QueryClientProvider client={queryClient}>
            <Suspense fallback={<Loader />}>
               <Routes>
                  <Route path='/' element={<ProtectedRoute>
                     <Chat />
                  </ProtectedRoute>} />
                  <Route path='/chat' element={<ProtectedRoute>
                     <Chat />
                  </ProtectedRoute>} />
                  <Route path='/chat/:id' element={<ProtectedRoute>
                     <Messages />
                  </ProtectedRoute>} />
                  <Route path='/signup' element={<Signup />} />
                  <Route path='/login' element={<Login />} />
                  <Route path='/load' element={<Loader />} />
               </Routes>
            </Suspense>
         </QueryClientProvider>
      </BrowserRouter>
   )
}

export default App

