import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet } from "@ionic/react";
import { IonReactHashRouter } from "@ionic/react-router";
import Home from "./pages/Home";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import Review from "./pages/Review";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import ReviewDetail from "./pages/ReviewDetail";
import UserManagement from "./pages/UserManagement";
import { useEffect, useState } from "react";
import { applyTheme, getActualTheme } from "./utils/theme";
import { fetchUser } from "./utils/auth";
import NicknameManagement from "./pages/NicknameManagement";
import LocalModeLoadNew from "./pages/LocalModeLoadNew";
import LocalMode from "./pages/LocalMode";
import LocalModeReviewDetail from "./pages/LocalModeReviewDetail";
import NewLoadDataset from "./pages/NewLoadDataset";

const App: React.FC = () => {
  const theme = getActualTheme();
  const [routerOutlet, setRouterOutlet] = useState<any>();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    async function generateRouterOutlet() {
      const signedInUser = await fetchUser();
      sessionStorage.setItem("userId", signedInUser?._id || "");
      setRouterOutlet(
        <IonRouterOutlet>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
          <Route exact path="/home">
            {signedInUser ? <Redirect to="/upload" /> : <Home />}
          </Route>
          <Route exact path="/upload">
            {signedInUser ? <Upload /> : <Redirect to="/home" />}
          </Route>
          <Route exact path="/review">
            {signedInUser ? <Review /> : <Redirect to="/home" />}
          </Route>
          <Route exact path="/review/:groupTag">
            {signedInUser ? <ReviewDetail /> : <Redirect to="/home" />}
          </Route>
          <Route exact path="/dashboard">
            {signedInUser ? <Dashboard /> : <Redirect to="/home" />}
          </Route>
          <Route exact path="/dashboard">
            {signedInUser ? <Dashboard /> : <Redirect to="/home" />}
          </Route>
          <Route exact path="/user-management">
            {signedInUser?.roleName === "super" ||
            signedInUser?.roleName === "admin" ? (
              <UserManagement />
            ) : (
              <Redirect to="/home" />
            )}
          </Route>
          <Route exact path="/nickname-management">
            {signedInUser?.roleName === "super" ||
            signedInUser?.roleName === "admin" ? (
              <NicknameManagement />
            ) : (
              <Redirect to="/home" />
            )}
          </Route>
          <Route exact path="/local">
            <LocalMode />
          </Route>
          <Route exact path="/local/new">
            <LocalModeLoadNew />
          </Route>
          <Route exact path="/local/review">
            <LocalModeReviewDetail />
          </Route>
          <Route exact path="/new/load">
            <NewLoadDataset />
          </Route>
        </IonRouterOutlet>
      );
    }
    generateRouterOutlet();
  }, []);

  return (
    <IonApp>
      <IonReactHashRouter>{routerOutlet}</IonReactHashRouter>
    </IonApp>
  );
};

export default App;
