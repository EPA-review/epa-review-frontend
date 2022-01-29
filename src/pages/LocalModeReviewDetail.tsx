import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, useIonPopover } from '@ionic/react';
import { apps, person } from "ionicons/icons";
import { useState } from 'react';
import MainMenu from '../components/MainMenu';

const LocalModeReviewDetail: React.FC = () => {
  const [data,setData] = useState()

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref='./#/local'/>
          </IonButtons>
          <IonTitle>EPA Deidentification Review (Local Mode)</IonTitle>
          <IonButtons slot="end">
            <IonButton title="User">
              <IonIcon slot="icon-only" icon={person}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <h1>EPA Upload page works!</h1>
      </IonContent>
    </IonPage>
  );
};

export default LocalModeReviewDetail;
