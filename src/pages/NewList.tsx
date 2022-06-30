import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonPopover,
} from "@ionic/react";
import { person } from "ionicons/icons";
import { useEffect, useState } from "react";
import UserMenu from "../components/UserMenuNew";
import { fetchUser } from "../utils/auth";
import ServerInfo from "../utils/ServerInfo";
import { User } from "../utils/User";

const NewHome: React.FC = () => {
  const [user, setUser] = useState<User>();
  const [projectList, setProjectList] = useState<
    { name: string; userId: string }[]
  >([]);

  const [presentUserMenuPopover, dismissUserMenuPopover] = useIonPopover(
    UserMenu,
    { onHide: () => dismissUserMenuPopover() }
  );

  useEffect(() => {
    async function fetchAndSetProjectList() {
      const response = await fetch(
        `${ServerInfo.SERVER_BASE_URL}/project/list`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        setProjectList(await response.json());
      }
    }
    async function fetchAndSetUserInfo() {
      const u = await fetchUser();
      setUser(u);
      if (u) {
        fetchAndSetProjectList();
      }
    }
    fetchAndSetUserInfo();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/new" />
          </IonButtons>
          <IonTitle>Datasets</IonTitle>
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
        <IonList>
          {projectList?.map(({ name, userId }) => (
            <IonItem
              button
              href={`${process.env.PUBLIC_URL}/new/review?userId=${userId}&name=${name}`}
            >
              {name}
              {userId !== user?._id && (
                <IonBadge color="primary">Shared</IonBadge>
              )}
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default NewHome;
