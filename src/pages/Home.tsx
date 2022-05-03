import { AlertOptions } from "@ionic/core";
import {
  AlertButton,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  useIonAlert,
} from "@ionic/react";
import { HookOverlayOptions } from "@ionic/react/dist/types/hooks/HookOverlayOptions";
import { useState } from "react";
import { signIn as authSignIn } from "../utils/auth";
import { User } from "../utils/User";

import styles from "./Home.module.css";

const Home: React.FC = () => {
  const [userInfo, setUserInfo] = useState<User>({});
  const [presentAlert] = useIonAlert();

  const inputs = [
    { name: "username", label: "Username", type: "text", require: true },
    { name: "password", label: "Password", type: "password", require: true },
  ];

  return (
    <IonPage>
      <IonContent>
        <IonCard id={styles.card}>
          <IonCardContent>
            <IonCardHeader>
              <h1>CBME EPA Review Project</h1>
            </IonCardHeader>
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
            <IonButton
              fill="outline"
              expand="block"
              href={`${process.env.PUBLIC_URL}/new`}
            >
              Use Local Mode
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Home;

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
