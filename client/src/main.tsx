import { createRoot } from 'react-dom/client';
import './index.css'
import App from './App.tsx'
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
   <>
      <Toaster
         position="top-right"
         reverseOrder={false}
         toastOptions={{
            style: {
               borderRadius: '10px',
               background: '#333',
               color: '#fff',
               fontSize: '13px',
               fontFamily: 'var(--font1)',
            },
         }}
      />
      <App />
   </>,
)
