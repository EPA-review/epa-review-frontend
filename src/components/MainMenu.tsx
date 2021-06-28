import { IonGrid, IonRow, IonCol, IonButton } from "@ionic/react";
import React from "react";

import styles from './MainMenu.module.css';

const MainMenu: React.FC = () => {
  const items = [
    'Upload',
    'Review',
    'Dashboard'
  ];

  return (
    <IonGrid>
      <IonRow>
        {
          items.map((item, i) => (
            <IonCol key={i} size="auto">
              <IonButton
                className={styles['item-button']}
                color="medium"
                routerLink={convertNameToPath(item)}
              >{item}</IonButton>
            </IonCol>
          ))
        }
      </IonRow>
    </IonGrid>
  );
}

export default MainMenu;

function convertNameToPath(name: string) {
  return name.replace(' ', '-').toLowerCase();
}