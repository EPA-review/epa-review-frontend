import {
  IonBackButton,
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
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
  useIonAlert,
  useIonPopover,
} from "@ionic/react";
import { csvParse, DSVRowArray } from "d3-dsv";
import { person } from "ionicons/icons";
import { useEffect, useState } from "react";
import UserMenu from "../components/UserMenuNew";
import { fetchUser } from "../utils/auth";
import { FeedbackGroup, Results, Tag } from "../utils/new-data-structure";
import ServerInfo from "../utils/ServerInfo";
import { User } from "../utils/User";

let pyodide: any;
let pythonDeidentifier: any;

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User>();
  const [users, setUsers] = useState<User[]>();
  const [sharedUserIds, setSharedUserIds] = useState<string[]>([]);
  const [shouldShowVideo, setShouldShowVideo] = useState(false);
  const [file, setFile] = useState<File>();
  const [data, setData] = useState<DSVRowArray<string>>();
  const [nameDictionary, setNameDictionary] = useState<any>();
  const [dataPreviewLimit, setDataPreviewLimit] = useState(10);
  const [feedbackColumns, setFeedbackColumns] = useState(["Feedback"]);
  const [residentNameColumns, setResidentNameColumns] = useState([
    "Resident Name",
  ]);
  const [observerNameColumns, setObserverNameColumns] = useState([
    "Observer Name",
  ]);
  const [processing, setProcessing] = useState(false);

  const [presentUserMenuPopover, dismissUserMenuPopover] = useIonPopover(
    UserMenu,
    { onHide: () => dismissUserMenuPopover() }
  );
  const [presentAlert] = useIonAlert();

  useEffect(() => {
    loadDeidentifier();
  }, []);

  useEffect(() => {
    async function fetchAndSetUserInfo() {
      const u = await fetchUser();
      setUser(u);
    }
    fetchAndSetUserInfo();
  }, []);

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
            <IonBackButton defaultHref="/new" />
          </IonButtons>
          <IonTitle>Load Dataset</IonTitle>
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
        {renderTips()}
        {renderFileSelectionCard(!!(file && data))}
        {renderNameDictionarySelectionCard(!(file && data) || nameDictionary)}
        {renderColumnSelectionCard(
          !(file && data && nameDictionary) || processing
        )}
      </IonContent>
    </IonPage>
  );

  function renderColumnSelectionCard(disabled: boolean) {
    return (
      <IonCard disabled={disabled}>
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
          <IonItem>
            <IonLabel position="stacked">Preview limit</IonLabel>
            <IonInput
              disabled={disabled}
              type="number"
              value={dataPreviewLimit}
              onIonChange={({ detail }) =>
                setDataPreviewLimit(+(detail.value || "0"))
              }
            ></IonInput>
          </IonItem>
          {data && (
            <>
              <IonText>
                <h2>Below are up to first {dataPreviewLimit} records</h2>
              </IonText>
              <div style={{ maxHeight: "30rem", overflowY: "auto" }}>
                <table style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      {data?.columns.map((columnName, i) => (
                        <th key={i}>{columnName}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data?.slice(0, dataPreviewLimit).map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((columnValue, i) => (
                          <td key={i}>{columnValue}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <IonItem>
            <IonLabel position="stacked">
              Title(s) of the column(s) containing narrative feedback (separate
              multiple titles with commas and no following space)
            </IonLabel>
            <IonInput
              disabled={disabled}
              value={feedbackColumns.join(",")}
              onIonChange={({ detail }) =>
                setFeedbackColumns(detail.value?.split(",") || [])
              }
            ></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">
              Title(s) of the column(s) containing trainee names (separate
              multiple titles with commas and no following space)
            </IonLabel>
            <IonInput
              disabled={disabled}
              value={residentNameColumns.join(",")}
              onIonChange={({ detail }) =>
                setResidentNameColumns(detail.value?.split(",") || [])
              }
            ></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">
              Title(s) of the column(s) containing observer names (separate
              multiple titles with commas and no following space)
            </IonLabel>
            <IonInput
              disabled={disabled}
              value={observerNameColumns.join(",")}
              onIonChange={({ detail }) =>
                setObserverNameColumns(detail.value?.split(",") || [])
              }
            ></IonInput>
          </IonItem>
          {user && (
            <IonItem>
              <IonLabel position="stacked">
                Who you want to share with?
              </IonLabel>
              <IonSelect
                multiple
                placeholder="Select users to share with"
                onIonChange={({ detail }) => setSharedUserIds(detail.value)}
              >
                {users
                  ?.filter((u) => user._id !== u._id)
                  .map((user) => (
                    <IonSelectOption key={user._id} value={user._id}>
                      {user.username}
                    </IonSelectOption>
                  ))}
              </IonSelect>
            </IonItem>
          )}

          {user ? (
            <IonText>
              Clicking 'Deidentify and Upload' will deidentify your data and
              upload it to our server. After this has been done, select 'Review
              my Data' to begin reviewing your deidentified dataset.
            </IonText>
          ) : (
            <IonText>
              Clicking 'Deidentify and Save the Project File' will allow you to
              download a project file to your local computer that has been
              formatted to allow deidentification. Please save it somewhere
              accessible then click 'Review my Data' to begin reviewing your
              deidentified dataset.
            </IonText>
          )}
          <br />
          <IonButton
            disabled={disabled}
            onClick={async () => {
              presentAlert({
                header:
                  "This action may take some time (up to minutes) for large datasets, are you sure to continue?",
                buttons: [
                  {
                    text: "No",
                    role: "cancel",
                  },
                  {
                    text: "Yes",
                    role: "confirm",
                    handler: () => (user ? uploadToServer : saveProjectFile)(),
                  },
                ],
              });
            }}
          >
            {processing
              ? "Processing..."
              : user
              ? "Deidentify and upload"
              : "Deidentify and save the project file"}
          </IonButton>
          <br />
          <IonButton
            href={
              user
                ? `${process.env.PUBLIC_URL}/new/list`
                : `${process.env.PUBLIC_URL}/new/review`
            }
          >
            Review my data
          </IonButton>
          <br />
          <IonButton
            disabled={disabled}
            fill="outline"
            onClick={async () => {
              setNameDictionary(undefined);
            }}
          >
            Go back
          </IonButton>
        </IonCardContent>
      </IonCard>
    );
  }

  function renderNameDictionarySelectionCard(disabled: boolean) {
    return (
      <IonCard disabled={disabled}>
        <IonCardHeader>
          <IonCardTitle>Load your name dictionary.</IonCardTitle>
          <IonText>
            <p>
              We use a name dictionary to support the deidentification of named
              individuals. We recommend that you start by selecting 'Use the
              default name dictionary'. However, if you find that our tool
              misses names or nicknames in your data, you can download, modify,
              and select a name dictionary specific to your dataset below.
            </p>
            <p>
              - Click 'Use the Default Name Dictionary' to use our pre-existing
              name dictionary.
            </p>
            <p>
              - Click 'Download the Default Name Dictionary' to review and add
              names as needed.{" "}
            </p>
            <p>
              - Click 'Select a Name Dictionary File' to select a name
              dictionary file from your own computer.
            </p>
            <p>
              - Click 'Go back' to select a different CSV file for
              deidentification
            </p>
          </IonText>
        </IonCardHeader>
        <IonCardContent>
          <IonButton
            disabled={disabled}
            onClick={() => loadNameDictionaryFile()}
          >
            Select a name dictionary file
          </IonButton>
          <br />
          <IonButton
            disabled={disabled}
            onClick={() => loadNameDictionaryFile(true)}
          >
            Use the default name dictionary
          </IonButton>
          <br />
          <IonButton
            disabled={disabled}
            fill="outline"
            onClick={() => exportDefaultNameDictionaryFile()}
          >
            Download the default name dictionary
          </IonButton>
          <br />
          <IonButton
            disabled={disabled}
            fill="outline"
            onClick={async () => {
              setFile(undefined);
              setData(undefined);
            }}
          >
            Go back
          </IonButton>
          <br />
          {file && data && nameDictionary && <IonText>Loaded.</IonText>}
        </IonCardContent>
      </IonCard>
    );
  }

  function renderFileSelectionCard(disabled: boolean) {
    return (
      <IonCard disabled={disabled}>
        <IonCardHeader>
          <IonCardTitle>Load your CSV File.</IonCardTitle>
          <IonText>
            Select the CSV file containing the dataset that you would like to
            deidentify. Please note that this file will NOT be uploaded to our
            servers, but reformatted on your local system into a new file for
            you to download.
          </IonText>
        </IonCardHeader>
        <IonCardContent>
          <IonButton disabled={disabled} onClick={() => loadCSVFile()}>
            Select file
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

  function renderTips() {
    return (
      <IonCard>
        <IonCardContent>
          <IonText>Some text...</IonText>
          <IonItem>
            <IonToggle
              checked={shouldShowVideo}
              onIonChange={({ detail }) => setShouldShowVideo(detail.checked)}
            />
            <IonLabel>Show Video</IonLabel>
          </IonItem>
          {shouldShowVideo && (
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/qhlO9lXRZMg?start=103"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </IonCardContent>
      </IonCard>
    );
  }

  async function loadCSVFile() {
    const fileHandle = (await (window as any).showOpenFilePicker())?.[0];
    const file = (await fileHandle.getFile()) as File;
    setFile(file);
    const fileContent = await file?.text();
    const data = csvParse(fileContent || "");
    if (data.length > 0) {
      setData(data);
    }
  }

  async function loadNameDictionaryFile(useDefault?: boolean) {
    if (useDefault) {
      const response = await fetch(
        `${process.env.PUBLIC_URL}/assets/names.csv`
      );
      const text = await response.text();
      setNameDictionary(convertNameDictionaryFromCSVToObject(text));
    } else {
      const fileHandle = (await (window as any).showOpenFilePicker())?.[0];
      const file = (await fileHandle.getFile()) as File;
      const fileContent = await file?.text();
      try {
        const data = convertNameDictionaryFromCSVToObject(fileContent);
        setNameDictionary(data);
      } catch {
        alert("The file is invalid.");
      }
    }
  }

  async function exportDefaultNameDictionaryFile() {
    try {
      const response = await fetch(
        `${process.env.PUBLIC_URL}/assets/names.csv`
      );
      const text = await response.text();
      const fileHandle = await (window as any).showSaveFilePicker({
        types: [
          {
            description: "Comma-Separated Values",
            accept: { "text/csv": [".csv"] },
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(text);
      await writable.close();
    } catch {
      alert("Something went wrong.");
    }
  }

  function convertNameDictionaryFromCSVToObject(content: string) {
    const entries = csvParse(content);
    const dict: { [name: string]: string[] } = Object.fromEntries(
      entries.map(({ name, variants }) => [name, variants?.split(" ") || []])
    );
    return dict;
  }

  // function convertNameDictionaryFromObjectToCSV(dict: {
  //   [name: string]: string[];
  // }) {
  //   const entries = Object.entries(dict).map(([name, variants]) => ({
  //     name,
  //     variants: variants?.join(" "),
  //   }));
  //   return csvFormat(entries);
  // }

  async function uploadToServer() {
    const name = prompt("Enter a name for this dataset", "");
    if (!name) {
      alert("The name is not valid, please try again.");
      return;
    }
    setProcessing(true);
    setTimeout(async () => {
      const result = await processData();
      const response = await fetch(
        `${ServerInfo.SERVER_BASE_URL}/project/upload?name=${name}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            data: result,
            sharedUserIds,
          }),
        }
      );
      if (response.ok) {
        alert("Deidentification finished and the project file is uploaded.");
      } else if (response.status === 409) {
        alert("The name has already been taken, please try again.");
      }
      setProcessing(false);
    }, 0);
  }

  async function saveProjectFile() {
    setProcessing(true);
    setTimeout(async () => {
      const fileHandle = await (window as any).showSaveFilePicker({
        types: [
          {
            description: "EPA deidentification project file",
            accept: { "application/json": [".deid"] },
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      const result = await processData();
      await writable.write(JSON.stringify(result));
      await writable.close();
      alert("Deidentification finished and the project file is saved.");
      setProcessing(false);
    }, 100);
  }

  async function processData() {
    const records = data?.map((record) => ({
      feedbackTexts: feedbackColumns?.map((columnName) => record[columnName]),
      residentNames:
        residentNameColumns?.flatMap(
          (columName) => record[columName]?.match(/\w+/g) || []
        ) || [],
      observerNames:
        observerNameColumns?.flatMap(
          (columName) => record[columName]?.match(/\w+/g) || []
        ) || [],
    }));
    const results: Results = {
      feedbackGroups: (await Promise.all(
        (records || []).map(async (record, i) => {
          const names = record.residentNames.concat(record.observerNames);
          return {
            feedbacks: await Promise.all(
              record.feedbackTexts.map(async (feedback) => ({
                originalText: feedback || "",
                tags: (
                  await deidentify(feedback || "", names, nameDictionary)
                ).map(
                  (analyzerResult: { [x: string]: any }) =>
                    ({
                      ...analyzerResult,
                      name: analyzerResult["label"],
                    } as unknown as Tag)
                ),
              }))
            ),
          };
        })
      )) as FeedbackGroup[],
    };
    return {
      rawData: data,
      config: {
        feedbackColumns,
        residentNameColumns,
        observerNameColumns,
      },
      results,
    };
  }

  async function loadDeidentifier() {
    if (!pyodide) {
      pyodide = await (window as any).loadPyodide({
        indexURL: `${process.env.PUBLIC_URL}/pyodide`,
      });
    }
    const response = await fetch(`${process.env.PUBLIC_URL}/deidentifier.py`);
    const pythonScript = await response.text();
    pyodide.runPython(pythonScript);
    pythonDeidentifier = pyodide.runPython(`AnonymizeText`);
  }

  async function deidentify(
    text: string,
    names: string[],
    nicknames: { [name: string]: string[] }
  ) {
    if (!((window as any).previousNicknames === nicknames)) {
      (window as any).nicknamesAsPy = pyodide.toPy(nicknames);
      (window as any).previousNicknames = nicknames;
    }
    return pythonDeidentifier(text, names, (window as any).nicknamesAsPy).toJs({
      dict_converter: Object.fromEntries,
    });
  }
};

export default Dashboard;
