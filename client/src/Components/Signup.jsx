import React, { useState, useEffect } from 'react';
import { FaGithub } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Check for session data and redirect if necessary
    useEffect(() => {
        const sessionToken = sessionStorage.getItem('sessionToken');
        const storedUserDetails = sessionStorage.getItem('userDetails');
      
        if (sessionToken && storedUserDetails && !window.location.pathname.includes('/input')) { // Only navigate if not already on /input
          navigate('/input');
        }
      }, [navigate]); // Ensure it only runs once on mount
    const handleSaveData = async (userDetails) => {
        try {
            setIsLoading(true);
            const response = await axios.post("http://localhost:3001/api/signup", { userDetails });
            if (response.data) {
                // Save session data
                sessionStorage.setItem('sessionToken', userDetails.email);
                sessionStorage.setItem('userDetails', JSON.stringify(userDetails));

                // Redirect to /input after successful login
                navigate('/input');
                console.log("navigated  ")
            }
        } catch (error) {
            console.error('Error saving data:', error);
            setErrorMessage('Failed to save user data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTokenValidation = async (idToken) => {
        try {
            setIsLoading(true);
            setErrorMessage('');
            const response = await axios.post("http://localhost:3001/api/verifyToken", { idToken });

            if (response.data.success) {
                setUserDetails(response.data.userDetails);
                await handleSaveData(response.data.userDetails);
            } else {
                setErrorMessage('Google authentication failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during token validation:', error);
            setErrorMessage('An error occurred during the validation process.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex flex-col justify-center items-center bg-slate-800 h-screen w-full'>
            <div className="flex flex-col items-center justify-center w-full max-w-md p-8 bg-slate-700 rounded-xl shadow-2xl">
                <h1 className="text-4xl font-bold text-white mb-2">Codegen</h1>
                <p className="text-gray-400 mb-8 text-center">
                    Generate production-ready code in seconds. From idea to implementation.
                </p>

                <div className="w-full space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <>
                            <GoogleLogin
                                onSuccess={(credentialResponse) => {
                                    const idToken = credentialResponse.credential;
                                    handleTokenValidation(idToken);
                                }}
                                onError={() => {
                                    setErrorMessage('Authentication failed');
                                }}
                                className="w-full"
                            />

                            
                        </>
                    )}
                </div>

                {errorMessage && (
                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                        <p className="text-red-200 text-sm text-center">{errorMessage}</p>
                    </div>
                )}

              
            </div>
        </div>
    );
};

export default Signup;
