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
                Our data deidentification tool has two modes: local mode and
                cloud mode.
              </p>
              <p>
                Local mode allows you to deidentify and review narrative EPA
                assessment data without the data leaving your computer. When
                using local mode, all actions will be done on your computer and
                no data will be uploaded or stored. Instead, all actions will be
                done on your local computer. We recommend this for users who are
                not from the University of Saskatchewan. By default, users who
                do not login are using local mode.
              </p>
              <p>
                Cloud mode transfers your narrative EPA assessment data to our
                servers for both deidentification and review. When using cloud
                mode, your data and its deidentified version are being stored on
                our servers. We recommend this for users who are from the
                University of Saskatchewan. To use cloud mode simply login by
                clicking the icon in the top right hand corner of this page.
              </p>
              <p>
                Both versions allow you to deidentify your narrative EPA
                assessments in multiple sessions and require you to have your
                data saved as a CSV spreadsheet containing at least three
                columns: the name of the trainee, the name of the observer, and
                the narrative assessment data. Please see the video below for
                more information on local mode (if you have not logged in) or
                cloud mode (if you have not logged in).
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
            {shouldShowVideo &&
              (user ? (
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/cwZt1hq0cnI"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/jvbwTCzcLXI?start=54"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ))}
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
