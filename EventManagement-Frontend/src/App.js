import React, { useEffect, useState } from 'react';
import EventList from './components/EventList';
import { jwtDecode } from "jwt-decode";
import Box from "@mui/material/Box";
import NavBar from './components/NavBar';

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [googleScriptError, setGoogleScriptError] = useState(false);
  useEffect(() => {
    const initializeGoogleSignIn = async () => {
      try {
        /*global google */
        google.accounts.id.initialize({
          client_id: '518685472049-v6tuegmek7ec7j0c683atrm59r0pneri.apps.googleusercontent.com',
          callback: handleCallbackResp
        });

        // Render the sign-in button
        google.accounts.id.renderButton(
          document.getElementById("signInDiv"),
          { theme: 'outline', size: 'large' }
        );
      } catch (error) {
        console.error("Error loading Google API:", error);
        setGoogleScriptError(true);
      }
    };

    initializeGoogleSignIn();
  }, [isSignedIn]);

  const handleCallbackResp = (resp) => {
    console.log("Encoded JWT token: ", resp.credential);
    const userObject = jwtDecode(resp.credential, { header: true });
    console.log("User Object: ", userObject);
    alert('Login successfull !');
    setIsSignedIn(true);
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setGoogleScriptError(false);
    alert('You have successfully logged out!');
  };



  return (
    <div >
      {
        !isSignedIn &&
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '35rem',
            padding: '4.5rem',
            boxSizing: 'border-box',
            border: '1px solid #dadce0',
            borderRadius: '8px',
          }}
        >
          <h2 style={{ textAlign: 'center' }}>Sign in</h2>
          <p style={{ textAlign: 'center' }}>Use your Google Account</p>
          <div id="signInDiv" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}></div>
        </Box>
      }
      {isSignedIn ? (
        <div>
          <NavBar handleSignOut={handleSignOut} />
          <EventList />
        </div>
      ) : null}
      {googleScriptError && alert("Error loading Google API. Please check your network connection and try again.")}
    </div>
  );
};

export default App;
