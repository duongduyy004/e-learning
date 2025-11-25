import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'config/config.type';
import nodemailer from 'nodemailer'
@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter
  constructor(private configService: ConfigService<AllConfigType>) {
    this.transporter = nodemailer.createTransport({

    })
  }

}
