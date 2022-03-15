import { IonAlert, IonBackButton, IonButton, IonContent, IonHeader, IonInput, IonLabel, IonPage, IonProgressBar, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import { render } from '@testing-library/react';
import React from 'react';
import { getItemsApi, getProductsApi, putItemApi } from '../api';
import ExploreContainer from '../components/ExploreContainer';
import Item from '../models/Item';
import Product from '../models/Product';
import './Home.css';
import { useStyles } from './styles';


const Home: React.FC = () => {
  const classes = useStyles();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [items, setItems] = React.useState<Item[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<number>(-1);
  const [inputQuantity, setInputQuantity] = React.useState<number>(-1);
  const [serverError, setServerError] = React.useState<any>(null); // must be set to error.response
  const [showAlert, setShowAlert] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(false);

  const getProducts = () => {
    setLoading(true);
    getProductsApi().then(res => {
      setProducts(res);
    }).catch((error) => {
      console.log("current state error status code " + serverError);
      console.log("error status code " + error.response.status);
      setServerError(error.response);
    });
  }

  const getItems = () => {
    setLoading(true);
    getItemsApi().then(res => {
      setItems(res);
    }).catch((error) => {
      console.log("current state error status code " + serverError);
      console.log("error status code " + error.response.status);
      setServerError(error.response);
    });
  }

  // update element => update entire list
  const addQuantity = (productId: number) => {
    setLoading(true);
    putItemApi(getItemByProductId(productId), inputQuantity).then((res) => {
      let updatedItem = res;
      let index = items.findIndex((i) => i.productId === updatedItem.productId)
      if (index > -1){
        setItems(prev => {
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
      if(error.response.status === 409){
        console.log("current state error status code " + serverError);
        console.log("error status code " + error.response.status);
        setServerError(error.response);
        getItemsApi();
      }
    })
  }

  const getItemByProductId = (productId: number) : Item => {
    let item = items.find((i) => i.productId === productId);
    return item!;
  }

  React.useEffect(() => {
    getProducts();
    getItems();
  },
   [])

  React.useEffect(() => {
    if(serverError !== null)
      setLoading(false);
  },
   [serverError])

  React.useEffect(() => {
    if(products.length !== 0)
      setLoading(false);
  },
   [products])

  React.useEffect(() => {
    if(items.length !== 0)
      setLoading(false);
  },
   [items])

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

  const renderLoading = () => (
    <>
      <IonProgressBar type="indeterminate"></IonProgressBar><br />
    </>
  )

  const renderProduct = (product: Product) => (
    <>
      <IonLabel> Id: {product.id}; </IonLabel>
      <IonLabel> Name: {product.name}; </IonLabel>
      <IonLabel> Quantity: {getItemByProductId(product.id).quantity}</IonLabel>
    </>
  )

  const renderItem = (item: Item) => (
    <>
      <IonLabel> Product id:{item.productId}; </IonLabel>
      <IonLabel> Quantity: {item.quantity}; </IonLabel>
      <IonLabel> Version: {item.version} </IonLabel>
    </>
  )

  const renderCorrespondences = {"item": renderItem, "product": renderProduct}

  // {renderCorrespondences[objectType](listItem)} // doesn't work
  const renderList = (listToRender: any[], listTitle: string, objectType: string) => (
    <>
    <IonTitle>{listTitle}</IonTitle>
      {listToRender.map((listItem, index) => (
          <IonRow key={index}>
            <IonLabel>{index}</IonLabel>
          </IonRow>
      ))}
    </>
  )

  const renderAddQuantity = (productId: number) => (
    <>
      <IonInput onIonChange={(e: any) => {setInputQuantity(e.target.value)}}>Quantity:</IonInput>
      <IonButton onClick={() => {addQuantity(productId)}}>Add</IonButton>
    </>
  )

  const renderProducts = (listToRender: any[], listTitle: string) => (
    <>
    <IonTitle>{listTitle}</IonTitle>
      {listToRender.map((listItem, index) => (
          <IonRow key={listItem.id} onClick={() => {setSelectedProduct(listItem.id)}} className={selectedProduct === listItem.id ? classes.backgroundColor : classes.default}>
            <IonLabel>{index} </IonLabel>
            {renderProduct(listItem)}
            {selectedProduct === listItem.id && renderAddQuantity(listItem.id)}
          </IonRow>
      ))}
    </>
  )

  const renderItems = (listToRender: any[], listTitle: string) => (
    <>
    <IonTitle>{listTitle}</IonTitle>
      {listToRender.map((listItem, index) => (
          <IonRow key={index}>
            <IonLabel>{index} </IonLabel>
            {renderItem(listItem)}
          </IonRow>
      ))}
    </>
  )

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inventory App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      {loading && renderLoading()}
      {serverError !== null && renderErrorMessage()}
      {products.length !== 0 && items.length !== 0 && renderProducts(products, "Products")}
      {renderItems(items, "Items")}
      </IonContent>
    </IonPage>
  );
};

export default Home;
