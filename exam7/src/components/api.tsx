import axios from 'axios';
import {authConfig, baseUrl, config, getLogger, withLogs} from '../core';
import {Storage} from '@capacitor/core';
import {MessageProps} from "./MessageProps";
import {ProductProps} from "./ProductProps";
import {ItemProps} from "./ItemProps";
import {TaskProps} from "./TaskProps";
import {QuestionPostProps} from "./QuestionPostProps";
import {QuestionResponseProps} from "./QuestionResponseProps";
import {QuestionProps} from "./QuestionProps";


const questionUrl = `http://${baseUrl}/answer`;
const tasksUrl = `http://${baseUrl}/task`;
const productsUrl = `http://${baseUrl}/product`;
const itemsUrl = `http://${baseUrl}/item`;

export const apiPostAnswer: (questionPost: QuestionPostProps) => Promise<QuestionResponseProps> = (questionPost) => {
    try {
        const result = axios.post(`${questionUrl}`, questionPost, config);
        return withLogs(result, 'getTasks');
    } catch (error) {
        throw error;
    }
}

export const getTasks: (search: string) => Promise<TaskProps[]> = (search: string) => {
    try {
        const result = axios.get(`${tasksUrl}?q=${search}`, config);
        return withLogs(result, 'getTasks');
    } catch (error) {
        throw error;
    }
}

export const updateTask: (task: TaskProps) => Promise<TaskProps> = (item) => {
    try {
        const result = axios.put(`${tasksUrl}/${item.id}`, item, config);
        return withLogs(result, 'updateTask');
    } catch (error) {
        throw error;
    }
}

export const getProducts: () => Promise<ProductProps[]> = () => {
    try {
        const result = axios.get(`${productsUrl}`, config);
        return withLogs(result, 'getProducts');
    } catch (error) {
        throw error;
    }
}

export const getItems: () => Promise<ItemProps[]> = () => {
    try {
        const result = axios.get(`${itemsUrl}`, config);
        return withLogs(result, 'getItems');
    } catch (error) {
        throw error;
    }
}

export const updateItem: (item: ItemProps) => Promise<ItemProps> = (item) => {
    try {
        const result = axios.put(`${itemsUrl}/${item.productId}`, item, config);
        return withLogs(result, 'updateMessage');
    } catch (error) {
        throw error;
    }
}

const log = getLogger('ws');

export const newWebSocket = (onMessage: (data: QuestionProps) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}
