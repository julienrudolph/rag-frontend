import React, { StrictMode, useEffect, useState } from "react";
import { signIn, signOut, getUser, handleCallback } from "./oidc/OidcClient";
import App from "./App";

const Main: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processAuth = async () => {
      if (window.location.search.includes("code=")) {
        // Falls ein Code in der URL ist, führe das Callback-Handling aus
        await handleCallback();
        window.history.replaceState({}, document.title, window.location.pathname); // Entfernt den Code aus der URL
      }

      const currentUser = await getUser();
      setUser(currentUser);
      setLoading(false);
    };

    processAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.profile.name}</h1>
          <button onClick={signOut}>Logout</button>
          <StrictMode>
            <App />
          </StrictMode>
        </div>
      ) : (
        <div>
          <h1>Please log in</h1>
          <button onClick={signIn}>Login with ADFS</button>
        </div>
      )}
    </div>
  );
};

export default Main;
