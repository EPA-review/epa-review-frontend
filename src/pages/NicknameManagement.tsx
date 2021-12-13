import { IonBadge, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonList, IonPage, IonText, IonTitle, IonToolbar, useIonPopover } from '@ionic/react';
import { add, apps, checkmark, close, cloudUpload, download, person } from "ionicons/icons";
import { useEffect, useState } from 'react';
import MainMenu from '../components/MainMenu';
import { NicknameDict } from '../utils/NicknameDict';
import ServerInfo from '../utils/ServerInfo';

const NicknameManagement: React.FC = () => {
  const [nicknameDict, setNicknameDict] = useState<NicknameDict>();
  const [present, dismiss] = useIonPopover(MainMenu, { onHide: () => dismiss() });

  useEffect(() => {
    async function obtainNicknameDict() {
      const response = await fetch(
        `${ServerInfo.SERVER_BASE_URL}/nickname`,
        { credentials: 'include' }
      );
      let dict: NicknameDict;
      if (response.ok && (dict = await response.json())) {
        setNicknameDict(dict);
      }
    }
    obtainNicknameDict();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              title="Main Menu"
              onClick={event => present({ event: event.nativeEvent })}
            >
              <IonIcon slot="icon-only" icon={apps}></IonIcon>
            </IonButton>
          </IonButtons>
          <IonTitle>Nickname Management</IonTitle>
          <IonButtons slot="end">
            <IonButton
              title="Upload"
              onClick={async () => {
                const fileHandle = (await (window as any).showOpenFilePicker())?.[0];
                const file = await fileHandle.getFile() as File;
                const fileContent = await file?.text();
                const data = JSON.parse(fileContent || '');
                setNicknameDict(data);
              }}
            >
              <IonIcon slot="icon-only" icon={cloudUpload}></IonIcon>
            </IonButton>
            <IonButton
              title="Export"
              onClick={() => {
                const content = JSON.stringify(nicknameDict);

                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
                element.setAttribute('download', 'nicknames.json');

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                element.remove();
              }}
            >
              <IonIcon slot="icon-only" icon={download}></IonIcon>
            </IonButton>
            <IonButton title="User">
              <IonIcon slot="icon-only" icon={person}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList style={{ marginBottom: '10rem' }}>
          {
            Object.entries(nicknameDict || {}).map(([name, nicknames]) => (
              <IonItem key={name}>
                <IonText slot="start">{name}</IonText>
                {
                  nicknames?.map(nickname => (
                    <IonBadge
                      key={name + '.' + nickname}
                      style={{ marginRight: '.5rem', cursor: 'pointer' }}
                      onClick={() => {
                        if (window.confirm(`Delete ${nickname}?`)) {
                          if (nicknameDict?.[name]) {
                            nicknameDict[name] = nicknameDict?.[name].filter(nc => nc !== nickname);
                            setNicknameDict({ ...nicknameDict });
                          }
                        }
                      }}
                    >{nickname}</IonBadge>
                  ))
                }
                <IonItem slot="end" >
                  <IonInput className="nickname-input" placeholder="New Nickname" />
                  <IonButton onClick={event => {
                    const target = event.currentTarget;
                    const nicknameInput = (target.parentElement?.querySelector('.nickname-input') as HTMLInputElement);
                    const newNickname = nicknameInput?.value;
                    if (nicknameDict?.[name]) {
                      nicknameDict?.[name].push(newNickname);
                      nicknameInput.value = '';
                      setNicknameDict({ ...nicknameDict });
                    }
                  }}>
                    <IonIcon slot="icon-only" icon={add}></IonIcon>
                  </IonButton>
                </IonItem>
                <IonButton
                  slot="end"
                  onClick={() => {
                    if (window.confirm(`Delete ${name}?`)) {
                      if (nicknameDict) {
                        delete nicknameDict[name];
                        setNicknameDict({ ...nicknameDict });
                      }
                    }
                  }}
                >
                  <IonIcon slot="icon-only" icon={close}></IonIcon>
                </IonButton>
              </IonItem>
            ))
          }
        </IonList>
        <IonFab
          vertical="bottom"
          horizontal="end"
          slot="fixed"
        >
          <IonFabButton
            title="Add"
            onClick={() => {
              const newName = window.prompt('Enter a name:');
              if (nicknameDict && newName) {
                nicknameDict[newName] = [];
                setNicknameDict({ ...nicknameDict });
              }
            }}
          >
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
          <IonFabButton
            title="Submit"
            color="success"
            onClick={async () => {
              const response = await fetch(
                `${ServerInfo.SERVER_BASE_URL}/nickname`,
                {
                  method: 'PUT',
                  credentials: 'include',
                  headers: {
                    'Content-type': 'application/json'
                  },
                  body: JSON.stringify(nicknameDict)
                }
              );
              if (response.ok) {
                window.alert('Updated.');
              } else {
                window.alert('Fail to update.');
              }
            }}
          >
            <IonIcon icon={checkmark}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default NicknameManagement;
