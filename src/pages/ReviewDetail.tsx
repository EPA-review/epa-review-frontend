import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import { person } from "ionicons/icons";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import ServerInfo from '../utils/ServerInfo';

import styles from './ReviewDetail.module.css';

type EpaFeedback = { originalText: string, anonmymizedText: string };

const Dashboard: React.FC = () => {
  const { groupTag } = useParams<{ groupTag: string }>();

  const [data, setData] = useState<EpaFeedback[]>();

  useEffect(() => {
    async function obtainUser() {
      const response = await fetch(
        `${ServerInfo.SERVER_BASE_URL}/epa/fetch?groupTag=${groupTag}`,
        { credentials: 'include' }
      );
      let data: EpaFeedback[];
      if (response.ok && (data = await response.json())) {
        setData(data);
      }
    }
    obtainUser();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/review"></IonBackButton>
          </IonButtons>
          <IonTitle>{groupTag}</IonTitle>
          <IonButtons slot="end">
            <IonButton title="User">
              <IonIcon slot="icon-only" icon={person}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          {
            data ?
              data.map(({ originalText, anonmymizedText }, i) => (
                <IonRow key={i}>
                  <IonCol>
                    <IonCard className={styles.card}>
                      <IonCardContent>{originalText}</IonCardContent>
                    </IonCard>
                  </IonCol>
                  <IonCol>
                    <IonCard className={styles.card}>
                      <IonCardContent>{anonmymizedText}</IonCardContent>
                    </IonCard>
                  </IonCol>
                </IonRow>
              )) :
              'No Data Yet'
          }
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
