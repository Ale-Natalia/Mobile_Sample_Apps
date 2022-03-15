import React, {useCallback, useContext, useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {
    createAnimation, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol,
    IonContent,
    IonFab,
    IonFabButton,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent, IonInput,
    IonLabel,
    IonList,
    IonLoading,
    IonPage,
    IonRow,
    IonSearchbar, IonSelect, IonSelectOption, IonText,
    IonTitle,
    IonToast,
    IonToolbar
} from '@ionic/react';
import {Network, Storage} from "@capacitor/core";
import {add} from 'ionicons/icons';
import {getLogger} from '../core';
import {MessageProps} from "./MessageProps";
import {ProductProps} from "./ProductProps";
import {apiPostAnswer, getItems, getProducts, getTasks, newWebSocket, updateItem, updateTask} from "./api";
import {useStyles} from "./styles";
import {ItemProps} from "./ItemProps";
import {TaskProps} from "./TaskProps";
import {QuestionProps} from "./QuestionProps";
import {QuestionResponseProps} from "./QuestionResponseProps";

const log = getLogger('taskList');

const Home: React.FC<RouteComponentProps> = ({history}) => {
        const classes = useStyles();
        // STATE
        const [appScene, setAppScene] = useState<string>("taskList");
        const [tasks, setTasks] = useState<TaskProps[]>([])
        const [questions, setQuestions] = useState<QuestionProps[]>([])
        const [questionResponses, setQuestionResponses] = useState<QuestionResponseProps[]>([])
        // @ts-ignore
        const [currentQuestion, setCurrentQuestion] = useState<QuestionProps>(undefined)
        const [inputField, setInputField] = useState<string>("");
        const [globalError, setGlobalError] = useState<string>("");
        const [fetching, setFetching] = useState<boolean>(false);

        // WS
        const wsEffect = () => {

            let canceled = false;
            log('wsEffect - connecting');
            const closeWebSocket = newWebSocket(message => {
                if (canceled) {
                    return;
                }
                const question  = message;
                log(`ws message, item: ${question.id}`);

                if(!currentQuestion){
                    setCurrentQuestion(question);

                    Storage.set({
                        key: "questions",
                        value: JSON.stringify([...questions, question])
                    }).catch(()=>{console.log("could not save to local storage")})

                    setQuestions(prevState => [...prevState, question])


                } else {
                    alert("a question has been ignored")
                }

                console.log(message)
            });
            return () => {   // in case the component is unmounted
                log('wsEffect - disconnecting');
                canceled = true;
                closeWebSocket();
            }
        }

        const findQuestionById = (id: number) => {
            let idx = questions.findIndex(q => q.id == id)
            if(idx >= 0)
                return questions[idx];
        }

        const handlePost = () => {
                setFetching(true);
                setGlobalError("")

                apiPostAnswer({questionId: currentQuestion.id, text: inputField}).then((questionResponse)=>{
                    setFetching(false)
                    // @ts-ignore
                    setCurrentQuestion(undefined);
                    setInputField("");
                    Storage.set({
                        key: "questionResponses",
                        value: JSON.stringify([...questionResponses, questionResponse])
                    }).catch(()=>{console.log("could not save question answers to local storage")})
                    setQuestionResponses(prevState => [...prevState, questionResponse])
                    console.log(questionResponse);
                }).catch((err) => {
                    setFetching(false)
                    setGlobalError("Cannot post to server. Sad :(");
                })

        }

        useEffect(wsEffect, [currentQuestion])

        useEffect(()=>{
            Storage.get({key: 'questions'}).then((questionsString)=>{
                const q = JSON.parse(questionsString.value)
                if(q)
                    setQuestions(q)
                console.log(q)
            })
            Storage.get({key: 'questionResponses'}).then((questionResponsesString)=>{
                const qr = JSON.parse(questionResponsesString.value)
                if(qr)
                    setQuestionResponses(qr)
                console.log(qr)
            })
        }, [])

        // UTILS

        // SERVICE
        // get the messages
        // const fetchTasks = (search: string) => {
        //     setFetching(true);
        //     getTasks(search).then((tasks) => {
        //             setTasks(tasks); setFetching(false)
        //         })
        //         .catch((err)=>{
        //             console.log(err);
        //             setGlobalError("Could not fetch tasks.");
        //             setFetching(false);
        //         });
        // }

        // useEffect(()=>{
        //     fetchTasks(inputField);
        // }, [inputField]);
        //
        // const update = (task: TaskProps) => {
        //         const tasksCopy = [...tasks]
        //         const t = tasks.find((t) => t.id == task.id)
        //         if(t) {
        //             setFetching(true);
        //             updateTask(task).then((newTask)=>{
        //                 t.version = newTask.version;
        //                 t.status = newTask.status;
        //                 t.text = newTask.text;
        //                 setTasks(tasksCopy)
        //                 setFetching(false);
        //             }).catch((err) => {
        //                 setFetching(false);
        //                 if (err.response && err.response.status == 409) {
        //                     alert("Version conflict. Fetching...")
        //                     fetchTasks(inputField);
        //                 } else {
        //                     setGlobalError("Network error.");
        //                 }
        //             })
        //         }
        // }

    //RENDER
    const showTasksList = () => {
        const cards = questionResponses.map(({ id, questionId, text, isCorrect }) => {
            let originalQuestion;
                // @ts-ignore
            let quest = findQuestionById(questionId);
            if(quest){
                originalQuestion = quest.text;
            } else originalQuestion = "none";

            return <div key={id}>
                <IonCard>
                    <IonCardHeader>
                        <IonCardSubtitle>{isCorrect ? "CORRECT" : "NOT CORRECT"}</IonCardSubtitle>
                        <IonCardTitle>{originalQuestion}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonRow>
                            <IonText>Your answer:</IonText>
                        </IonRow>
                        <IonRow>
                            <IonText>{text}</IonText>
                        </IonRow>
                    </IonCardContent>
                </IonCard>
            </div>
        })
        return <>
            <IonList>
                {cards}
            </IonList>
        </>;

    }

    const showCurrentQuestion = () => {
            if(currentQuestion)
                return (
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>{currentQuestion.text}</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonRow>
                                <IonInput
                                    placeholder="Give answer"
                                    value={inputField}
                                    onIonChange={(e)=>{setInputField(e.detail.value || '')}}
                                />
                            </IonRow>
                            <IonRow>
                                <IonButton onClick={handlePost}>Submit</IonButton>
                            </IonRow>
                        </IonCardContent>
                    </IonCard>
                )
            else
                return <h1>Waiting for the next question...</h1>

        }

    const showErrors = () => {
        if(globalError != "")
            return <h1 className={classes.errorMessage}>{globalError}</h1>
    }

    return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonGrid>
                            <IonRow>
                                <IonTitle>Exam Application</IonTitle>
                            </IonRow>
                        </IonGrid>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    {showErrors()}
                    <IonLoading isOpen={fetching} message="Posting to the server..."/>
                    {
                        (appScene == "taskList") &&
                        <>
                            {showCurrentQuestion()}
                            {showTasksList()}
                        </>
                    }
                </IonContent>
            </IonPage>
        );
};

export default Home;
