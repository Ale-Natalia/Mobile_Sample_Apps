import { IonAccordion, IonAccordionGroup, IonAlert, IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import { stat } from 'fs';
import React from 'react';
import { getItemsApi, putItemApi } from '../api';
import ExploreContainer from '../components/ExploreContainer';
import Item from '../models/Item';
import ParkingSpace from '../models/Item';
import './Home.css';
import { useStyles } from './styles';


const Home: React.FC = () => {
  const classes = useStyles();

  // ws
  const ws = React.useRef<WebSocket | null>(null); 
  const [waiting, setWaiting] = React.useState<boolean>(true);
  const [receivedItem, setReceivedItem] = React.useState<Item|null>(null);
  const [ignoredItem, setIgnoredItem] = React.useState<boolean>(false);

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
    getItemsApi().then(res => {
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
    if(receivedItem !== null && waiting){
      setWaiting(false);
      console.log("waiting: " + waiting);
    }
  },
   [receivedItem])

  React.useEffect(() => {
    ws.current = new WebSocket("ws://localhost:3000");
    ws.current.onmessage = (event) => {
      console.log(waiting);
      if(waiting){
        const newItem: Item = JSON.parse(event.data);
        console.log("received item: " + newItem);
        setReceivedItem(newItem);
      }
      else{
        setIgnoredItem(true);
        console.log("ignored item");
      }
      //setMessages((msgs) => [...msgs, newmsg]);
    };

    /*if (localStorage.getItem("username") !== ""){
      setUsername(localStorage.getItem("username")!);
      setNextScreen(true);
    }*/
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

  const renderAlert = (header: string, message: string) => (
    <IonAlert
        isOpen={serverError !== null}
        onDidDismiss={() => {setIgnoredItem(false);}}
        header={header}
        subHeader={'Subtitle'}
        message={message}
        buttons={['OK']}
      />
  )

  const renderLoginScreen = () => (
    <>
      <IonInput onIonChange={(e: any) => {setUsername(e.target.value); }}></IonInput>
      <IonButton onClick={() => {localStorage.setItem("username", username); setNextScreen(true)}}>Next</IonButton>
    </>
  )

  const renderItem = (item: Item) => (
    <>
      <IonLabel> Id: {item.id}; </IonLabel>
      <IonLabel> Text: {item.text}; </IonLabel>
    </>
  )

  const renderExpandedItem = (item: Item) => (
    <>
      <IonAccordionGroup>
        <IonAccordion value="colors">
          <IonItem slot="header">
            <IonLabel>Expanded Item</IonLabel>
          </IonItem>
    
          <IonList slot="content">
            <IonItem>
              <IonLabel>Id: {item.id}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Text: {item.text}</IonLabel>
            </IonItem>
            <IonItem>
              {/*item.status === "free" && <IonButton onClick={() => {updateItem(item, "taken", username)}}>Take</IonButton>}
              {item.takenBy === username && <IonButton onClick={() => {updateItem(item, "free", "")}}>Release</IonButton>*/}
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
        {waiting && receivedItem === null && <IonLabel>Waiting next question</IonLabel>}
        {waiting && receivedItem !== null && renderItem(receivedItem)}
        {!waiting && receivedItem !== null && renderItem(receivedItem)}
        {ignoredItem && <IonLabel>IGNORED ITEM</IonLabel> /*renderAlert("Got item", "Item was ignored")*/}
 
        {/*!nextScreen && localStorage.getItem("username") === null ? renderLoginScreen() : renderNextScreen()*/}
      </IonContent>
    </IonPage>
  );
};

export default Home;
