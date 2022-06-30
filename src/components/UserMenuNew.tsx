import {
  AlertButton,
  AlertOptions,
  IonBadge,
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  useIonAlert,
} from "@ionic/react";
import { HookOverlayOptions } from "@ionic/react/dist/types/hooks/HookOverlayOptions";
import React, { useEffect, useState } from "react";
import { fetchUser, signIn as authSignIn, signOut } from "../utils/auth";
import { User } from "../utils/User";

import styles from "./UserMenu.module.css";

const UserMenu: React.FC = () => {
  const [userInfo, setUserInfo] = useState<User>({});
  const [user, setUser] = useState<User>();

  const [presentAlert] = useIonAlert();

  useEffect(() => {
    async function fetchAndSetUserInfo() {
      const u = await fetchUser();
      setUser(u);
    }
    fetchAndSetUserInfo();
  }, []);

  const inputs = [
    { name: "username", label: "Username", type: "text", require: true },
    { name: "password", label: "Password", type: "password", require: true },
  ];

  return (
    <IonContent className={styles["main-container"]}>
      {user ? renderUserInfo() : renderUserLogin()}
    </IonContent>
  );

  function renderUserInfo() {
    return (
      <>
        <IonText>
          <h1>
            {user?.username}
            &nbsp;
            <IonBadge>{user?.roleName}</IonBadge>
          </h1>
        </IonText>
        <IonButton expand="block" fill="clear" onClick={() => signOut()}>
          Sign Out
        </IonButton>
      </>
    );
  }

  function renderUserLogin() {
    return (
      <>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            signIn(userInfo, presentAlert, setUserInfo);
          }}
        >
          {inputs.map((input, i) => (
            <IonItem key={i}>
              <IonLabel position="floating">{input.label}</IonLabel>
              <IonInput
                type={input.type as any} // TODO use specific type
                name={input.name}
                required={input.require}
                onIonChange={async ({ detail }) =>
                  input.name === "password"
                    ? (userInfo.authenticationHash = await digestText(
                        detail.value?.toString()
                      ))
                    : ((userInfo as any)[input.name] = detail.value)
                }
              ></IonInput>
            </IonItem>
          ))}
          <IonButton type="submit" expand="block">
            Sign in
          </IonButton>
        </form>
      </>
    );
  }

  async function signIn(
    userInfo: User,
    presentAlert: {
      (message: string, buttons?: AlertButton[] | undefined): void;
      (options: AlertOptions & HookOverlayOptions): void;
    },
    setUserInfo: (userInfo: User) => void
  ) {
    if (await authSignIn(userInfo)) {
      window.location.reload();
    } else {
      presentAlert("Fail to sign in.", [{ text: "OK" }]);
      setUserInfo({});
    }
  }

  async function digestText(text?: string) {
    if (text !== undefined) {
      const msgUint8 = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return hashHex;
    }
  }
};

export default UserMenu;
