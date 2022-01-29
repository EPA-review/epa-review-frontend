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
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { csvParse, DSVRowArray } from "d3-dsv";
import { useState } from "react";

const LocalModeLoadNew: React.FC = () => {
  const [file, setFile] = useState<File>();
  const [data, setData] = useState<DSVRowArray<string>>();
  const [feedbackFieldName, setFeedbackFieldName] = useState("Feedback");
  const [residentNameFieldName, setResidentNameFieldName] =
    useState("Resident Name");
  const [observerNameFieldName, setObserverNameFieldName] =
    useState("Observer Name");

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="./#/local" />
          </IonButtons>
          <IonTitle>Load New Dataset (Local Mode)</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {renderLoadDatasetCard()}
        {renderColumnSelectionCard()}
      </IonContent>
    </IonPage>
  );

  function renderLoadDatasetCard() {
    return (
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Load your CSV File.</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonButton disabled={!!(file && data)} onClick={() => loadCSVFile()}>
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

  function renderColumnSelectionCard() {
    return (
      <IonCard disabled={!(file && data)}>
        <IonCardHeader>
          <IonCardTitle>
            Preview your data and label the feedback and name columns below.
          </IonCardTitle>
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
              value={feedbackFieldName}
              onIonChange={({ detail }) =>
                setFeedbackFieldName(detail.value || "")
              }
            ></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">
              Title of the column containing resident names
            </IonLabel>
            <IonInput
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
              value={observerNameFieldName}
              onIonChange={({ detail }) =>
                setObserverNameFieldName(detail.value || "")
              }
            ></IonInput>
          </IonItem>
          <IonButton
            onClick={async () => {
              const fileHandle = await (window as any).showSaveFilePicker({
                types: [
                  {
                    description: "EPA deidentification project file",
                    accept: { "application/json": [".deid"] },
                  },
                ],
              });
              const writable = await fileHandle.createWritable();
              await writable.write("test");
              await writable.close();
            }}
          >
            Save the project file
          </IonButton>
          <IonButton
            fill="outline"
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
};

export default LocalModeLoadNew;
