import { IonButton, IonContent, IonText } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { fetchUser, signOut } from "../utils/auth";
import { User } from "../utils/User";

import styles from './UserMenu.module.css';

const UserMenu: React.FC = () => {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    async function fetchAndSetUserInfo() {
      setUser(await fetchUser());
    }
    fetchAndSetUserInfo();
  }, []);

  return (
    <IonContent className={styles['main-container']}>
      <IonText>
        <h1>{user?.username}</h1>
        <h6>{user?.roleName}</h6>
      </IonText>
      <IonButton
        expand="block"
        fill="clear"
        onClick={() => signOut()}
      >Sign Out</IonButton>
    </IonContent>
  );
}

export default UserMenu;
