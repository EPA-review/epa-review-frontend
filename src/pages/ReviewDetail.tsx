import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonInput, IonPage, IonRow, IonTitle, IonToolbar, useIonPopover } from '@ionic/react';
import { csvFormat } from 'd3-dsv';
import { person, checkmark, create, swapHorizontal, download } from "ionicons/icons";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import SelectMenu from '../components/SelectMenu';
import UserMenu from '../components/UserMenu';
import { anonymizeText } from '../utils/anonymizeText';
import { EntityType } from '../utils/entity-type';
import ServerInfo from '../utils/ServerInfo';

import styles from './ReviewDetail.module.css';

type Tag = {
  start: number;
  end: number;
  name: string;
  score: number;
  isUserSet?: boolean | undefined;
};

type ConfusionMatrix = {
  truePositive: number,
  trueNegative: number,
  falsePositive: number,
  falseNegative: number
};

type EpaFeedback = {
  _id: string;
  originalText: string,
  tags: Tag[],
  userTags: { [user: string]: { start: number, end: number, name: string, score: number, isUserSet: boolean }[] },
  isShowingModifiedTags: boolean,
  isEditing: boolean,
  confusionMatrix: ConfusionMatrix,
  clickHandler: (event: Event) => void;
};

const itemCountPerPage = 10;

let selectPopoverValue = '';
let entityChangeHandler: (tagName: string) => void = () => { };

const Dashboard: React.FC = () => {
  const userId = sessionStorage.getItem('userId') || '';

  const { groupTag } = useParams<{ groupTag: string }>();
  const [data, setData] = useState<EpaFeedback[]>();
  const [page, setPage] = useState(1);
  const [, forceUpdate] = useState({});
  const [presentUserMenuPopover, dismissUserMenuPopover] = useIonPopover(UserMenu, { onHide: () => dismissUserMenuPopover() });
  const [presentSelectPopover, dismissSelectPopover] = useIonPopover(SelectMenu, {
    title: 'Select a entity',
    options: ['None', ...Object.values(EntityType)],
    getValue: () => selectPopoverValue,
    valueChangeHandler: (tagName: string) => {
      entityChangeHandler(tagName);
      dismissSelectPopover();
    }
  });

  useEffect(() => {
    async function obtainData() {
      const data = await fetchData(groupTag);
      data?.forEach(datum => datum.confusionMatrix = generateConfusionMatrix(datum.originalText, datum.tags, datum.userTags?.[userId]));
      setData(data);
    }
    obtainData();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/review"></IonBackButton>
          </IonButtons>
          <IonTitle>{groupTag}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              title="Export CSV"
              onClick={() => exportCSV(groupTag, userId)}
            >
              <IonIcon slot="icon-only" icon={download} ></IonIcon>
            </IonButton>
            <IonButton
              title="User"
              onClick={event => presentUserMenuPopover({ event: event.nativeEvent })}
            >
              <IonIcon slot="icon-only" icon={person} ></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          {
            data ?
              data
                .slice(itemCountPerPage * (page - 1), itemCountPerPage * page)
                .map((datum, i) => {
                  const { originalText, tags, userTags, isShowingModifiedTags = true, isEditing } = datum;
                  if (!userTags) {
                    datum.userTags = {};
                  }
                  return (
                    <IonRow key={i}>
                      <IonCol>
                        <IonCard className={styles.card} title={JSON.stringify(datum.confusionMatrix)}>
                          <IonCardContent>
                            <s-magic-text ref={async el => {
                              if (el) {
                                el.text = originalText;
                                el.tags = (isShowingModifiedTags ? (userTags?.[userId] || tags) : tags)?.map(tag => {
                                  return ({
                                    start: tag.start,
                                    end: tag.end,
                                    name: tag.score?.toString(),
                                    label: tag.name,
                                    style: { color: 'var(--color)', background: tag.isUserSet ? 'bisque' : 'lightblue', borderRadius: '5px', padding: '.25em' },
                                    labelStyle: { background: '', color: 'var(--color)', marginLeft: '.5em', fontWeight: 'bold' }
                                  })
                                });
                                const clickHandler = (event: Event) => {
                                  const detail = (event as CustomEvent).detail;
                                  initializeUserTags(datum, userId, tags);
                                  const currentuserTags = datum.userTags[userId];
                                  const tag = currentuserTags.find(tag => tag.start === detail.start && tag.end === detail.end);
                                  selectPopoverValue = tag?.name || '';
                                  entityChangeHandler = (tagName: string) => {
                                    if (tagName === 'None') {
                                      datum.userTags[userId] = datum.userTags[userId].filter(filteringTag => filteringTag !== tag);
                                    } else {
                                      if (tag) {
                                        tag.name = tagName;
                                        tag.score = 1;
                                        tag.isUserSet = true;
                                      } else {
                                        currentuserTags.push({
                                          start: detail.start,
                                          end: detail.end,
                                          name: tagName,
                                          score: 1,
                                          isUserSet: true
                                        });
                                      }
                                    }
                                    dismissSelectPopover();
                                    forceUpdate({});
                                  };
                                  presentSelectPopover();
                                };
                                if (isEditing) {
                                  el.segmentHoverStyle = { background: 'orange' };
                                  el.removeEventListener('segmentClick', datum.clickHandler);
                                  el.addEventListener('segmentClick', clickHandler);
                                  datum.clickHandler = clickHandler;
                                } else {
                                  el.segmentHoverStyle = {};
                                  el.removeEventListener('segmentClick', datum.clickHandler);
                                }
                              }
                            }}></s-magic-text>
                          </IonCardContent>
                        </IonCard>
                      </IonCol>
                      <IonCol size="auto">
                        <IonCard className={styles.card} style={{ width: '192px' }}>
                          <IonButton
                            color="primary"
                            fill={isShowingModifiedTags ? 'solid' : 'clear'}
                            title="Swap"
                            onClick={() => {
                              datum.isShowingModifiedTags = !isShowingModifiedTags;
                              datum.isEditing = false;
                              forceUpdate({});
                            }}
                          >
                            <IonIcon slot="icon-only" icon={swapHorizontal}></IonIcon>
                          </IonButton>
                          <IonButton
                            disabled={!isShowingModifiedTags}
                            color="warning"
                            fill={isEditing ? 'solid' : 'clear'}
                            title="Modify"
                            onClick={() => {
                              datum.isEditing = !isEditing;
                              forceUpdate({});
                            }}
                          >
                            <IonIcon slot="icon-only" icon={create}></IonIcon>
                          </IonButton>
                          <IonButton
                            color="success"
                            fill={datum.userTags?.[userId] ? 'solid' : 'clear'}
                            title="Submit"
                            onClick={async () => {
                              datum.isEditing = false;
                              initializeUserTags(datum, userId, tags);
                              datum.confusionMatrix = generateConfusionMatrix(originalText, tags, userTags?.[userId]);
                              const tagsToUpload = datum.userTags[userId].map(tag => ({
                                start: tag.start,
                                end: tag.end,
                                name: tag.name,
                                score: tag.score,
                                isUserSet: tag.isUserSet
                              }));
                              const response = await fetch(
                                `${ServerInfo.SERVER_BASE_URL}/epa/user-tags?_id=${datum._id}`,
                                {
                                  method: 'PUT',
                                  credentials: 'include',
                                  headers: {
                                    'Content-type': 'application/json'
                                  },
                                  body: JSON.stringify(tagsToUpload)
                                }
                              );
                              if (response.ok) {
                                forceUpdate({});
                              }
                            }}
                          >
                            <IonIcon slot="icon-only" icon={checkmark}></IonIcon>
                          </IonButton>
                        </IonCard>
                      </IonCol>
                    </IonRow>
                  );
                }) :
              'Loading data...'
          }
        </IonGrid>
        <IonFab
          className={styles['page-switch-fab-container']}
          vertical="bottom"
          horizontal="center"
          slot="fixed"
        >
          <IonFabButton
            className={styles['page-switch-fab']}
            disabled={page <= 1}
            onClick={() => setPage(+page - 1)}
          >{'<'}</IonFabButton>
          <IonFabButton
            className={styles['page-switch-fab']}
            color="medium"
          >
            <IonInput
              type="number"
              value={page}
              onIonBlur={({ detail }) => setPage(+(detail.target as any).value)}
            />
          </IonFabButton>
          <IonFabButton
            className={styles['page-switch-fab']}
            disabled={page >= (data?.length || 0) / itemCountPerPage}
            onClick={() => setPage(+page + 1)}
          >{'>'}</IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage >
  );
};

async function exportCSV(groupTag: string, userId: string) {
  const currentData = await fetchData(groupTag);

  debugger
  const exportContent = currentData?.map(datum => ({
    originalText: datum.originalText,
    auto: anonymizeText(datum.originalText, datum.tags),
    user: anonymizeText(datum.originalText, datum.userTags?.[userId]),
    ...generateConfusionMatrix(datum.originalText, datum.tags, datum.userTags?.[userId])
  }));
  const csv = csvFormat(exportContent || []);

  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
  element.setAttribute('download', `${new Date().toISOString()}.csv`);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function generateConfusionMatrix(text: string, tags: Tag[], userTags: Tag[]) {
  const wordSplitRegEx = /\w+/g;
  const textWordCount = text.match(wordSplitRegEx)?.map(d => d.trim()).filter(Boolean).length ?? Number.NaN;
  const taggedItemCount = (tags?.length ?? 0) + (userTags?.filter(userTag => !tags?.find(tag => checkTwoTagOverlaying(tag, userTag)))?.length ?? 0);

  return ({
    truePositive: userTags?.filter(userTag => tags?.find(tag => checkTwoTagsSame(tag, userTag)))?.length ?? Number.NaN,
    trueNegative: (textWordCount - taggedItemCount) ?? Number.NaN,
    falsePositive: tags?.filter(tag => !userTags?.find(userTag => checkTwoTagsSame(tag, userTag)))?.length ?? Number.NaN,
    falseNegative: userTags?.filter(userTag => !tags?.find(tag => checkTwoTagsSame(tag, userTag)))?.length ?? Number.NaN
  }) as ConfusionMatrix;
}

function checkTwoTagsSame(tag1: Tag, tag2: Tag) {
  return checkTwoTagOverlaying(tag1, tag2) && tag1.name === tag2.name;
}

function checkTwoTagOverlaying(tag1: Tag, tag2: Tag) {
  return tag1.start <= tag2.end && tag1.end >= tag2.start;
}

function initializeUserTags(
  datum: EpaFeedback,
  userId: string,
  tags: { start: number; end: number; name: string; score: number; isUserSet?: boolean | undefined; }[]
) {
  if (!datum.userTags) {
    datum.userTags = {};
  }
  if (!datum?.userTags[userId]) {
    datum.userTags[userId] = tags.map(tag => ({ ...tag, isUserSet: false }));
  }
}

async function fetchData(groupTag: string) {
  const response = await fetch(
    `${ServerInfo.SERVER_BASE_URL}/epa/fetch?groupTag=${groupTag}`,
    { credentials: 'include' }
  );
  let data: EpaFeedback[];
  if (response.ok && (data = await response.json())) {
    return data;
  }
}

export default Dashboard;
