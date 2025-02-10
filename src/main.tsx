import { StrictMode, useContext } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthContext, AuthProvider, type IAuthContext, type TAuthConfig } from 'react-oauth2-code-pkce'

const authConfig = {
  clientId: import.meta.env.VITE_CLIENTID,
  authorizationEndpoint: import.meta.env.VITE_AUTHENDPOINT,
  tokenEndpoint: import.meta.env.VITE_ADFS_TOKENENDPOINT,
  redirectUri: import.meta.env.VITE_ADFS_REDIRECTURI,
  scope: import.meta.env.VITE_ADFS_SCOPE,
  autoLogin: true,
  decodeToken: true,
}

function LoginInfo(): JSX.Element {
  const { tokenData, token, logOut, idToken, error, logIn }: IAuthContext = useContext(AuthContext)

  if (error) {
    return (
      <>
        <div style={{ color: 'red' }}>An error occurred during authentication: {error}</div>
        <button type='button' onClick={() => logOut()}>
          Log out
        </button>
      </>
    )
  }
  return (
    <>
      {token ? (
        <div>
          <App />
        </div>  
      ):(
        <div>
          <p>Please login to continue</p>
          <button type='button' style={{ width: '100px' }} onClick={() => logIn()}>
            Log in
          </button>
        </div>
      )}
    </>
  );
}


createRoot(document.getElementById('root')!).render(
  <div>
    <AuthProvider authConfig={authConfig}>
      <StrictMode>
        <LoginInfo/>
      </StrictMode>
    </AuthProvider>
  </div>
)
