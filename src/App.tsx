import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import Review from './pages/Review';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import ReviewDetail from './pages/ReviewDetail';
import { useEffect, useState } from 'react';
import { applyTheme, getActualTheme } from './utils/theme';
import { determineIfSignedIn } from './utils/auth';

const App: React.FC = () => {
  const theme = getActualTheme();
  const [routerOutlet, setRouterOutlet] = useState<any>();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    async function generateRouterOutlet() {
      const hasSignedIn = await determineIfSignedIn();
      setRouterOutlet((
        <IonRouterOutlet>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
          <Route exact path="/home">
            {hasSignedIn ? <Redirect to="/upload" /> : <Home />}
          </Route>
          <Route exact path="/upload">
            {hasSignedIn ? <Upload /> : <Redirect to="/home" />}
          </Route>
          <Route exact path="/review">
            {hasSignedIn ? <Review /> : <Redirect to="/home" />}
          </Route>
          <Route exact path="/review/:groupTag">
            {hasSignedIn ? <ReviewDetail /> : <Redirect to="/home" />}
          </Route>
          <Route exact path="/dashboard">
            {hasSignedIn ? <Dashboard /> : <Redirect to="/home" />}
          </Route>
        </IonRouterOutlet>
      ));
    }
    generateRouterOutlet();
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        {routerOutlet}
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
