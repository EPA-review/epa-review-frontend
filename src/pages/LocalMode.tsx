import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

const Dashboard: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>EPA Deidentification (Local Mode)</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
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
            To use Local Mode you will first need to format a CSV spreadsheet
            file containing your EPA assessment data. Data in the excel file you
            format should contain at least three columns that contain the name
            of the trainee, name of the observer, and the narrative assessment
            data. To format your data, click the button 'Format a new dataset'
            and follow the instructions. Once you have formatted your data,
            click 'Deidentify and Review my Formatted Data' to deidentify,
            review, and download your deidentified data.
          </p>
        </IonText>
        <IonButton href="./#/local/new">Format a New Dataset</IonButton>
        <IonButton href="./#/local/review">
          Deidentify and Review my Formatted Data
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
