import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonInput, IonPage, IonRow, IonTitle, IonToolbar, useIonPopover } from '@ionic/react';
import { person, checkmark, create, swapHorizontal, download } from "ionicons/icons";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import SelectMenu from '../components/SelectMenu';
import UserMenu from '../components/UserMenu';
import { EntityType, EntityTypeColorDict } from '../utils/entity-type';
import ServerInfo from '../utils/ServerInfo';

import styles from './ReviewDetail.module.css';

type EpaFeedback = {
  originalText: string,
  tags: { start: number, end: number, name: string, score: number }[],
  shouldReplaceTextsWithTags: boolean,
  isEditing: boolean,
  hasApproved: boolean,
  clickHandler: (event: Event) => void;
};

const itemCountPerPage = 30;

let selectPopoverValue = '';
let entityChangeHandler: (tagName: string) => void = () => { };

const Dashboard: React.FC = () => {
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
    async function obtainUser() {
      const response = await fetch(
        `${ServerInfo.SERVER_BASE_URL}/epa/fetch?groupTag=${groupTag}`,
        { credentials: 'include' }
      );
      let data: EpaFeedback[];
      if (response.ok && (data = await response.json())) {
        setData(data);
      }
    }
    obtainUser();
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
              title="Export"
              onClick={() => alert('Not implemented yet.')}
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
                  const { originalText, tags, shouldReplaceTextsWithTags, isEditing, hasApproved } = datum;
                  return (
                    <IonRow key={i}>
                      <IonCol>
                        <IonCard className={styles.card}>
                          <IonCardContent>
                            <s-magic-text ref={el => {
                              if (el) {
                                el.text = originalText;
                                el.tags = tags?.map(tag => {
                                  return ({
                                    start: tag.start,
                                    end: tag.end,
                                    name: tag.score.toString(),
                                    label: tag.name,
                                    style: { color: 'var(--color)', background: 'lightblue', borderRadius: '5px', padding: '.25em' },
                                    labelStyle: { background: '', color: 'var(--color)', marginLeft: '.5em', fontWeight: 'bold' }
                                  })
                                });
                                el.shouldReplaceTextWithTag = shouldReplaceTextsWithTags;
                                const clickHandler = (event: Event) => {
                                  const detail = (event as CustomEvent).detail;
                                  const tag = tags.find(tag => tag.start === detail.start && tag.end === detail.end);
                                  selectPopoverValue = tag?.name || '';
                                  entityChangeHandler = (tagName: string) => {
                                    if (tagName === 'None') {
                                      datum.tags = tags.filter(filteringTag => filteringTag !== tag);
                                    } else {
                                      if (tag) {
                                        tag.name = tagName;
                                      } else {
                                        tags.push({
                                          start: detail.start,
                                          end: detail.end,
                                          name: tagName,
                                          score: Number.NaN
                                        });
                                      }
                                    }
                                    forceUpdate({});
                                  };
                                  presentSelectPopover({ event: detail.innerEvent });
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
                            disabled
                            color="primary"
                            fill={shouldReplaceTextsWithTags ? 'solid' : 'clear'}
                            title="Swap"
                            onClick={() => {
                              datum.shouldReplaceTextsWithTags = !shouldReplaceTextsWithTags;
                              forceUpdate({});
                            }}
                          >
                            <IonIcon slot="icon-only" icon={swapHorizontal}></IonIcon>
                          </IonButton>
                          <IonButton
                            disabled={hasApproved}
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
                            disabled={hasApproved}
                            color="success"
                            fill={hasApproved ? 'solid' : 'clear'}
                            title="Approve"
                            onClick={() => {
                              datum.hasApproved = !hasApproved;
                              datum.isEditing = false;
                              forceUpdate({});
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

export default Dashboard;
