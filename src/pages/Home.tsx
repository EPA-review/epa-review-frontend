import { IonButton, IonButtons, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import { useEffect, useState } from 'react';

import './Home.css';

const Home: React.FC = () => {
  const [roles, setRoles] = useState<string[]>();

  useEffect(() => {
    async function obtainRoles() {
      // TODO move the API path into a config file
      const response = await fetch('/api/role');
      setRoles((await response.json() as any[])?.map(role => role.name));
    }
    obtainRoles();
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonCard id="sign-in-card">
          <IonCardContent>
            <h1>EPA Review</h1>
            <h3>The below list is only for test getting data from the backend.</h3>
            {
              roles?.map((role, i) => (
                <div key={i}>
                  <IonLabel>{role}</IonLabel>
                </div>
              ))
            }
            <hr/>
            <IonItem>
              <IonLabel position="floating">Username</IonLabel>
              <IonInput type="text"></IonInput>
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Password</IonLabel>
              <IonInput type="password"></IonInput>
            </IonItem>
            <IonButton expand="block" routerLink="/review">Sign In</IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage >
  );
};

export default Home;
