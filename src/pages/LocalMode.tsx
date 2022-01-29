import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
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
        <IonButton href="./#/local/new">New Dataset</IonButton>
        <IonButton href="./#/local/review">Continue Work</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
