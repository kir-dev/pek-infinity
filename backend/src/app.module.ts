import { Module } from '@nestjs/common';
import { GroupModule } from './group/group.module';
import { MembershipModule } from './membership/membership.module';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';

@Module({
  imports: [UserModule, GroupModule, MembershipModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
