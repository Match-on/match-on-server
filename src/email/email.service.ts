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

  async sendMailInviteTeam(to: string, link: string, teamName: string): Promise<boolean> {
    await this.mailService.sendMail({
      to: to,
      from: process.env.EMAIL_ID,
      subject: `[Match-On] ${teamName} 팀에 초대합니다!`,
      html: `아래의 링크를 클릭하여 ${teamName} 팀에 합류할 수 있습니다.<br><b>${link}</b>`,
    });
    return true;
  }
}
