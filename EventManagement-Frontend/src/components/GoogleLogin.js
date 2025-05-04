import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { FaGoogle } from 'react-icons/fa';

const clientId = '520400660725-07tsjfcrta8eb12vvee8fmdvd58u3dq7.apps.googleusercontent.com';

const GoogleLoginComponent = () => {
    const onSuccess = (response) => {
        alert('Login Successful !');
    };

    const onFailure = (error) => {
        alert('Login failed !');
    };

    return (
        <div>
            <h1>Event Management</h1>
            <GoogleLogin
                clientId={clientId}
                buttonText="Login with Google"
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy="single_host_origin"
                render={(renderProps) => (
                    <button type="button" onClick={renderProps.onClick} className="google-login-btn">
                        <FaGoogle size={24} /> Sign in with Google
                    </button>
                )}
            />
        </div>
    );
};

export default GoogleLoginComponent;