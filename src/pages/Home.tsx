import { AlertOptions } from '@ionic/core';
import { AlertButton, IonButton, IonCard, IonCardContent, IonCardHeader, IonContent, IonImg, IonInput, IonItem, IonLabel, IonPage, useIonAlert } from '@ionic/react';
import { HookOverlayOptions } from '@ionic/react/dist/types/hooks/HookOverlayOptions';
import { History } from 'history';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import ServerInfo from '../utils/ServerInfo';
import { User } from '../utils/User';

import styles from './Home.module.css';

const Home: React.FC = () => {
  const history = useHistory();
  const [userInfo, setUserInfo] = useState<User>({});
  const [presentAlert] = useIonAlert();

  const inputs = [
    { name: 'username', label: 'Username', type: 'text', require: true },
    { name: 'password', label: 'Password', type: 'password', require: true },
  ];

  useEffect(() => {
    async function redirectIfAlreadySignedIn() {
      const response = await fetch(
        `${ServerInfo.SERVER_BASE_URL}/user/me`,
        { credentials: 'include' }
      );
      if (response.ok && (await response.json())._id) {
        history.push('/review');
      }
    }
    redirectIfAlreadySignedIn();
  }, [history]);

  return (
    <IonPage>
      <IonContent>
        <IonCard id={styles.card}>
          <IonCardContent>
            <IonCardHeader>
              <IonImg src="/assets/icon/icon.png"></IonImg>
              <h1>EPA Review</h1>
            </IonCardHeader>
            <form onSubmit={event => {
              event.preventDefault();
              signIn(userInfo, history, presentAlert, setUserInfo);
            }}>
              {
                inputs.map((input, i) => (
                  <IonItem key={i}>
                    <IonLabel position="floating">{input.label}</IonLabel>
                    <IonInput
                      type={input.type as any} // TODO use specific type
                      name={input.name}
                      required={input.require}
                      onIonChange={
                        async ({ detail }) => input.name === 'password' ?
                          userInfo.authenticationHash = await digestText(detail.value?.toString()) :
                          (userInfo as any)[input.name] = detail.value
                      }
                    ></IonInput>
                  </IonItem>
                ))
              }
              <IonButton
                type="submit"
                expand="block"
              >Sign in</IonButton>
            </form>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage >
  );
};

export default Home;

async function signIn(
  userInfo: User,
  history: History,
  presentAlert: { (message: string, buttons?: AlertButton[] | undefined): void; (options: AlertOptions & HookOverlayOptions): void; },
  setUserInfo: (userInfo: User) => void
) {
  const response = await fetch(
    `${ServerInfo.SERVER_BASE_URL}/authentication/sign-in`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        username: userInfo.username,
        authenticationHash: userInfo.authenticationHash
      })
    }
  );
  if (response.ok) {
    history.push('/review');
  } else {
    presentAlert('Fail to sign in.', [{ text: 'OK' }]);
    setUserInfo({});
  }
}

async function digestText(text?: string) {
  if (text !== undefined) {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
}
