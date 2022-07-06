import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConstants } from 'src/auth/constants';
import { UnivRepository } from 'src/repository/univ.repository';

import { UnivController } from './univ.controller';
import { UnivService } from './univ.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UnivRepository]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [UnivController],
  providers: [UnivService],
  exports: [UnivService],
})
export class UnivModule {}
