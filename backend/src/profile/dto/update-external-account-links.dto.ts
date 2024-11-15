import { ExternalAccountProtocol } from '@prisma/client';

export class UpdateExternalAccountLinksDto {
  links: ExternalLink[];
}

class ExternalLink {
  protocol: ExternalAccountProtocol; //lehet hibat dob
  account: string;
}
