import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { GroupModule } from './group/group.module';
import { MembershipModule } from './membership/membership.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [DatabaseModule, UserModule, GroupModule, MembershipModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
