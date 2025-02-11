import { UserManager, WebStorageStateStore, User } from "oidc-client-ts";
import { oidcConfig } from "../config/config_adfs";

const userManager = new UserManager({
  ...oidcConfig,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
});

export const signIn = async () => {
  try {
    await userManager.signinRedirect(); // Weiterleitung zu ADFS
  } catch (error) {
    console.error("Sign-in failed", error);
  }
};

export const signOut = async () => {
  try {
    await userManager.signoutRedirect(); // Weiterleitung zur ADFS-Logout-Seite
  } catch (error) {
    console.error("Sign-out failed", error);
  }
};

export const handleCallback = async () => {
  try {
    const user: User | null = await userManager.signinRedirectCallback();
    return user;
  } catch (error) {
    console.error("Error handling callback", error);
  }
};

export const getUser = async () => {
  try {
    return await userManager.getUser();
  } catch (error) {
    console.error("Error getting user", error);
  }
};
