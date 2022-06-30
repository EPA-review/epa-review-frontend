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
  useIonPopover,
} from "@ionic/react";
import { person } from "ionicons/icons";
import { useEffect, useState } from "react";
import UserMenu from "../components/UserMenuNew";
import { fetchUser } from "../utils/auth";
import { User } from "../utils/User";

const NewHome: React.FC = () => {
  const [user, setUser] = useState<User>();
  const [shouldShowVideo, setShouldShowVideo] = useState(false);

  const [presentUserMenuPopover, dismissUserMenuPopover] = useIonPopover(
    UserMenu,
    { onHide: () => dismissUserMenuPopover() }
  );

  useEffect(() => {
    async function fetchAndSetUserInfo() {
      const u = await fetchUser();
      setUser(u);
    }
    fetchAndSetUserInfo();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>EPA Deidentification</IonTitle>
          <IonButtons slot="end">
            <IonButton
              color={user ? "primary" : ""}
              title="User"
              onClick={(event) =>
                presentUserMenuPopover({ event: event.nativeEvent })
              }
            >
              <IonIcon slot="icon-only" icon={person}></IonIcon>
            </IonButton>
          </IonButtons>
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
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="6" sizeXl="4">
              <IonButton
                style={{ width: "100%", height: "10rem" }}
                href={`${process.env.PUBLIC_URL}/new/load`}
              >
                Format and deidentify a New Dataset
              </IonButton>
            </IonCol>
            <IonCol size="12" sizeMd="6" sizeXl="4">
              <IonButton
                style={{ width: "100%", height: "10rem" }}
                href={
                  user
                    ? `${process.env.PUBLIC_URL}/new/list`
                    : `${process.env.PUBLIC_URL}/new/review`
                }
              >
                Review my deidentified Data
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default NewHome;
