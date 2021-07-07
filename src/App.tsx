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
import { useEffect } from 'react';
import { applyTheme, getActualTheme } from './utils/theme';

const App: React.FC = () => {
  const theme = getActualTheme();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
          <Route exact path="/home">
            <Home />
          </Route>
          <Route exact path="/upload">
            <Upload />
          </Route>
          <Route exact path="/review">
            <Review />
          </Route>
          <Route exact path="/review/:groupTag">
            <ReviewDetail />
          </Route>
          <Route exact path="/dashboard">
            <Dashboard />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
