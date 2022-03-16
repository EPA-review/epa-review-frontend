import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
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
import { csvFormat } from "d3-dsv";
import {
  checkmark,
  create,
  download,
  open,
  swapHorizontal,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import SelectMenu from "../components/SelectMenu";
import { anonymizeText } from "../utils/anonymizeText";
import { EntityType } from "../utils/entity-type";
import { EpaRecordForView, Tag } from "../utils/epa-record";
import * as xlsx from "xlsx";

import styles from "./LocalModeReviewDetail.module.css";

type ConfusionMatrix = {
  truePositive: number;
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;
};

const itemCountPerPage = 10;
const userId = "";

let fileHandle: any;
let selectPopoverValue = "";
let entityChangeHandler: (tagName: string) => void = () => {};

const LocalModeReviewDetail: React.FC = () => {
  const [file, setFile] = useState<any>();
  const [data, setData] = useState<EpaRecordForView[]>();
  const [page, setPage] = useState(1);
  const [shouldShowVideo, setShouldShowVideo] = useState(false);
  const [, forceUpdate] = useState({});

  const [presentSelectPopover, dismissSelectPopover] = useIonPopover(
    SelectMenu,
    {
      title: "Select a entity",
      options: ["None", ...Object.values(EntityType)],
      getValue: () => selectPopoverValue,
      valueChangeHandler: (tagName: string) => {
        entityChangeHandler(tagName);
        dismissSelectPopover();
      },
    }
  );

  useEffect(() => {
    if ("launchQueue" in window) {
      (window as any)["launchQueue"].setConsumer((launchParams: any) => {
        if (launchParams.files?.length > 0) {
          for (const fileHandle of launchParams.files) {
            openFile(fileHandle);
          }
        }
      });
    }
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="./#/local" />
          </IonButtons>
          <IonTitle>EPA Deidentification Review (Local Mode)</IonTitle>
          <IonButtons slot="end">
            <IonButton
              title="Export CSV"
              onClick={() => exportCSV("export", userId)}
            >
              <IonIcon icon={download}></IonIcon>
              Export CSV
            </IonButton>
            <IonButton
              title="Export XLSX"
              color="success"
              onClick={() => exportXLSX("export", userId)}
            >
              <IonIcon icon={download}></IonIcon>
              Export XLSX
            </IonButton>
            <IonButton title="Open" onClick={() => openFile()}>
              <IonIcon icon={open}></IonIcon>
              Open
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {!file && (
          <IonCard>
            <IonCardContent>
              <IonText>
                The formatted 'Project File' that you downloaded to your
                computer can be opened within this webpage and reviewed. To
                start, click the 'open' button in the top right corner of the
                page and select the formatted dataset you downloaded to your
                computer (it should have a .deid file format). This will display
                the EPA narratives from the file with names and pronouns
                identified to the best of our program's ability. Edits that you
                make to the deidentification within the review page will be
                saved within the '.deid' file on your desktop and can be opened
                again later for further review as needed. When you have
                completed your review and modification to the deidentification,
                select the 'download' button in the top right-hand corner to
                download a CSV containing your deidentified narrative data.
              </IonText>
              <br />
              <IonItem>
                <IonToggle
                  checked={shouldShowVideo}
                  onIonChange={({ detail }) =>
                    setShouldShowVideo(detail.checked)
                  }
                />
                <IonLabel>Show Video</IonLabel>
              </IonItem>
              <br />
              {shouldShowVideo && (
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/7r0H__HyHBk?start=158"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </IonCardContent>
          </IonCard>
        )}
        {file && !data && <h1>Data not loaded.</h1>}
        {file && data && (
          <>
            <IonText>
              Below you should see your narrative data with trainee names and
              pronouns highlighted for review. If you identify an error, select
              the yellow button to the right of the narrative to modify the
              deidentification of that narrative. You will then be able to click
              the word that was correctly or incorrectly identified as a name,
              nickname, or pronoun. Clicking on it will allow you to add or
              remove the label. When it has been edited to correct the error (or
              if it did not have any errors), click the green checkmark to the
              right of the narrative to identify that it has been completely
              deidentified. If you would like to toggle between the original
              tags and those that you have modified, you can do so by clicking
              the blue button. When you have completed your review and
              modification to the deidentification, select the 'download' button
              in the top right hand corner to download a CSV containing your
              deidentified narrative data.
            </IonText>
            {renderMainView()}
            <div style={{ height: "5rem" }} />
            {renderPageControl()}
            {renderCheckAllButton()}
          </>
        )}
      </IonContent>
    </IonPage>
  );

  function renderMainView() {
    return (
      <IonGrid>
        {data
          ?.slice(itemCountPerPage * (page - 1), itemCountPerPage * page)
          .map((epaRecord, i) => {
            const { userTags, showingModifiedTags = true, editing } = epaRecord;
            if (!userTags) {
              epaRecord.userTags = {};
            }
            return (
              <IonRow key={i}>
                <IonCol size="auto">
                  <IonCard
                    className={styles.card}
                    style={{
                      width: "5rem",
                      textAlign: "center",
                      padding: ".25rem",
                    }}
                  >
                    {data.indexOf(epaRecord) + 1}
                  </IonCard>
                </IonCol>
                <IonCol>
                  <IonCard className={styles.card}>
                    <IonCardContent>
                      <s-magic-text
                        ref={(el: HTMLSMagicTextElement) => {
                          if (el) {
                            configMaigcText(el, epaRecord);
                          }
                        }}
                      />
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                <IonCol size="auto">
                  <IonCard className={styles.card} style={{ width: "192px" }}>
                    <IonButton
                      color="primary"
                      fill={showingModifiedTags ? "solid" : "clear"}
                      title="Swap"
                      onClick={() => {
                        epaRecord.showingModifiedTags = !showingModifiedTags;
                        epaRecord.editing = false;
                        forceUpdate({});
                      }}
                    >
                      <IonIcon slot="icon-only" icon={swapHorizontal}></IonIcon>
                    </IonButton>
                    <IonButton
                      disabled={!showingModifiedTags}
                      color="warning"
                      fill={editing ? "solid" : "clear"}
                      title="Modify"
                      onClick={() => {
                        epaRecord.editing = !editing;
                        if (editing && userTags?.[userId]) {
                          epaRecord.currentUserTagCache = [...userTags[userId]];
                        } else {
                          if (userTags) {
                            userTags[userId] =
                              epaRecord.currentUserTagCache || [];
                          }
                        }
                        forceUpdate({});
                      }}
                    >
                      <IonIcon slot="icon-only" icon={create}></IonIcon>
                    </IonButton>
                    <IonButton
                      color="success"
                      fill={userTags?.[userId] && !editing ? "solid" : "clear"}
                      title="Submit"
                      onClick={() => submit(epaRecord)}
                    >
                      <IonIcon slot="icon-only" icon={checkmark}></IonIcon>
                    </IonButton>
                  </IonCard>
                </IonCol>
              </IonRow>
            );
          })}
      </IonGrid>
    );
  }

  function renderPageControl() {
    return (
      <IonFab
        className={styles["page-switch-fab-container"]}
        vertical="bottom"
        horizontal="center"
        slot="fixed"
      >
        <IonFabButton
          className={styles["page-switch-fab"]}
          disabled={page <= 1}
          onClick={() => setPage(+page - 1)}
        >
          {"<"}
        </IonFabButton>
        <IonFabButton className={styles["page-switch-fab"]} color="medium">
          <IonInput
            type="number"
            value={page}
            onIonBlur={({ detail }) => setPage(+(detail.target as any).value)}
          />
        </IonFabButton>
        <IonFabButton
          className={styles["page-switch-fab"]}
          disabled={page >= (data?.length || 0) / itemCountPerPage}
          onClick={() => setPage(+page + 1)}
        >
          {">"}
        </IonFabButton>
      </IonFab>
    );
  }

  function renderCheckAllButton() {
    return (
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton
          title="Check all on this page"
          disabled={
            !data
              ?.slice(itemCountPerPage * (page - 1), itemCountPerPage * page)
              ?.filter((datum) => !datum?.userTags?.[userId])?.[0]
          }
          color="success"
          onClick={() => {
            data
              ?.slice(itemCountPerPage * (page - 1), itemCountPerPage * page)
              ?.forEach((epaRecord) => submit(epaRecord));
          }}
        >
          <IonIcon icon={checkmark} style={{ pointerEvents: "none" }}></IonIcon>
        </IonFabButton>
      </IonFab>
    );
  }

  async function openFile(existingFileHandle?: any) {
    fileHandle = existingFileHandle;
    if (!fileHandle) {
      fileHandle = (await (window as any).showOpenFilePicker())?.[0];
    }
    const file = (await fileHandle.getFile()) as File;
    setFile(file);
    const fileContent = await file?.text();
    try {
      const data = JSON.parse(fileContent);
      setData(data);
    } catch {
      setData(undefined);
    }
  }

  async function configMaigcText(
    element: HTMLSMagicTextElement,
    epaRecord: EpaRecordForView
  ) {
    const {
      originalText,
      tags,
      userTags,
      showingModifiedTags = true,
      editing,
    } = epaRecord;
    element.text = originalText || "";
    element.tags = (
      (showingModifiedTags ? userTags?.[userId] || tags : tags) || []
    )?.map((tag) => ({
      ...tag,
      name: tag.score?.toString(),
      label: tag.name,
      style: {
        color: "var(--color)",
        background: tag.isUserSet ? "bisque" : "lightblue",
        borderRadius: "5px",
        padding: ".25em",
      },
      labelStyle: {
        background: "",
        color: "var(--color)",
        marginLeft: ".5em",
        fontWeight: "bold",
      },
    }));
    const clickHandler = (event: CustomEvent) => {
      const detail = (event as CustomEvent).detail;
      initializeUserTags(epaRecord, userId, tags || []);
      const currentUserTags = epaRecord.userTags?.[userId];
      const tag = currentUserTags?.find(
        (tag) => tag.start === detail.start && tag.end === detail.end
      );
      selectPopoverValue = tag?.name || "";
      entityChangeHandler = (tagName: string) => {
        if (tagName === "None") {
          if (epaRecord.userTags) {
            epaRecord.userTags[userId] = epaRecord.userTags[userId]?.filter(
              (filteringTag) => filteringTag !== tag
            );
          }
        } else {
          if (tag) {
            tag.name = tagName;
            tag.score = 1;
            tag.isUserSet = true;
          } else {
            currentUserTags?.push({
              start: detail.start,
              end: detail.end,
              name: tagName,
              score: 1,
              isUserSet: true,
            });
          }
        }
        dismissSelectPopover();
        forceUpdate({});
      };
      presentSelectPopover();
    };
    if (editing) {
      element.segmentHoverStyle = { background: "orange" };
      element.removeEventListener(
        "segmentClick",
        epaRecord.clickHandler as any
      );
      element.addEventListener("segmentClick", clickHandler as any);
      epaRecord.clickHandler = clickHandler;
    } else {
      element.segmentHoverStyle = {};
      element.removeEventListener(
        "segmentClick",
        epaRecord.clickHandler as any
      );
    }
  }

  async function submit(epaRecord: EpaRecordForView) {
    epaRecord.editing = false;
    initializeUserTags(epaRecord, userId, epaRecord.tags || []);
    epaRecord.userTags?.[userId]?.forEach((tag) => (tag.isUserSet = true));
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(obtainCleanedData()));
    await writable.close();
    forceUpdate({});
  }

  function initializeUserTags(
    epaRecord: EpaRecordForView,
    userId: string,
    tags: Tag[]
  ) {
    if (!epaRecord.userTags) {
      epaRecord.userTags = {};
    }
    if (!epaRecord?.userTags[userId]) {
      epaRecord.userTags[userId] = tags.map((tag) => ({
        ...tag,
        isUserSet: false,
      }));
    }
  }

  function obtainCleanedData() {
    return data?.map((epaRecord) => ({
      originalText: epaRecord.originalText,
      residentName: epaRecord.residentName,
      observerName: epaRecord.observerName,
      tags: epaRecord.tags,
      userTags: epaRecord.userTags,
    }));
  }

  async function exportCSV(datasetName: string, userId: string) {
    const currentData = data;

    const dataCount = currentData?.length || 0;
    const reviewedDataCount =
      currentData?.filter((epaRecord) => epaRecord.userTags?.[userId]).length ||
      0;
    if (dataCount > reviewedDataCount) {
      if (
        !window.confirm(
          `You have not yet checked all records (${reviewedDataCount} of ${dataCount} checked), are you sure you are ready to export?`
        )
      ) {
        return;
      }
    }
    const exportContent = currentData?.map((epaRecord, i) => ({
      index: i + 1,
      originalText: epaRecord.originalText,
      auto: anonymizeText(epaRecord.originalText || "", epaRecord.tags || []),
      user: anonymizeText(
        epaRecord.originalText || "",
        epaRecord.userTags?.[userId] || []
      ),
      ...(epaRecord.userTags?.[userId]
        ? generateConfusionMatrix(
            epaRecord.originalText || "",
            epaRecord.tags || [],
            epaRecord.userTags?.[userId] || []
          )
        : {}),
    }));
    const csv = csvFormat(exportContent || []);

    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: `${datasetName}-${new Date().toISOString()}`,
      types: [
        {
          description: "Comma-Separated Values File",
          accept: { "text/csv": [".csv"] },
        },
      ],
    });
    const writable = await fileHandle.createWritable();
    await writable.write(csv);
    await writable.close();
  }

  async function exportXLSX(datasetName: string, userId: string) {
    const currentData = data;

    const dataCount = currentData?.length || 0;
    const reviewedDataCount =
      currentData?.filter((epaRecord) => epaRecord.userTags?.[userId]).length ||
      0;
    if (dataCount > reviewedDataCount) {
      if (
        !window.confirm(
          `You have not yet checked all records (${reviewedDataCount} of ${dataCount} checked), are you sure you are ready to export?`
        )
      ) {
        return;
      }
    }
    const exportContent = currentData?.map((epaRecord, i) => ({
      index: i + 1,
      originalText: epaRecord.originalText,
      auto: anonymizeText(epaRecord.originalText || "", epaRecord.tags || []),
      user: anonymizeText(
        epaRecord.originalText || "",
        epaRecord.userTags?.[userId] || []
      ),
      ...(epaRecord.userTags?.[userId]
        ? generateConfusionMatrix(
            epaRecord.originalText || "",
            epaRecord.tags || [],
            epaRecord.userTags?.[userId] || []
          )
        : {}),
    }));
    const workbook = xlsx.utils.book_new();
    workbook.SheetNames.push("default");
    workbook.Sheets["default"] = xlsx.utils.json_to_sheet(exportContent || []);
    const workbookBuffer = xlsx.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: `${datasetName}-${new Date().toISOString()}`,
      types: [
        {
          description: "Comma-Separated Values File",
          accept: { "application/octet-stream": [".xlsx"] },
        },
      ],
    });
    const writable = await fileHandle.createWritable();
    await writable.write(workbookBuffer);
    await writable.close();
  }

  function generateConfusionMatrix(text: string, tags: Tag[], userTags: Tag[]) {
    const wordSplitRegEx = /\w+/g;
    const textWordCount =
      text
        .match(wordSplitRegEx)
        ?.map((d) => d.trim())
        .filter(Boolean).length ?? Number.NaN;
    const taggedItemCount =
      (tags?.length ?? 0) +
      (userTags?.filter(
        (userTag) => !tags?.find((tag) => checkTwoTagOverlaying(tag, userTag))
      )?.length ?? 0);

    return {
      truePositive:
        userTags?.filter((userTag) =>
          tags?.find((tag) => checkTwoTagsSame(tag, userTag))
        )?.length ?? Number.NaN,
      trueNegative: textWordCount - taggedItemCount ?? Number.NaN,
      falsePositive:
        tags?.filter(
          (tag) => !userTags?.find((userTag) => checkTwoTagsSame(tag, userTag))
        )?.length ?? Number.NaN,
      falseNegative:
        userTags?.filter(
          (userTag) => !tags?.find((tag) => checkTwoTagsSame(tag, userTag))
        )?.length ?? Number.NaN,
    } as ConfusionMatrix;
  }

  function checkTwoTagsSame(tag1: Tag, tag2: Tag) {
    return checkTwoTagOverlaying(tag1, tag2) && tag1.name === tag2.name;
  }

  function checkTwoTagOverlaying(tag1: Tag, tag2: Tag) {
    return tag1.start <= tag2.end && tag1.end >= tag2.start;
  }
};

export default LocalModeReviewDetail;
