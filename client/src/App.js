import './App.css';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <>
        <Toaster />
        <main>
          <Outlet />
        </main>
      </>
    </GoogleOAuthProvider>
  );
}

export default App;
