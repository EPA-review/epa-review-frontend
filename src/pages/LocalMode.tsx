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

const Dashboard: React.FC = () => {
  const [shouldShowVideo, setShouldShowVideo] = useState(false);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>EPA Deidentification (Local Mode)</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          <IonCardContent>
            <IonText>
              <p>
                Local mode allows you to anonymize your narrative EPA assessment
                data without your data leaving your computer.{" "}
                <b>
                  We will not upload or store any of the information that you
                  manipulate using this tool on Local Mode.
                </b>{" "}
                Instead, all actions will be done on your local computer.
              </p>
              <p>
                To use Local Mode you will first need to format a CSV
                spreadsheet file containing your EPA assessment data. Data in
                the excel file you format should contain at least three columns
                that contain the name of the trainee, name of the observer, and
                the narrative assessment data. To format your data, click the
                button 'Format a new dataset' and follow the instructions. Once
                you have formatted your data, click 'Deidentify and Review my
                Formatted Data' to deidentify, review, and download your
                deidentified data.
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
                src="https://www.youtube.com/embed/o2m2sqdVIlk"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </IonCardContent>
        </IonCard>
        <IonButton href="./#/local/new">
          Format and deidentify a New Dataset
        </IonButton>
        <IonButton href="./#/local/review">
          Review my deidentified Data
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
