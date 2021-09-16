import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonPage, IonTitle, IonToolbar, useIonPopover } from '@ionic/react';
import { apps, person } from "ionicons/icons";
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import MainMenu from '../components/MainMenu';
import UserMenu from '../components/UserMenu';
import { fetchUser } from '../utils/auth';
import ServerInfo from '../utils/ServerInfo';
import { User } from '../utils/User';

const Review: React.FC = () => {
  const [, forceUpdate] = useState({});
  const history = useHistory();
  const [user, setUser] = useState<User>();
  const [groupTags, setGroupTags] = useState<string[]>();
  const [presentMainMenuPopover, dismissMainMenuPopover] = useIonPopover(MainMenu, { onHide: () => dismissMainMenuPopover() });
  const [presentUserMenuPopover, dismissUserMenuPopover] = useIonPopover(UserMenu, { onHide: () => dismissUserMenuPopover() });

  useEffect(() => {
    async function fetchAndSetUserInfo() {
      setUser(await fetchUser());
    }
    fetchAndSetUserInfo();
  }, [history]);

  useEffect(() => {
    async function obtainGroupTags() {
      const response = await fetch(
        `${ServerInfo.SERVER_BASE_URL}/epa/group-tags`,
        { credentials: 'include' }
      );
      let groupTags: string[];
      if (response.ok && (groupTags = await response.json())) {
        setGroupTags(groupTags);
      }
    }
    obtainGroupTags();
  }, [history]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              title="Main Menu"
              onClick={event => presentMainMenuPopover({ event: event.nativeEvent })}
            >
              <IonIcon slot="icon-only" icon={apps}></IonIcon>
            </IonButton>
          </IonButtons>
          <IonTitle>EPA Review</IonTitle>
          <IonButtons slot="end">
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
        {
          groupTags ?
            groupTags.map(groupTag => (
              <IonItem key={groupTag} button routerLink={`/review/${groupTag}`}>
                {groupTag}
                {
                  user?.roleName === 'admin' &&
                  <IonButton
                    color="danger"
                    slot="end"
                    onClick={async () => {
                      if (window.confirm(`Are you sure to remove ${groupTag}?`)) {
                        const response = await fetch(
                          `${ServerInfo.SERVER_BASE_URL}/epa?groupTag=${groupTag}`,
                          {
                            method: 'DELETE',
                            credentials: 'include'
                          }
                        );
                        if(response.ok) {
                          forceUpdate({});
                        } else {
                          alert(`Fail to remove ${groupTag}.`)
                        }
                      }
                    }}
                  >Delete</IonButton>
                }
              </IonItem>
            )) :
            'Loading data...'
        }
      </IonContent>
    </IonPage>
  );
};

export default Review;
