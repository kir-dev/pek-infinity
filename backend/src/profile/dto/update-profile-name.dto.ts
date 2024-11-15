export class UpdateProfileNameDto {
  usernames: ProfileName[];
}

class ProfileName {
  humanId?: string;
  userId?: string;
  user?: string;
}
