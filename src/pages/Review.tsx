import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, useIonPopover } from '@ionic/react';
import { History } from 'history';
import { apps, person } from "ionicons/icons";
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import MainMenu from '../components/MainMenu';
import ServerInfo from '../utils/ServerInfo';
import { User } from '../utils/User';

const Review: React.FC = () => {
  const history = useHistory();
  const [userInfo, setUserInfo] = useState<User>({});
  const [presentPopover, dismiss] = useIonPopover(MainMenu, { onHide: () => dismiss() });

  useEffect(() => {
    async function obtainUser() {
      const response = await fetch(
        `${ServerInfo.ENDPOINT}/user/me`,
        { credentials: 'include' }
      );
      let user: User;
      if (response.ok && (user = await response.json())) {
        setUserInfo(user);
      } else {
        history.push('/home');
      }
    }
    obtainUser();
  }, [history]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              title="Main Menu"
              onClick={event => presentPopover({ event: event.nativeEvent })}
            >
              <IonIcon slot="icon-only" icon={apps}></IonIcon>
            </IonButton>
          </IonButtons>
          <IonTitle>EPA Review</IonTitle>
          <IonButtons slot="end">
            <IonButton
              title="Sign Out"
              onClick={() => signOut(history)}
            >
              <IonIcon slot="icon-only" icon={person} ></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <h1>Hello {userInfo.username}!</h1>
      </IonContent>
    </IonPage>
  );
};

export default Review;

async function signOut(
  history: History
) {
  await fetch(
    `${ServerInfo.ENDPOINT}/authentication/sign-out`,
    {
      method: 'POST',
      credentials: 'include'
    }
  );
  history.push('/home');
}
