import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
  useIonPopover,
} from "@ionic/react";
import { csvParse, DSVRowArray } from "d3-dsv";
import { apps, person } from "ionicons/icons";
import { useEffect, useState } from "react";
import MainMenu from "../components/MainMenu";
import UserMenu from "../components/UserMenu";
import ServerInfo from "../utils/ServerInfo";
import { User } from "../utils/User";

import styles from "./Upload.module.css";

const Upload: React.FC = () => {
  const userId = sessionStorage.getItem("userId") || "";

  const [file, setFile] = useState<File>();
  const [data, setData] = useState<DSVRowArray<string>>();
  const [feedbackFieldName, setFeedbackFieldName] = useState("Feedback");
  const [residentNameFieldName, setResidentNameFieldName] =
    useState("Resident Name");
  const [observerNameFieldName, setObserverNameFieldName] =
    useState("Observer Name");
  const [isDataLookingGood, setIsDataLookingGood] = useState(false);
  const [groupTag, setGroupTag] = useState<string>();
  const [isGroupTagLookingGood, setIsGroupTagLookingGood] = useState(false);
  const [isAllowedUsersLookingGood, setIsSharedUserLookingGood] =
    useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [users, setUsers] = useState<User[]>();
  const [allowedUserIds, setAllowedUserIds] = useState<User[]>();
  const [shouldShowVideo, setShouldShowVideo] = useState(false);

  const [presentMainMenuPopover, dismissMainMenuPopover] = useIonPopover(
    MainMenu,
    { onHide: () => dismissMainMenuPopover() }
  );
  const [presentUserMenuPopover, dismissUserMenuPopover] = useIonPopover(
    UserMenu,
    { onHide: () => dismissUserMenuPopover() }
  );
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    async function obtainUsers() {
      const response = await fetch(`${ServerInfo.SERVER_BASE_URL}/user/all`, {
        credentials: "include",
      });
      let users: User[];
      if (response.ok && (users = await response.json())) {
        setUsers(users);
      }
    }
    obtainUsers();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              title="Main Menu"
              onClick={(event) =>
                presentMainMenuPopover({ event: event.nativeEvent })
              }
            >
              <IonIcon slot="icon-only" icon={apps}></IonIcon>
            </IonButton>
          </IonButtons>
          <IonTitle>EPA Upload</IonTitle>
          <IonButtons slot="end">
            <IonButton
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
        <IonLoading
          isOpen={showLoading}
          onDidDismiss={() => setShowLoading(false)}
          message={"Uploading..."}
        />
        <IonCard>
          <IonCardContent>
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
        {renderUploadFileCard()}
        {renderColumnSelectionCard()}
        {renderSettingDatasetNameCard()}
        <IonCard
          className={styles.card}
          disabled={
            !(file && data && isDataLookingGood && isGroupTagLookingGood)
          }
        >
          <IonCardHeader>
            <IonCardTitle>
              Select other users that you would like to have access to this
              data.
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonSelect
              multiple
              disabled={
                !!(
                  file &&
                  data &&
                  isDataLookingGood &&
                  isGroupTagLookingGood &&
                  isAllowedUsersLookingGood
                )
              }
              placeholder="Select users to share with"
              onIonChange={({ detail }) => setAllowedUserIds(detail.value)}
            >
              {users
                ?.filter((user) => user._id !== userId)
                .map((user) => (
                  <IonSelectOption key={user._id} value={user._id}>
                    {user.username}
                  </IonSelectOption>
                ))}
            </IonSelect>
            <IonButton
              disabled={
                !!(
                  file &&
                  data &&
                  isDataLookingGood &&
                  isGroupTagLookingGood &&
                  isAllowedUsersLookingGood
                )
              }
              onClick={async () => {
                setIsSharedUserLookingGood(true);
              }}
            >
              Looks Good
            </IonButton>
          </IonCardContent>
        </IonCard>
        {renderConfirmCard()}
      </IonContent>
    </IonPage>
  );

  function renderConfirmCard() {
    return (
      <IonCard
        className={styles.card}
        disabled={
          !(
            file &&
            data &&
            isDataLookingGood &&
            isGroupTagLookingGood &&
            isAllowedUsersLookingGood
          )
        }
      >
        <IonCardHeader>
          <IonCardTitle>Process your data.</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonButton
            disabled={
              !!(
                file &&
                data &&
                isDataLookingGood &&
                isGroupTagLookingGood &&
                hasFinished
              )
            }
            onClick={async () => {
              setHasFinished(true);
              setShowLoading(true);
              const response = await fetch(
                `${ServerInfo.SERVER_BASE_URL}/epa/upload?groupTag=${groupTag}`,
                {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "Content-type": "application/json",
                  },
                  body: JSON.stringify({
                    data: data?.map((datum) => ({
                      text: datum[feedbackFieldName],
                      residentName: datum[residentNameFieldName],
                      observerName: datum[observerNameFieldName],
                    })),
                    allowedUserIds,
                  }),
                }
              );
              setShowLoading(false);
              if (response.ok) {
                alert("Upload finished.");
              } else {
                alert("Upload Failed.");
              }
            }}
          >
            Start
          </IonButton>
        </IonCardContent>
      </IonCard>
    );
  }

  function renderSettingDatasetNameCard() {
    return (
      <IonCard
        className={styles.card}
        disabled={!(file && data && isDataLookingGood)}
      >
        <IonCardHeader>
          <IonCardTitle>Name this dataset.</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonItem>
            <IonLabel position="stacked">Dataset Name</IonLabel>
            <IonInput
              disabled={
                !!(file && data && isDataLookingGood && isGroupTagLookingGood)
              }
              value={groupTag}
              placeholder="Input your group tag here..."
              onIonChange={({ detail }) => setGroupTag(detail.value || "")}
            ></IonInput>
          </IonItem>
          <IonButton
            disabled={
              !!(file && data && isDataLookingGood && isGroupTagLookingGood)
            }
            onClick={async () => {
              if (groupTag) {
                const response = await fetch(
                  `${ServerInfo.SERVER_BASE_URL}/epa/group-availability?groupTag=${groupTag}`,
                  {
                    method: "GET",
                    credentials: "include",
                  }
                );
                const result = (await response.json()) as Boolean;
                if (result) {
                  setIsGroupTagLookingGood(true);
                  return;
                }
              }
              alert(
                "The group tag name is not available, please try another one."
              );
            }}
          >
            Looks Good
          </IonButton>
        </IonCardContent>
      </IonCard>
    );
  }

  function renderColumnSelectionCard() {
    return (
      <IonCard className={styles.card} disabled={!(file && data)}>
        <IonCardHeader>
          <IonCardTitle>
            Preview your data and label the feedback and name columns below.
          </IonCardTitle>
          <IonText>
            <p>
              The deidentification tool needs to know which columns of your
              dataset contain the trainee name, observer name, and narrative
              feedback. Review the sample data that is displayed below and
              indicate the title of the columns containing the narrative
              feedback, trainee names, and observer names below.
            </p>
          </IonText>
        </IonCardHeader>
        <IonCardContent>
          {data && (
            <table>
              <caption>
                <h2>Below are up to first 10 records</h2>
              </caption>
              <thead>
                <tr>
                  {data?.columns.map((columnName, i) => (
                    <th key={i}>{columnName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.slice(0, 10).map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((columnValue, i) => (
                      <td key={i}>{columnValue}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <IonItem>
            <IonLabel position="stacked">
              Title of the column containing narrative feedback
            </IonLabel>
            <IonInput
              disabled={!!(file && data && isDataLookingGood)}
              value={feedbackFieldName}
              onIonChange={({ detail }) =>
                setFeedbackFieldName(detail.value || "")
              }
            ></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">
              Title of the column containing trainee names
            </IonLabel>
            <IonInput
              disabled={!!(file && data && isDataLookingGood)}
              value={residentNameFieldName}
              onIonChange={({ detail }) =>
                setResidentNameFieldName(detail.value || "")
              }
            ></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">
              Title of the column containing observer names
            </IonLabel>
            <IonInput
              disabled={!!(file && data && isDataLookingGood)}
              value={observerNameFieldName}
              onIonChange={({ detail }) =>
                setObserverNameFieldName(detail.value || "")
              }
            ></IonInput>
          </IonItem>
          <IonButton
            disabled={!!(file && data && isDataLookingGood)}
            onClick={async () => {
              setIsDataLookingGood(true);
            }}
          >
            Looks Good
          </IonButton>
          <IonButton
            fill="outline"
            disabled={!!(file && data && isDataLookingGood)}
            onClick={async () => {
              setFile(undefined);
              setData(undefined);
            }}
          >
            Go Back
          </IonButton>
        </IonCardContent>
      </IonCard>
    );
  }

  function renderUploadFileCard() {
    return (
      <IonCard className={styles.card}>
        <IonCardHeader>
          <IonCardTitle>Upload your CSV file.</IonCardTitle>
          <IonText>
            Select the CSV file containing the dataset that you would like to
            deidentify.
          </IonText>
        </IonCardHeader>
        <IonCardContent>
          <IonButton
            disabled={!!(file && data)}
            onClick={async () => {
              const fileHandle = (
                await (window as any).showOpenFilePicker()
              )?.[0];
              const file = (await fileHandle.getFile()) as File;
              setFile(file);
              const fileContent = await file?.text();
              const data = csvParse(fileContent || "");
              if (data.length > 0) {
                setData(data);
              }
            }}
          >
            Select File
          </IonButton>
          <br />
          <IonText>{`${
            file
              ? `${file.name} - ${
                  data ? `${data.length} Records` : "Not Loaded"
                }`
              : ""
          }`}</IonText>
        </IonCardContent>
      </IonCard>
    );
  }
};

export default Upload;
