import { Injectable } from "@nestjs/common";
import { NotificationsService } from "modules/notifications/notifications.service";

@Injectable()
export class ResultSubscriber {
    constructor(
        private notificationsService: NotificationsService
    ) { }
}