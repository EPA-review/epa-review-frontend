import { IonGrid, IonRow, IonCol, IonButton } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { fetchUser } from "../utils/auth";
import { User } from "../utils/User";

import styles from './MainMenu.module.css';

const MainMenu: React.FC<{
  onHide: () => void;
}> = ({ onHide }) => {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    async function fetchAndSetUserInfo() {
      setUser(await fetchUser());
    }
    fetchAndSetUserInfo();
  }, []);

  const items = [
    'Upload',
    'Review',
    // 'Dashboard'
  ];

  if(user?.roleName === 'super' || user?.roleName === 'admin') {
    items.push('User Management');
  }

  return (
    <IonGrid>
      <IonRow>
        {
          items.map((item, i) => (
            <IonCol key={i} size="auto">
              <IonButton
                className={styles['item-button']}
                color="medium"
                href={convertNameToPath(item)} onClick={onHide}
              ><span>{item}</span></IonButton>
            </IonCol>
          ))
        }
      </IonRow>
    </IonGrid>
  );
}

export default MainMenu;

function convertNameToPath(name: string) {
  return './#/'+(name.replace(' ', '-').toLowerCase());
}
