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
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import { csvFormat, csvParse, DSVRowArray } from "d3-dsv";
import { person } from "ionicons/icons";
import { useEffect, useState } from "react";
import { FeedbackGroup, Results, Tag } from "../utils/new-data-structure";

let pyodide: any;
let pythonDeidentifier: any;

const Dashboard: React.FC = () => {
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

  useEffect(() => {
    loadDeidentifier();
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
            <IonButton title="User">
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
              Title of the columns containing narrative feedback (split by comma
              without space)
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
              Title of the column containing trainee names
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
              Title of the column containing observer names
            </IonLabel>
            <IonInput
              disabled={disabled}
              value={observerNameColumns.join(",")}
              onIonChange={({ detail }) =>
                setObserverNameColumns(detail.value?.split(",") || [])
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
          <IonButton
            disabled={disabled}
            onClick={async () => saveProjectFile()}
          >
            {processing
              ? "Processing..."
              : "Deidentify and save the project file"}
          </IonButton>
          <br />
          <IonButton disabled={true} href="">
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
      const response = await fetch("./assets/nicknames.json");
      setNameDictionary(await response.json());
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
      const responese = await fetch("./assets/nicknames.json");
      const dict = await responese.json();
      const text = convertNameDictionaryFromObjectToCSV(dict);
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

  function convertNameDictionaryFromObjectToCSV(dict: {
    [name: string]: string[];
  }) {
    const entries = Object.entries(dict).flatMap(([name, nicknames]) =>
      nicknames.map((nickname) => ({ name, nickname }))
    );
    return csvFormat(entries);
  }

  async function saveProjectFile() {
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
      const result = await process();
      await writable.write(JSON.stringify(result));
      await writable.close();
      alert("Deidentification finished and the project file is saved.");
      setProcessing(false);
    }, 100);
  }

  async function process() {
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
      nameDictionary,
      results,
    };
  }

  async function loadDeidentifier() {
    if (!pyodide) {
      pyodide = await (window as any).loadPyodide({
        indexURL: `${window.location.origin}${window.location.pathname.replace(
          /\/$/,
          ""
        )}/pyodide`,
      });
    }
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
};

export default Dashboard;
