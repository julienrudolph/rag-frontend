import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from 'react-oidc-context'

const config = {
  authority: "https://sts.cducsu.de/adfs", // Ersetze durch deine ADFS-URL
  client_id: "", // Ersetze durch deine Client-ID
  redirect_uri: "https://rag-ui.service.cducsu.local", // Muss mit der ADFS-Registrierung übereinstimmen
  response_type: "code", // Code-Flow für sichere Authentifizierung
  scope: "openid profile email", // Gewünschte Scopes
  post_logout_redirect_uri: "http://localhost:3000/",
};

export default function Login() {
  return (
    <AuthProvider {...config}>
      <StrictMode>
        <App/>
      </StrictMode>
    </AuthProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><Login/></StrictMode>
)

