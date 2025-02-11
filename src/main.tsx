import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useEffect, useState } from "react";
import { User, UserManager, WebStorageStateStore } from "oidc-client-ts";

const config = {
  authority: "https://sts.cducsu.de/adfs", // ADFS Server URL
  client_id: "your-client-id", // Client-ID aus ADFS
  redirect_uri: "https://rag-ui.service.cducsu.local", // Callback-URL
  response_type: "code", // Authorization Code Flow
  scope: "openid profile email", // Angeforderte Scopes
  post_logout_redirect_uri: "https://rag-ui.service.cducsu.local", // Logout-Redirect
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

const userManager = new UserManager(config);

export default function Login() {
  const [user, setUser] = useState<User | null>(null);
  
    useEffect(() => {
      userManager.getUser().then((loadedUser) => {
        if (loadedUser) {
          setUser(loadedUser);
        }
      });
    }, []);
  
    const login = () => {
      userManager.signinRedirect();
    };
  
    const logout = () => {
      userManager.signoutRedirect();
    };
  
    return (
      <div className="p-4 text-center">
        {user ? (
          <div>
            <h2>Willkommen, {user.profile.name}</h2>
            <p>Email: {user.profile.email}</p>
            <button onClick={logout} className="bg-red-500 text-white p-2 rounded">
              Logout
            </button>
            <StrictMode>
              <App />
            </StrictMode>
          </div>
        ) : (
          <button onClick={login} className="bg-blue-500 text-white p-2 rounded">
            Login mit ADFS
          </button>
        )}
      </div>
    );


}

/*
createRoot(document.getElementById('root')!).render(
  <StrictMode><Login/></StrictMode>
)
*/

