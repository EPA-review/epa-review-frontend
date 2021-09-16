import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonLoading, IonPage, IonText, IonTitle, IonToolbar, useIonPopover } from '@ionic/react';
import { csvParse, DSVRowArray } from 'd3-dsv';
import { apps, person } from "ionicons/icons";
import { useState } from 'react';
import MainMenu from '../components/MainMenu';
import UserMenu from '../components/UserMenu';
import ServerInfo from '../utils/ServerInfo';

import styles from './Upload.module.css';

const Upload: React.FC = () => {
  const [file, setFile] = useState<File>();
  const [data, setData] = useState<DSVRowArray<string>>();
  const [feedbackFieldName, setFeedbackFieldName] = useState('Feedback');
  const [residentNameFieldName, setResidentNameFieldName] = useState('Resident Name');
  const [observerNameFieldName, setObserverNameFieldName] = useState('Observer Name');
  const [isDataLookingGood, setIsDataLookingGood] = useState(false);
  const [groupTag, setGroupTag] = useState<string>();
  const [isGroupTagLookingGood, setIsGroupTagLookingGood] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  const [presentMainMenuPopover, dismissMainMenuPopover] = useIonPopover(MainMenu, { onHide: () => dismissMainMenuPopover() });
  const [presentUserMenuPopover, dismissUserMenuPopover] = useIonPopover(UserMenu, { onHide: () => dismissUserMenuPopover() });
  const [showLoading, setShowLoading] = useState(false);

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
          <IonTitle>EPA Upload</IonTitle>
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
        <IonLoading
          isOpen={showLoading}
          onDidDismiss={() => setShowLoading(false)}
          message={'Uploading...'}
        />
        <IonCard className={styles.card}>
          <IonCardHeader>
            <IonCardTitle>Upload your CSV file.</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton
              disabled={!!(file && data)}
              onClick={async () => {
                const fileHandle = (await (window as any).showOpenFilePicker())?.[0];
                const file = await fileHandle.getFile() as File;
                setFile(file);
                const fileContent = await file?.text();
                const data = csvParse(fileContent || '');
                if (data.length > 0) {
                  setData(data);
                }
              }}
            >Select File</IonButton>
            <br />
            <IonText>{`${file ? `${file.name} - ${data ? `${data.length} Records` : 'Not Loaded'}` : ''}`}</IonText>
          </IonCardContent>
        </IonCard>
        <IonCard className={styles.card} disabled={!(file && data)}>
          <IonCardHeader>
            <IonCardTitle>Preview your data and config the name of <b>Feedback</b> field.</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {
              data &&
              <table>
                <caption><h2>Below are up to first 10 records</h2></caption>
                <thead>
                  <tr>
                    {data?.columns.map((columnName, i) => (
                      <th key={i}>{columnName}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {
                    data?.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        {
                          Object.values(row).map((columnValue, i) => (
                            <td key={i}>{columnValue}</td>
                          ))
                        }
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            }
            <IonItem>
              <IonLabel position="stacked">Name of <b>Feedback</b> field</IonLabel>
              <IonInput
                disabled={!!(file && data && isDataLookingGood)}
                value={feedbackFieldName}
                onIonChange={({ detail }) => setFeedbackFieldName(detail.value || '')}
              ></IonInput>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Name of <b>Resident Name</b> field</IonLabel>
              <IonInput
                disabled={!!(file && data && isDataLookingGood)}
                value={residentNameFieldName}
                onIonChange={({ detail }) => setResidentNameFieldName(detail.value || '')}
              ></IonInput>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Name of <b>Observer Name</b> field</IonLabel>
              <IonInput
                disabled={!!(file && data && isDataLookingGood)}
                value={observerNameFieldName}
                onIonChange={({ detail }) => setObserverNameFieldName(detail.value || '')}
              ></IonInput>
            </IonItem>
            <IonButton
              disabled={!!(file && data && isDataLookingGood)}
              onClick={async () => {
                setIsDataLookingGood(true);
              }}
            >Looks Good</IonButton>
            <IonButton
              fill="outline"
              disabled={!!(file && data && isDataLookingGood)}
              onClick={async () => {
                setFile(undefined);
                setData(undefined);
              }}
            >Go Back</IonButton>
          </IonCardContent>
        </IonCard>
        <IonCard className={styles.card} disabled={!(file && data && isDataLookingGood)}>
          <IonCardHeader>
            <IonCardTitle>Set a group tag name.</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Tag Name</IonLabel>
              <IonInput
                disabled={!!(file && data && isDataLookingGood && isGroupTagLookingGood)}
                value={groupTag}
                placeholder="Input your group tag here..."
                onIonChange={({ detail }) => setGroupTag(detail.value || '')}
              ></IonInput>
            </IonItem>
            <IonButton
              disabled={!!(file && data && isDataLookingGood && isGroupTagLookingGood)}
              onClick={async () => {
                if (groupTag) {
                  const response = await fetch(
                    `${ServerInfo.SERVER_BASE_URL}/epa/fetch?groupTag=${groupTag}`,
                    {
                      method: 'GET',
                      credentials: 'include'
                    }
                  );
                  const result = await response.json() as [];
                  if (result.length === 0) {
                    setIsGroupTagLookingGood(true);
                    return;
                  }
                }
                alert('The group tag name is not available, please try another one.')
              }}
            >Looks Good</IonButton>
          </IonCardContent>
        </IonCard>
        <IonCard className={styles.card} disabled={!(file && data && isDataLookingGood && isGroupTagLookingGood)}>
          <IonCardHeader>
            <IonCardTitle>Process your data.</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton
              disabled={!!(file && data && isDataLookingGood && isGroupTagLookingGood && hasFinished)}
              onClick={async () => {
                setHasFinished(true);
                setShowLoading(true);
                const response = await fetch(
                  `${ServerInfo.SERVER_BASE_URL}/epa/upload?groupTag=${groupTag}`,
                  {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                      'Content-type': 'application/json'
                    },
                    body: JSON.stringify(data?.map(datum => ({
                      text: datum[feedbackFieldName],
                      residentName: datum[residentNameFieldName],
                      observerName: datum[observerNameFieldName]
                    })))
                  }
                );
                setShowLoading(false);
                if (response.ok) {
                  alert('Upload finished.');
                } else {
                  alert('Upload Failed.');
                }
              }}
            >Start</IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Upload;
