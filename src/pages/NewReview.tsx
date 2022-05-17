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
  IonList,
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
import {
  DeidData,
  Feedback,
  FeedbackGroup,
  Tag,
} from "../utils/new-data-structure";
import * as xlsx from "xlsx";

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

const Dashboard: React.FC = () => {
  const [file, setFile] = useState<any>();
  const [data, setData] = useState<DeidData>();
  const [page, setPage] = useState(1);
  const [shouldShowVideo, setShouldShowVideo] = useState(false);

  const [, forceUpdateHelper] = useState({});
  const forceUpdate = () => forceUpdateHelper({});

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
  const [presentExportingPopover, dismissExportingPopover] = useIonPopover(
    () => (
      <IonList>
        <IonItem
          button
          onClick={() => {
            exportDeidentifiedOriginalFile(userId);
            dismissExportingPopover();
          }}
        >
          Deidentified version of the original file
        </IonItem>
        <IonItem
          button
          onClick={() => {
            exportResearchFile(userId);
            dismissExportingPopover();
          }}
        >
          Research file
        </IonItem>
      </IonList>
    )
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

  const results = data?.results;
  const currentPageFeedbackGroups = results?.feedbackGroups?.slice(
    itemCountPerPage * (page - 1),
    itemCountPerPage * page
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`${process.env.PUBLIC_URL}/new`} />
          </IonButtons>
          <IonTitle>Review</IonTitle>
          <IonButtons slot="end">
            <IonButton
              title="Export"
              onClick={(event) =>
                presentExportingPopover({ event: event as any })
              }
            >
              <IonIcon slot="icon-only" icon={download}></IonIcon>
            </IonButton>
            <IonButton title="Open" onClick={() => openFile()}>
              <IonIcon slot="icon-only" icon={open}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {renderTips()}
        {renderItems()}
        {renderPageControl()}
        {renderCheckAllButton()}
      </IonContent>
    </IonPage>
  );

  function renderCheckAllButton() {
    return (
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton
          title="Check all on this page"
          disabled={currentPageFeedbackGroups
            ?.map((feedbackGroup) =>
              determineFeedbackGroupReviewed(feedbackGroup)
            )
            .every((d) => d)}
          color="success"
          onClick={() => {
            currentPageFeedbackGroups?.forEach((feedbackGroup) =>
              feedbackGroup?.feedbacks?.forEach((feedback) => submit(feedback))
            );
          }}
        >
          <IonIcon icon={checkmark} style={{ pointerEvents: "none" }}></IonIcon>
        </IonFabButton>
      </IonFab>
    );
  }

  function renderPageControl() {
    return (
      <IonFab
        vertical="bottom"
        horizontal="center"
        slot="fixed"
        style={{ transform: "translateX(-50%)" }}
      >
        <IonFabButton
          disabled={page <= 1}
          style={{ display: "inline-block" }}
          onClick={() => setPage(+page - 1)}
        >
          {"<"}
        </IonFabButton>
        <IonFabButton color="medium" style={{ display: "inline-block" }}>
          <IonInput
            type="number"
            value={page}
            onIonBlur={({ detail }) => setPage(+(detail.target as any).value)}
          />
        </IonFabButton>
        <IonFabButton
          disabled={
            page >= (results?.feedbackGroups?.length || 0) / itemCountPerPage
          }
          style={{ display: "inline-block" }}
          onClick={() => setPage(+page + 1)}
        >
          {">"}
        </IonFabButton>
      </IonFab>
    );
  }

  function renderItems() {
    return (
      <IonGrid>
        {currentPageFeedbackGroups?.map((feedbackGroup, i) => (
          <IonRow key={i}>
            <IonCol size="auto">
              <IonCard>
                <IonCardContent>
                  <IonText
                    color={
                      feedbackGroup.feedbacks.every(
                        ({ userTagsDict, editing }) =>
                          userTagsDict?.[userId] && !editing
                      )
                        ? "success"
                        : ""
                    }
                  >
                    {(page - 1) * itemCountPerPage + i}
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol>
              {feedbackGroup?.feedbacks?.map((feedback, i) => {
                if (feedback.showingModifiedTags === undefined) {
                  feedback.showingModifiedTags = true;
                }
                return (
                  <IonRow key={i}>
                    <IonCol>
                      <IonCard>
                        <IonCardContent>
                          <s-magic-text
                            ref={(el: HTMLSMagicTextElement) => {
                              if (el) {
                                configMagicText(el, feedback);
                              }
                            }}
                          />
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                    <IonCol size="auto">
                      <IonCard style={{ width: "auto" }}>
                        <IonButton
                          color="primary"
                          fill={
                            feedback?.showingModifiedTags ? "solid" : "clear"
                          }
                          title="Toggle auto/user labels"
                          onClick={() => {
                            feedback.showingModifiedTags =
                              !feedback?.showingModifiedTags;
                            feedback.editing = false;
                            forceUpdate();
                          }}
                        >
                          <IonIcon
                            slot="icon-only"
                            icon={swapHorizontal}
                          ></IonIcon>
                        </IonButton>
                        <IonButton
                          color="warning"
                          fill={feedback.editing ? "solid" : "clear"}
                          title="Edit"
                          onClick={() => {
                            feedback.editing = !feedback?.editing;
                            if (
                              feedback.editing &&
                              feedback?.userTagsDict?.[userId]
                            ) {
                              feedback.currentUserTagsBackup = [
                                ...feedback?.userTagsDict[userId],
                              ];
                            } else {
                              if (feedback?.userTagsDict) {
                                feedback.userTagsDict[userId] =
                                  feedback.currentUserTagsBackup;
                              }
                            }
                            forceUpdate();
                          }}
                        >
                          <IonIcon slot="icon-only" icon={create}></IonIcon>
                        </IonButton>
                        <IonButton
                          color="success"
                          fill={
                            determineFeedbackReviewed(feedback) &&
                            !feedback.editing
                              ? "solid"
                              : "clear"
                          }
                          title="Submit"
                          onClick={() => submit(feedback)}
                        >
                          <IonIcon slot="icon-only" icon={checkmark}></IonIcon>
                        </IonButton>
                      </IonCard>
                    </IonCol>
                  </IonRow>
                );
              })}
            </IonCol>
          </IonRow>
        ))}
        <IonRow style={{ height: "5rem" }}></IonRow>
      </IonGrid>
    );
  }

  function renderTips() {
    switch (true) {
      case !file:
        return (
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
        );
      case !data:
        return <h1>Data not loaded.</h1>;
      default:
        return (
          <IonCard>
            <IonCardContent>
              <IonText>
                Below you should see your narrative data with trainee names and
                pronouns highlighted for review. If you identify an error,
                select the yellow button to the right of the narrative to modify
                the deidentification of that narrative. You will then be able to
                click the word that was correctly or incorrectly identified as a
                name, nickname, or pronoun. Clicking on it will allow you to add
                or remove the label. When it has been edited to correct the
                error (or if it did not have any errors), click the green
                checkmark to the right of the narrative to identify that it has
                been completely deidentified. If you would like to toggle
                between the original tags and those that you have modified, you
                can do so by clicking the blue button. When you have completed
                your review and modification to the deidentification, select the
                'download' button in the top right hand corner to download a CSV
                containing your deidentified narrative data.
              </IonText>
            </IonCardContent>
          </IonCard>
        );
    }
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

  function configMagicText(element: HTMLSMagicTextElement, feedback: Feedback) {
    const { originalText, tags, userTagsDict, showingModifiedTags } = feedback;
    element.text = originalText;
    element.tags = (
      (showingModifiedTags ? userTagsDict?.[userId] || tags : tags) || []
    )?.map((tag: any) => ({
      ...tag,
      name: "...",
      style: {
        color: "var(--color)",
        background: tag.edited ? "bisque" : "lightblue",
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
      const detail = event.detail;
      initializeUserTagsDict(feedback, userId, tags || []);
      const currentUserTags = feedback.userTagsDict?.[userId];
      const tag = currentUserTags?.find(
        (tag) => tag.start === detail.start && tag.end === detail.end
      );
      selectPopoverValue = tag?.label || "";
      entityChangeHandler = (tagName: string) => {
        if (tagName === "None") {
          if (feedback.userTagsDict) {
            feedback.userTagsDict[userId] = feedback.userTagsDict[
              userId
            ]?.filter((filteringTag) => filteringTag !== tag);
          }
        } else {
          if (tag) {
            tag.label = tagName;
            tag.edited = true;
          } else {
            currentUserTags?.push({
              start: detail.start,
              end: detail.end,
              label: tagName,
              edited: true,
            });
          }
        }
        dismissSelectPopover();
        forceUpdate();
      };
      presentSelectPopover();
    };

    if (feedback.editing) {
      element.segmentHoverStyle = { background: "orange" };
      element.removeEventListener("segmentClick", feedback.clickHandler as any);
      element.addEventListener("segmentClick", clickHandler as any);
      feedback.clickHandler = clickHandler;
    } else {
      element.segmentHoverStyle = {};
      element.removeEventListener("segmentClick", feedback.clickHandler as any);
    }
  }

  async function submit(feedback: Feedback) {
    feedback.editing = false;
    initializeUserTagsDict(feedback, userId, feedback.tags || []);
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(obtainCleanedData()));
    await writable.close();
    forceUpdate();
  }

  function initializeUserTagsDict(
    feedback: Feedback,
    userId: string,
    tags: Tag[]
  ) {
    if (!feedback.userTagsDict) {
      feedback.userTagsDict = {};
    }
    if (!feedback?.userTagsDict[userId]) {
      feedback.userTagsDict[userId] = tags.map((tag) => ({
        ...tag,
        edited: false,
      }));
    }
  }

  function obtainCleanedData() {
    return {
      ...data,
      results: {
        ...results,
        feedbackGroups: results?.feedbackGroups?.map((feedbackGroup) => ({
          feedbacks: feedbackGroup?.feedbacks?.map(
            (feedback) =>
              ({
                originalText: feedback.originalText,
                tags: feedback.tags,
                userTagsDict: feedback.userTagsDict,
              } as Feedback)
          ),
        })),
      },
    };
  }

  async function exportDeidentifiedOriginalFile(userId: string) {
    if (confirmIfNotAllRecordsAreReviewed()) {
      const deidentifiedData = data?.rawData?.map((record, recordIndex) => {
        const result = record;
        data?.config?.observerNameColumns?.forEach(
          (columnName) => (result[columnName] = recordIndex.toString())
        );
        data?.config?.residentNameColumns?.forEach(
          (columnName) => (result[columnName] = recordIndex.toString())
        );
        data?.config?.feedbackColumns?.forEach((columnName, columnIndex) => {
          const feedback =
            data?.results?.feedbackGroups?.[recordIndex]?.feedbacks?.[
              columnIndex
            ];
          result[columnName] = anonymizeText(
            result?.[columnName] || "",
            feedback?.userTagsDict?.[userId].map((tag) => ({
              ...tag,
            })) || []
          );
        });
        return result;
      });
      const csvString = csvFormat(deidentifiedData || []);

      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: `export-${new Date().toISOString()}`,
        types: [
          {
            description: "Comma-Separated Values File",
            accept: { "text/csv": [".csv"] },
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(csvString);
      await writable.close();
    }
  }

  async function exportResearchFile(userId: string) {
    if (confirmIfNotAllRecordsAreReviewed()) {
      const exportContent = results?.feedbackGroups?.flatMap(
        (feedbackGroup, groupIndex) =>
          feedbackGroup?.feedbacks?.map((feedback, feedbackIndex) => ({
            groupIndex,
            feedbackIndex,
            originalText: feedback?.originalText,
            auto: anonymizeText(
              feedback?.originalText || "",
              feedback?.tags || []
            ),
            user: anonymizeText(
              feedback?.originalText || "",
              feedback?.userTagsDict?.[userId] || []
            ),
            ...(feedback?.userTagsDict?.[userId]
              ? generateConfusionMatrix(
                  feedback?.originalText || "",
                  feedback?.tags || [],
                  feedback?.userTagsDict?.[userId] || []
                )
              : {}),
          }))
      );
      const workbook = xlsx.utils.book_new();
      workbook.SheetNames.push("default");
      workbook.Sheets["default"] = xlsx.utils.json_to_sheet(
        exportContent || []
      );
      const workbookBuffer = xlsx.write(workbook, {
        bookType: "xlsx",
        type: "buffer",
      });

      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: `export-${new Date().toISOString()}`,
        types: [
          {
            description: "Microsoft Excel Worksheet",
            accept: { "application/octet-stream": [".xlsx"] },
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(workbookBuffer);
      await writable.close();
    }
  }

  function confirmIfNotAllRecordsAreReviewed() {
    const feedbackGroups = results?.feedbackGroups;
    const feedbackGroupCount = feedbackGroups?.length || 0;
    const reviewedFeedbackGroupCount =
      feedbackGroups
        ?.map((feedbackGroup) => determineFeedbackGroupReviewed(feedbackGroup))
        ?.filter(Boolean)?.length || 0;
    if (feedbackGroupCount > reviewedFeedbackGroupCount) {
      return window.confirm(
        `You have not yet checked all records (${reviewedFeedbackGroupCount} of ${feedbackGroupCount} checked), are you sure you are ready to export?`
      );
    } else {
      return true;
    }
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
      trueNegative:
        text.length === 0 ? 0 : textWordCount - taggedItemCount ?? Number.NaN,
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
    return checkTwoTagOverlaying(tag1, tag2) && tag1.label === tag2.label;
  }

  function checkTwoTagOverlaying(tag1: Tag, tag2: Tag) {
    return tag1.start <= tag2.end && tag1.end >= tag2.start;
  }

  function determineFeedbackGroupReviewed(feedbackGroup: FeedbackGroup) {
    return feedbackGroup?.feedbacks
      ?.map((feedback) => determineFeedbackReviewed(feedback))
      ?.every(Boolean);
  }

  function determineFeedbackReviewed(feedback: Feedback) {
    return !!feedback?.userTagsDict?.[userId];
  }
};

export default Dashboard;
