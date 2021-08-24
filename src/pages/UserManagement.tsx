import { IonBadge, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar, useIonAlert, useIonPopover } from '@ionic/react';
import { apps, person } from "ionicons/icons";
import { useEffect, useState } from 'react';
import MainMenu from '../components/MainMenu';
import UserMenu from '../components/UserMenu';
import ServerInfo from '../utils/ServerInfo';
import { User } from '../utils/User';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>();

  const [presentMainMenuPopover, dismissMainMenuPopover] = useIonPopover(MainMenu, { onHide: () => dismissMainMenuPopover() });
  const [presentUserMenuPopover, dismissUserMenuPopover] = useIonPopover(UserMenu, { onHide: () => dismissUserMenuPopover() });
  const [presentAlert] = useIonAlert();

  useEffect(() => {
    async function obtainUsers() {
      const response = await fetch(
        `${ServerInfo.SERVER_BASE_URL}/user/all`,
        { credentials: 'include' }
      );
      let users: User[];
      if (response.ok && (users = await response.json())) {
        setUsers(users);
      }
    }
    obtainUsers();
  }, []);

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
          <IonTitle>User Management</IonTitle>
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
          users ?
            <IonList>
              {
                users.map(user => (
                  <IonItem
                    key={user._id}
                    button
                    onClick={() => presentAlert('Resetting password comming soon...', [{ text: 'Ok' }])}>
                    {user.username}
                    &nbsp;
                    <IonBadge>{user.roleName}</IonBadge>
                  </IonItem>
                ))
              }
            </IonList>
            :
            'Loading users...'
        }
        <IonFab
          vertical="bottom"
          horizontal="end"
          slot="fixed"
        >
          <IonFabButton
            title="Add a new user"
            onClick={() => presentAlert({
              message: 'Adding a new user...',
              inputs: [
                {
                  name: 'username',
                  label: 'Username',
                  placeholder: 'Enter the username here...',
                  type: 'text'
                },
                {
                  name: 'password',
                  label: 'Password',
                  placeholder: 'Enter the password here...',
                  value: Math.random().toString().substring(2, 8), // TODO use better way to generate the password
                  type: 'text'
                }
              ],
              buttons: [
                {
                  text: 'Confirm',
                  handler: async ({ username, password }) => {
                    const response = await fetch(
                      `${ServerInfo.SERVER_BASE_URL}/user/add`,
                      {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                          'Content-type': 'application/json'
                        },
                        body: JSON.stringify({
                          username: username,
                          authenticationHash: await digestText(password)
                        })
                      }
                    );
                    return response.ok;
                  }
                },
                'Cancel'
              ]
            })}
          >+</IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

async function digestText(text?: string) {
  if (text !== undefined) {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
}

export default UserManagement;
