import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailService: MailerService) {}

  async sendMailVerificationCode(to: string, code: string): Promise<boolean> {
    await this.mailService.sendMail({
      to: to,
      from: process.env.EMAIL_ID,
      subject: '[Match-On] 회원가입 인증메일입니다.',
      html: `<b>${code}</b>`,
    });
    return true;
  }
}
