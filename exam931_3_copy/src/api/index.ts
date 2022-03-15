import axios, { Axios, AxiosResponse } from "axios";
import ParkingSpace from "../models/ParkingSpace";

const API_ENDPOINT = "http://localhost:3000/";
const axiosInstance = axios.create({ baseURL: API_ENDPOINT });

export const setHeaders = (token: string) => {
  axiosInstance.defaults.headers.post["token"] = token;
  axiosInstance.defaults.headers.common["token"] = token;
};

export const getParkingSpacesApi = (): Promise<ParkingSpace[]> => {
  return axiosInstance.get(`space`).then((res: AxiosResponse) => {
    return res.data;
  });
};

export const putItemApi = (item: ParkingSpace, status: "free"|"taken", takenBy: string): Promise<ParkingSpace> => {
  return axiosInstance
    .put(`space/${item.id}`, {
      id: item.id,
      number: item.number,
      status: status,
      takenBy: takenBy,
    })
    .then((res) => {
      //   setHeaders(res.data.token);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

/*
export const authenticateApi = (id: number): Promise<any> => {
    return axiosInstance.post(`auth`, {id: id}).then((res: AxiosResponse) => {
        setHeaders(res.data.token);
        return res.data;
    });
};

export const getQuestionApi = (id: number, token: string): Promise<Question> => {
    return axiosInstance.get(`question/${id}`).then((res: AxiosResponse) => {
        return res.data;
    });
};

/*
export const getMessagesApi = (): Promise<Message[]> => {
  return axiosInstance.get(`message`).then((res: AxiosResponse) => {
    return res.data;
  });
};


export const putItemApi = (message: Message): Promise<Message> => {
  return axiosInstance
    .put(`message/${message.id}`, {
      id: message.id,
      text: message.text,
      type: message.sender,
      created: message.created,
      read: true,// message.read,
    })
    .then((res) => {
      //   setHeaders(res.data.token);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

/*
export const answerApi = (
  user: string,
  idQuestion: number,
  indexChosenOption: number
): Promise<Answer> => {
  return axiosInstance
    .post(`answer`, [user, idQuestion, indexChosenOption])
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      throw err;
    });
};
*/
