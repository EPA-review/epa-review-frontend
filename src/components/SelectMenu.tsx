import { IonContent, IonItem, IonLabel, IonList, IonListHeader, IonRadio, IonRadioGroup } from "@ionic/react";
import React from "react";

const SelectMenu: React.FC<{ title: string, options: string[], getValue: () => string, valueChangeHandler: (value: string) => void }> = ({ title, options, getValue, valueChangeHandler }) => {
  return (
    <IonContent>
      <IonList>
        <IonRadioGroup value={getValue()} onIonChange={e => valueChangeHandler(e.detail.value)}>
          <IonListHeader>
            <IonLabel>{title}</IonLabel>
          </IonListHeader>

          {
            options?.map(option => (
              <IonItem key={option}>
                <IonLabel>{option}</IonLabel>
                <IonRadio slot="start" value={option} />
              </IonItem>
            ))
          }
        </IonRadioGroup>
      </IonList>
    </IonContent>
  );
}

export default SelectMenu;
