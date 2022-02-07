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
import { csvFormat, csvParse, DSVRowArray } from "d3-dsv";
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
            <IonBackButton defaultHref="." />
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
          <IonText>
            Select the CSV file containing the dataset that you would like to
            deidentify. Please note that this file will NOT be uploaded to our
            servers, but reformatted on your local system into a new file for
            you to download.
          </IonText>
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
          <IonText>
            <p>
              A dictionary of nicknames that is customized for your own dataset
              can be used instead of our default nickname dictionary. The
              nickname dictionary is used to ensure that commonly used nicknames
              (e.g. a trainee named 'Samantha' that is sometimes referred to as
              'Sam') appearing in your data are deidentified correctly.
            </p>
            <p>
              - Click 'Use the Default Nickname Dictionary' to use our
              pre-existing nickname dictionary.
            </p>
            <p>
              - Click 'Download the Default Nickname Dictionary' to review and
              add names as needed.{" "}
            </p>
            <p>
              - Click 'Select a Nickname Dictionary File' to select a nickname
              dictionary file from your own computer.
            </p>
            <p>
              - Click 'Go back' to select a different CSV file for
              deidentification
            </p>
          </IonText>
        </IonCardHeader>
        <IonCardContent>
          <IonButton onClick={() => loadNicknameDictionaryFile()}>
            Select a Nickname Dictionary File
          </IonButton>
          <br />
          <IonButton onClick={() => loadNicknameDictionaryFile(true)}>
            Use the Default Nickname Dictionary
          </IonButton>
          <IonButton
            fill="outline"
            onClick={() => exportDefaultNicknameDictionaryFile()}
          >
            Download the Default Nickname Dictionary
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
          <IonText>
            Clicking 'Save the Project File' will allow you to download a
            project file to your local computer that has been formatted to allow
            deidentification. Please save it somewhere accessible then click
            'Deidentify and review my Data'
          </IonText>
          <br />
          <IonButton onClick={async () => saveProjectFile()}>
            {processing ? "Processing..." : "Save the project file"}
          </IonButton>
          <br />
          <IonButton href="./#/local/review">
            Deidentify and Review my Data
          </IonButton>
          <br />
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
      const fileContent = await file?.text();
      try {
        const data = convertNicknameDictionaryFromCSVToObject(fileContent);
        setNicknameDictionary(data);
      } catch {
        alert("The file is invalid.");
      }
    }
  }

  async function exportDefaultNicknameDictionaryFile() {
    try {
      const responese = await fetch("./assets/nicknames.json");
      const dict = await responese.json();
      const text = convertNicknameDictionaryFromObjectToCSV(dict);
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

  function convertNicknameDictionaryFromCSVToObject(content: string) {
    const entries = csvParse(content);
    const dict: { [name: string]: string[] } = {};
    entries.forEach(({ name, nickname }) => {
      if (name && nickname) {
        if (!dict[name]) {
          dict[name] = [];
        }
        dict[name].push(nickname);
      }
    });
    return dict;
  }

  function convertNicknameDictionaryFromObjectToCSV(dict: {
    [name: string]: string[];
  }) {
    const entries = Object.entries(dict).flatMap(([name, nicknames]) =>
      nicknames.map((nickname) => ({ name, nickname }))
    );
    return csvFormat(entries);
  }

  async function loadDeidentifier() {
    pyodide = await (window as any).loadPyodide({
      indexURL: `${window.location.origin}${window.location.pathname.replace(
        /\/$/,
        ""
      )}/pyodide`,
    });
    const response = await fetch("./deidentifier.py");
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
              tags: (
                await deidentify(
                  epaRecord.text || "",
                  names,
                  nicknameDictionary
                )
              ).map((analyzerResult: { [x: string]: any }) => ({
                ...analyzerResult,
                name: analyzerResult["label"],
              })),
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
