import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ExternalAccountModule } from './external-account/external-account.module';
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
    ExternalAccountModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
