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
import { useEffect, useState } from "react";
import { EpaRecord } from "../utils/epa-record";

let pyodide: any;
let pythonDeidentifier: any;

const LocalModeLoadNew: React.FC = () => {
  const [file, setFile] = useState<File>();
  const [data, setData] = useState<DSVRowArray<string>>();
  const [nicknameDictionary, setNicknameDictionary] = useState<any>();
  const [feedbackFieldName, setFeedbackFieldName] = useState("Feedback");
  const [residentNameFieldName, setResidentNameFieldName] =
    useState("Resident Name");
  const [observerNameFieldName, setObserverNameFieldName] =
    useState("Observer Name");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadDeidentifier();
  }, []);

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
        {renderLoadNicknamesCard()}
        {renderColumnSelectionCard()}
      </IonContent>
    </IonPage>
  );

  function renderLoadDatasetCard() {
    return (
      <IonCard disabled={!!(file && data)}>
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

  function renderLoadNicknamesCard() {
    return (
      <IonCard disabled={!(file && data) || nicknameDictionary}>
        <IonCardHeader>
          <IonCardTitle>Load your nickname dictionary file.</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonButton onClick={() => loadNicknameDictionaryFile()}>
            Select File
          </IonButton>
          <br />
          <IonButton onClick={() => loadNicknameDictionaryFile(true)}>
            Use Default
          </IonButton>
          <IonButton
            fill="outline"
            onClick={() => window.open("./assets/nicknames.json")}
          >
            Check default nickname dictionary
          </IonButton>
          <br />
          <IonButton
            fill="outline"
            onClick={async () => {
              setFile(undefined);
              setData(undefined);
            }}
          >
            Go Back
          </IonButton>
          <br />
          {file && data && nicknameDictionary && <IonText>Loaded.</IonText>}
        </IonCardContent>
      </IonCard>
    );
  }

  function renderColumnSelectionCard() {
    return (
      <IonCard disabled={!(file && data && nicknameDictionary) || processing}>
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
          <IonButton onClick={async () => saveProjectFile()}>
            {processing ? "Processing..." : "Save the project file"}
          </IonButton>
          <IonButton
            fill="outline"
            onClick={async () => {
              setNicknameDictionary(undefined);
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

  async function loadNicknameDictionaryFile(useDefault?: boolean) {
    if (useDefault) {
      const response = await fetch("./assets/nicknames.json");
      setNicknameDictionary(await response.json());
    } else {
      const fileHandle = (await (window as any).showOpenFilePicker())?.[0];
      const file = (await fileHandle.getFile()) as File;
      setFile(file);
      const fileContent = await file?.text();
      try {
        const data = JSON.parse(fileContent);
        setNicknameDictionary(data);
      } catch {
        alert("The file is invalid.");
      }
    }
  }

  async function loadDeidentifier() {
    pyodide = await (window as any).loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.19.0/full/",
    });
    const response = await fetch(
      "https://raw.githubusercontent.com/EPA-review/anonymizer/master/SimpleAnonymizer.py"
    );
    const pythonScript = await response.text();
    pyodide.runPython(pythonScript);
    pythonDeidentifier = pyodide.runPython(`AnonymizeText`);
  }

  async function deidentify(
    text: string,
    names: string[],
    nicknames: { [name: string]: string[] }
  ) {
    return pythonDeidentifier(text, names, pyodide.toPy(nicknames)).toJs({
      dict_converter: Object.fromEntries,
    });
  }

  function saveProjectFile() {
    setTimeout(async () => {
      const fileHandle = await (window as any).showSaveFilePicker({
        types: [
          {
            description: "EPA deidentification project file",
            accept: { "application/json": [".deid"] },
          },
        ],
      });
      setProcessing(true);
      const writable = await fileHandle.createWritable();
      const epaRecords = data?.map((datum) => ({
        text: datum[feedbackFieldName],
        residentName: datum[residentNameFieldName],
        observerName: datum[observerNameFieldName],
      }));
      const results: EpaRecord[] = await Promise.all(
        (epaRecords || [])
          .filter((epaRecord) => epaRecord.text)
          .map(async (epaRecord, i) => {
            let names: string[] = [];
            names = names.concat(
              epaRecord?.residentName?.trim().split(/\s+/) || []
            );
            names = names.concat(
              epaRecord?.observerName?.trim().split(/\s+/) || []
            );
            return {
              originalText: epaRecord.text,
              residentName: epaRecord.residentName,
              observerName: epaRecord.observerName,
              tags: (await deidentify(epaRecord.text || "", names, nicknameDictionary)).map(
                (analyzerResult: { [x: string]: any }) => ({
                  ...analyzerResult,
                  name: analyzerResult["label"],
                })
              ),
            };
          })
      );
      await writable.write(JSON.stringify(results));
      await writable.close();
      alert("Deidentification finished and the project file is saved.");
      setProcessing(false);
    });
  }
};

export default LocalModeLoadNew;
