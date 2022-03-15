import { IonAccordion, IonAccordionGroup, IonAlert, IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import { stat } from 'fs';
import React from 'react';
import { getParkingSpacesApi, putItemApi } from '../api';
import ExploreContainer from '../components/ExploreContainer';
import ParkingSpace from '../models/ParkingSpace';
import './Home.css';
import { useStyles } from './styles';


const Home: React.FC = () => {
  const classes = useStyles();
  const [username, setUsername] = React.useState<string>("");
  const [nextScreen, setNextScreen] = React.useState<boolean>(false);
  const [parkingSpaces, setParkingSpaces] = React.useState<ParkingSpace[]>([]);
  const [serverError, setServerError] = React.useState<any>(null); // must be set to error.response
  const [showAlert, setShowAlert] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [expandedItem, setExpandedItem] = React.useState<any>(null); // must be ParkingSpace


  const gotoNextScreen = () => {
    if (localStorage.getItem("username") !== "")
      setUsername(localStorage.getItem("username")!);
    setNextScreen(true);
  }

  const getParkingSpaces = () => {
    setLoading(true);
    getParkingSpacesApi().then(res => {
      setParkingSpaces(res);
    }).catch((error) => {
      console.log("current state error status code " + serverError);
      console.log("error status code " + error.response.status);
      setServerError(error.response);
    });
  }

  const updateItem = (item: ParkingSpace, status: "taken"|"free", takenBy: string) => {
    setLoading(true);
    putItemApi(item, status, takenBy).then((res) => {
      let updatedItem = res;
      let index = parkingSpaces.findIndex((i) => i.id === updatedItem.id)
      if (index > -1){
        setParkingSpaces(prev => {
          let newItems = [...prev];
          newItems[index] = updatedItem;
          return newItems; 
        })
      }
    }).catch((error) => {
      console.log(error);
      if (error.response) {
        console.log(error.response.data); // Response JSON
        console.log(error.response.status); // e.g.: 409
        console.log(error.response.headers); // JSON - content length, content type
      }
      setServerError(error.response);
      getParkingSpaces();
    })
  }

  React.useEffect(() => {
    if (nextScreen){
      gotoNextScreen();
      getParkingSpaces();
    }
  }, [nextScreen])

  React.useEffect(() => {
    if(parkingSpaces.length !== 0)
      setLoading(false);
  },
   [parkingSpaces])

  React.useEffect(() => {
    if (localStorage.getItem("username") !== ""){
      setUsername(localStorage.getItem("username")!);
    setNextScreen(true);
    }
  },
   [])

  const renderErrorMessage = () => (
    <IonAlert
        isOpen={serverError !== null}
        onDidDismiss={() => {setShowAlert(false); setServerError(null);}}
        header={'Server error ' + serverError.status}
        subHeader={'Subtitle'}
        message={serverError.data.text}
        buttons={['OK']}
      />
  )

  const renderLoginScreen = () => (
    <>
      <IonInput onIonChange={(e: any) => {setUsername(e.target.value); }}></IonInput>
      <IonButton onClick={() => {localStorage.setItem("username", username); setNextScreen(true)}}>Next</IonButton>
    </>
  )

  const renderItem = (item: ParkingSpace) => (
    <>
      <IonLabel> Id: {item.id}; </IonLabel>
      <IonLabel> Number: {item.number}; </IonLabel>
      <IonLabel> Status: {item.status}</IonLabel>
    </>
  )

  const renderExpandedItem = (item: ParkingSpace) => (
    <>
      <IonAccordionGroup>
        <IonAccordion value="colors">
          <IonItem slot="header">
            <IonLabel>Expanded Parking Space</IonLabel>
          </IonItem>
    
          <IonList slot="content">
            <IonItem>
              <IonLabel>Id: {item.id}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Number: {item.number}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Status: {item.status}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Taken by: {item.takenBy}</IonLabel>
            </IonItem>
            <IonItem>
              {item.status === "free" && <IonButton onClick={() => {updateItem(item, "taken", username)}}>Take</IonButton>}
              {item.takenBy === username && <IonButton onClick={() => {updateItem(item, "free", "")}}>Release</IonButton>}
            </IonItem>
          </IonList>
        </IonAccordion>
      </IonAccordionGroup>
    </>
  )
  
  const renderItemList = (listToRender: any[], listTitle: string) => (
    <>
    <IonTitle>{listTitle}</IonTitle>
    <IonList>
      {listToRender.map((listItem, index) => (
        <IonItem key={listItem.id} onClick={() => {setExpandedItem(listItem);}}>
            <IonLabel>{index} </IonLabel>
            {renderItem(listItem)}
            {expandedItem === listItem && renderExpandedItem(expandedItem)}
        </IonItem>
      ))}
      </IonList>
    </>
  )

  const renderLoading = () => (
    <>
      <IonProgressBar type="indeterminate"></IonProgressBar><br />
    </>
  )


  const renderNextScreen = () => (
    <>
      {serverError !== null && renderErrorMessage()}
      {loading && renderLoading()}
      {renderItemList(parkingSpaces, "Parking Spaces")}
    </>
  )

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Parking lot app</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {!nextScreen && localStorage.getItem("username") === null ? renderLoginScreen() : renderNextScreen()}
      </IonContent>
    </IonPage>
  );
};

export default Home;
