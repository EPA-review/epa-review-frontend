import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonPage, IonRow, IonTitle, IonToolbar, useIonPopover } from '@ionic/react';
import { person, checkmark, create, swapHorizontal, download } from "ionicons/icons";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import UserMenu from '../components/UserMenu';
import ServerInfo from '../utils/ServerInfo';

import styles from './ReviewDetail.module.css';

type EpaFeedback = { originalText: string, tags: { start: number, end: number, name: string }[] };

const Dashboard: React.FC = () => {
  const { groupTag } = useParams<{ groupTag: string }>();
  const [data, setData] = useState<EpaFeedback[]>();
  const [presentUserMenuPopover, dismissUserMenuPopover] = useIonPopover(UserMenu, { onHide: () => dismissUserMenuPopover() });

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
            <IonButton
              title="Export"
              onClick={() => alert('Not implemented yet.')}
            >
              <IonIcon slot="icon-only" icon={download} ></IonIcon>
            </IonButton>
            <IonButton
              title="User"
              onClick={event => presentUserMenuPopover({ event: event.nativeEvent })}
            >
              <IonIcon slot="icon-only" icon={person} ></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          {
            data ?
              data.map(({ originalText, tags }, i) => (
                <IonRow key={i}>
                  <IonCol>
                    <IonCard className={styles.card}>
                      <IonCardContent>
                        <s-magic-text ref={el => {
                          if (el) {
                            el.text = originalText;
                            el.highlights = tags?.map(tag => ({ ...tag, tag: tag.name, style: { color: 'lightblue' } }));
                            el.addEventListener('segmentClick', ({ detail }: any) => {
                              alert('a dialog with actions should be presented.');
                            });
                          }
                        }}></s-magic-text>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                  <IonCol size="auto">
                    <IonCard className={styles.card} style={{ width: '192px' }}>
                      <IonButton color="success" fill="outline" title="Approve">
                        <IonIcon slot="icon-only" icon={checkmark}></IonIcon>
                      </IonButton>
                      <IonButton color="warning" fill="outline" title="Modify">
                        <IonIcon slot="icon-only" icon={create}></IonIcon>
                      </IonButton>
                      <IonButton color="primary" fill="outline" title="Swap">
                        <IonIcon slot="icon-only" icon={swapHorizontal}></IonIcon>
                      </IonButton>
                    </IonCard>
                  </IonCol>
                </IonRow>
              )) :
              'No Data Yet'
          }
        </IonGrid>
      </IonContent>
    </IonPage >
  );
};

export default Dashboard;
