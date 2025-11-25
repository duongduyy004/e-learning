import { Injectable } from "@nestjs/common";
import { MailerService } from "modules/mailer/mailer.service";

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService
    ) { }
}