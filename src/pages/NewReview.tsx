import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import { open } from "ionicons/icons";
import { useState } from "react";

const itemCountPerPage = 10;

let fileHandle: any;

const Dashboard: React.FC = () => {
  const [file, setFile] = useState<any>();
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [shouldShowVideo, setShouldShowVideo] = useState(false);

  const results: { feedbacks: any[] }[] = data?.results;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Review</IonTitle>
          <IonButtons slot="end">
            <IonButton title="Open" onClick={() => openFile()}>
              <IonIcon slot="icon-only" icon={open}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {renderTips()}
        <IonGrid>
          {results
            ?.slice(itemCountPerPage * (page - 1), itemCountPerPage * page)
            ?.map(({ feedbacks }, i) => (
              <IonRow key={i}>
                <IonCol size="auto">
                  <IonCard>
                    <IonCardContent>{i}</IonCardContent>
                  </IonCard>
                </IonCol>
                <IonCol>
                  <IonRow>
                    {feedbacks?.map((feedback, i) => (
                      <IonCol key={i}>
                        <IonCard>
                          <IonCardContent>
                            {feedback.originalText}
                          </IonCardContent>
                        </IonCard>
                      </IonCol>
                    ))}
                  </IonRow>
                </IonCol>
              </IonRow>
            ))}
        </IonGrid>
      </IonContent>
    </IonPage>
  );

  function renderTips() {
    switch (true) {
      case !file:
        return (
          <IonCard>
            <IonCardContent>
              <IonText>
                The formatted 'Project File' that you downloaded to your
                computer can be opened within this webpage and reviewed. To
                start, click the 'open' button in the top right corner of the
                page and select the formatted dataset you downloaded to your
                computer (it should have a .deid file format). This will display
                the EPA narratives from the file with names and pronouns
                identified to the best of our program's ability. Edits that you
                make to the deidentification within the review page will be
                saved within the '.deid' file on your desktop and can be opened
                again later for further review as needed. When you have
                completed your review and modification to the deidentification,
                select the 'download' button in the top right-hand corner to
                download a CSV containing your deidentified narrative data.
              </IonText>
              <br />
              <IonItem>
                <IonToggle
                  checked={shouldShowVideo}
                  onIonChange={({ detail }) =>
                    setShouldShowVideo(detail.checked)
                  }
                />
                <IonLabel>Show Video</IonLabel>
              </IonItem>
              <br />
              {shouldShowVideo && (
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/7r0H__HyHBk?start=158"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </IonCardContent>
          </IonCard>
        );
      case !data:
        return <h1>Data not loaded.</h1>;
      default:
        return (
          <IonCard>
            <IonCardContent>
              <IonText>
                Below you should see your narrative data with trainee names and
                pronouns highlighted for review. If you identify an error,
                select the yellow button to the right of the narrative to modify
                the deidentification of that narrative. You will then be able to
                click the word that was correctly or incorrectly identified as a
                name, nickname, or pronoun. Clicking on it will allow you to add
                or remove the label. When it has been edited to correct the
                error (or if it did not have any errors), click the green
                checkmark to the right of the narrative to identify that it has
                been completely deidentified. If you would like to toggle
                between the original tags and those that you have modified, you
                can do so by clicking the blue button. When you have completed
                your review and modification to the deidentification, select the
                'download' button in the top right hand corner to download a CSV
                containing your deidentified narrative data.
              </IonText>
            </IonCardContent>
          </IonCard>
        );
    }
  }

  async function openFile(existingFileHandle?: any) {
    fileHandle = existingFileHandle;
    if (!fileHandle) {
      fileHandle = (await (window as any).showOpenFilePicker())?.[0];
    }
    const file = (await fileHandle.getFile()) as File;
    setFile(file);
    const fileContent = await file?.text();
    try {
      const data = JSON.parse(fileContent);
      setData(data);
    } catch {
      setData(undefined);
    }
  }
};

export default Dashboard;
