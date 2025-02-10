import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const config = {
  authority: "https://sts.cducsu.de/adfs", // Ersetze durch deine ADFS-URL
  client_id: "", // Ersetze durch deine Client-ID
  redirect_uri: "https://rag-ui.service.cducsu.local", // Muss mit der ADFS-Registrierung übereinstimmen
  response_type: "code", // Code-Flow für sichere Authentifizierung
  scope: "openid profile email", // Gewünschte Scopes
  post_logout_redirect_uri: "http://localhost:3000/",
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

const userManager = new UserManager(config);

function Login() {
  const [user, setState] = useState(null);

  useEffect(() => {
    userManager.getUser().then((loadedUser) => {
      if (loadedUser) {
        setState(loadedUser as any);
      }
    });
  }, []);

  const login = () => {
    userManager.signinRedirect();
  };

  return (
    <div>
      <h1>React ADFS OIDC Authentication</h1>
      {user ? (
        <div>
          <p>Welcome, {user}</p>
          <App/>
        </div>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><Login/></StrictMode>
)

