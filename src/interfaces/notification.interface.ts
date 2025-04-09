export interface NotificationInterface {
    title: string;
    message: string;
    type: NotificationsType;
    userId: string;
    id: string;
    read: boolean;
    createdAt?: Date;
}
export enum NotificationsType{
    ALERT = "ALERT",         
    REMINDER = "REMINDER",   
    INFO = "INFO"  
}