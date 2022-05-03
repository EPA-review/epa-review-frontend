import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import { useState } from "react";

const NewHome: React.FC = () => {
  const [shouldShowVideo, setShouldShowVideo] = useState(false);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>EPA Deidentification</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          <IonCardContent>
            <IonText>
              <p>
                Local mode allows you to deidentify and review narrative EPA
                assessment data without the data leaving your computer.{" "}
                <b>
                  When using local mode, all actions will be done on your
                  computer and no data will be uploaded or stored.
                </b>{" "}
                Instead, all actions will be done on your local computer.
              </p>
              <p>
                To use Local Mode you will need a spreadsheet saved as a CSV
                file containing at least three columns: the name of the trainee,
                the name of the observer, and the narrative assessment data. To
                get started, click 'Format and deidentify a new dataset' and
                follow the instructions. The results can then be reviewed or
                downloaded by clicking 'Review my deidentified data'.
              </p>
            </IonText>
            <br />
            <IonItem>
              <IonToggle
                checked={shouldShowVideo}
                onIonChange={({ detail }) => setShouldShowVideo(detail.checked)}
              />
              <IonLabel>Show Video</IonLabel>
            </IonItem>
            <br />
            {shouldShowVideo && (
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/7r0H__HyHBk?start=35"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </IonCardContent>
        </IonCard>
        <IonButton href="./#/new/load">
          Format and deidentify a New Dataset
        </IonButton>
        <IonButton href="./#/new/review">
          Review my deidentified Data
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default NewHome;
