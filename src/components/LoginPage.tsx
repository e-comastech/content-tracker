import React, { useEffect } from 'react';
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
  exp: number;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { setUser } = useUser();

  useEffect(() => {
    // Check for existing credential
    const credential = localStorage.getItem('googleCredential');
    if (credential) {
      try {
        const payload = jwtDecode<GoogleJwtPayload>(credential);
        // Check if the token is not expired
        if (payload.exp * 1000 > Date.now()) {
          setUser({
            firstName: decodeURIComponent(escape(payload.given_name)),
            email: payload.email,
            picture: payload.picture,
            lastLogin: new Date()
          });
          onLogin();
          return;
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
      // If token is expired or invalid, remove it
      localStorage.removeItem('googleCredential');
    }
  }, [setUser, onLogin]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 dark:bg-[#1a1a1a]">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-[#2d2d2d] p-10 rounded-xl shadow-lg">
        <div>
          <img
            src="/cct-logo.png"
            alt="Content Comparison Tool"
            className="mx-auto h-24 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Use your Google account to access the Content Comparison Tool
          </p>
        </div>
        
        <div className="mt-8 flex justify-center">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                try {
                  const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential);
                  setUser({
                    firstName: decodeURIComponent(escape(decoded.given_name)),
                    email: decoded.email,
                    picture: decoded.picture,
                    lastLogin: new Date()
                  });
                  localStorage.setItem('googleCredential', credentialResponse.credential);
                  onLogin();
                } catch (error) {
                  console.error('Error processing login:', error);
                }
              }
            }}
            onError={() => {
              console.error('Login Failed');
            }}
            useOneTap
            type="standard"
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            logo_alignment="left"
          />
        </div>
      </div>
    </div>
  );
}; 