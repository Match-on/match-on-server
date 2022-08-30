import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TeamModule } from './team/team.module';
import { UnivModule } from './univ/univ.module';
import { EmailModule } from './email/email.module';
import { LectureModule } from './lecture/lecture.module';
import { StudyModule } from './study/study.module';
import { VideoGateway } from './gateway/video.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV == 'dev' ? '.env.dev' : '.env.prod',
      // ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().required(),
        EMAIL_ID: Joi.string().required(),
        EMAIL_PASS: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: ['dist/**/*.entity.{ts,js}'],
        synchronize: configService.get('DB_SYNC'),
        logging: true,
      }),
    }),
    UserModule,
    AuthModule,
    TeamModule,
    UnivModule,
    EmailModule,
    LectureModule,
    StudyModule,
  ],
  controllers: [AppController],
  providers: [AppService, VideoGateway],
})
export class AppModule {}
