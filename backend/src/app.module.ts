import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { MembershipModule } from './membership/membership.module';
import { PrismaModule } from './prisma/prisma.module';
import { SemesterModule } from './semester/semester.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    GroupModule,
    MembershipModule,
    SemesterModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
