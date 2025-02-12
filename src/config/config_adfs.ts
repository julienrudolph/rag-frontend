import {WebStorageStateStore } from "oidc-client-ts";

export const oidcConfig = {
    authority: "https://sts.cducsu.de/adfs", // ADFS Server URL
    client_id: "your-client-id", // Client-ID aus ADFS
    redirect_uri: "https://rag-ui.service.cducsu.local", // Callback-URL
    response_type: "code", // Authorization Code Flow
    scope: "openid profile email", // Angeforderte Scopes
    post_logout_redirect_uri: "https://rag-ui.service.cducsu.local", // Logout-Redirect
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    metadata: {
        authorization_endpoint: "https://sts.cducsu.de/adfs/oauth2/authorize",
        token_endpoint: "https://sts.cducsu.de/adfs/oauth2/token",
        userinfo_endpoint: "https://sts.cducsu.de/adfs/oauserinfo",

    }
};
