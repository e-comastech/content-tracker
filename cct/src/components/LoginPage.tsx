import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useUser } from '../contexts/UserContext';

interface LoginPageProps {
  onLogin: () => void;
}

interface GoogleJwtPayload {
  email: string;
  given_name: string;
  picture?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { setUser } = useUser();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <img
            src="/logo.png"
            alt="Content Comparison Tool"
            className="mx-auto h-24 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use your Google account to access the Content Comparison Tool
          </p>
        </div>
        
        <div className="mt-8 flex justify-center">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential);
                setUser({
                  firstName: decoded.given_name,
                  email: decoded.email,
                  picture: decoded.picture,
                  lastLogin: new Date()
                });
                onLogin();
              }
            }}
            onError={() => {
              console.error('Login Failed');
            }}
          />
        </div>
      </div>
    </div>
  );
}; 