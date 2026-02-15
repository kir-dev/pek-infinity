import type { ComponentProps } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export type UserAvatarTier =
  | 'tier-1'
  | 'tier-2'
  | 'active'
  | 'inactive'
  | 'unknown';
export type UserAvatarSize = 'sm' | 'default' | 'lg';

export interface UserAvatarProps extends ComponentProps<typeof Avatar> {
  tier?: UserAvatarTier;
  size?: UserAvatarSize;
  showBadge?: boolean;
  children?: React.ReactNode;
}

export function UserAvatar({
  tier = 'unknown',
  size = 'default',
  showBadge = true,
  className,
  children,
  ...props
}: UserAvatarProps) {
  return (
    <Avatar
      data-slot='user-avatar'
      data-tier={tier}
      data-size={size}
      className={cn(
        'relative rounded-full',
        // Ring styling per tier
        'ring-4 data-[size=lg]:ring-6 data-[size=sm]:ring-2',
        'ring-transparent data-[tier=active]:ring-tier-3-start data-[tier=inactive]:ring-tier-inactive data-[tier=tier-1]:ring-tier-1-start data-[tier=tier-2]:ring-tier-2-start',
        // Size styling
        'data-[size=default]:size-30 data-[size=lg]:size-50 data-[size=sm]:size-10',
        className
      )}
      {...props}
    >
      {children}
      {showBadge &&
        size !== 'sm' &&
        (tier === 'tier-1' || tier === 'tier-2') && (
          <UserAvatarBadge large={size === 'lg'} tier={tier} />
        )}
    </Avatar>
  );
}

export function UserAvatarImage({
  className,
  ...props
}: ComponentProps<typeof AvatarImage>) {
  return (
    <AvatarImage
      data-slot='user-avatar-image'
      className={cn(
        'aspect-square size-full rounded-full object-cover',
        className
      )}
      {...props}
    />
  );
}

export function UserAvatarFallback({
  children = 'JD',
  className,
  ...props
}: ComponentProps<typeof AvatarFallback>) {
  return (
    <AvatarFallback
      data-slot='user-avatar-fallback'
      className={cn(
        'flex size-full items-center justify-center rounded-full',
        'font-semibold text-lg',
        'data-[size=sm]:text-xs',
        'data-[size=lg]:text-3xl',
        className
      )}
      {...props}
    >
      {children}
    </AvatarFallback>
  );
}

function UserAvatarBadge({
  large,
  tier,
}: {
  large: boolean;
  tier: 'tier-1' | 'tier-2';
}) {
  const BadgeIcon = tier === 'tier-2' ? KBCard : ABCard;

  return (
    <div
      data-slot='user-avatar-badge'
      data-tier={tier}
      className={cn(
        'absolute bottom-0 left-0 z-10',
        'flex items-center justify-center',
        'rounded-[6px]',
        'border-[#0A0A0A] border-[3px]',
        // Tier gradient background
        'bg-linear-to-br',
        'data-[tier=tier-1]:from-tier-1-start data-[tier=tier-1]:to-tier-1-end',
        'data-[tier=tier-2]:from-tier-2-start data-[tier=tier-2]:to-tier-2-end',
        // Size-based scaling
        large && 'origin-bottom-left scale-[2]'
      )}
    >
      <BadgeIcon className='h-7 w-fit' />
    </div>
  );
}

const ABCard = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width='50'
    height='30'
    viewBox='0 0 50 30'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden='true'
  >
    <title>AB Award Badge</title>
    <path
      d='M16.35 19.5H8.65M18 10.5L16.35 17.25H8.65L7 10.5L10.3 14.4375L12.5 10.5L14.7 14.4375L18 10.5Z'
      stroke='white'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M24.6399 20H22.3331L25.848 9.81818H28.6222L32.1321 20H29.8253L27.2749 12.1449H27.1953L24.6399 20ZM24.4957 15.9979H29.9446V17.6783H24.4957V15.9979ZM33.8576 20V9.81818H37.9343C38.6834 9.81818 39.3081 9.92921 39.8086 10.1513C40.3091 10.3733 40.6853 10.6816 40.9371 11.076C41.189 11.4671 41.315 11.9179 41.315 12.4283C41.315 12.826 41.2354 13.1757 41.0763 13.4773C40.9173 13.7756 40.6985 14.0208 40.4201 14.2131C40.145 14.402 39.8301 14.5362 39.4755 14.6158V14.7152C39.8633 14.7318 40.2262 14.8411 40.5643 15.0433C40.9057 15.2455 41.1824 15.5289 41.3945 15.8935C41.6067 16.2547 41.7127 16.6856 41.7127 17.1861C41.7127 17.7263 41.5785 18.2086 41.31 18.6328C41.0449 19.0537 40.6521 19.3868 40.1317 19.6321C39.6114 19.8774 38.9701 20 38.2077 20H33.8576ZM36.0103 18.2401H37.7653C38.3652 18.2401 38.8027 18.1257 39.0778 17.897C39.3529 17.665 39.4904 17.3568 39.4904 16.9723C39.4904 16.6906 39.4225 16.442 39.2866 16.2266C39.1507 16.0111 38.9568 15.8421 38.7049 15.7195C38.4563 15.5968 38.1597 15.5355 37.815 15.5355H36.0103V18.2401ZM36.0103 14.0788H37.6062C37.9012 14.0788 38.163 14.0275 38.3917 13.9247C38.6237 13.8187 38.806 13.6695 38.9386 13.4773C39.0745 13.285 39.1424 13.0547 39.1424 12.7862C39.1424 12.4183 39.0115 12.1217 38.7496 11.8963C38.4911 11.6709 38.1232 11.5582 37.646 11.5582H36.0103V14.0788Z'
      fill='white'
    />
  </svg>
);

const KBCard = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width='50'
    height='30'
    viewBox='0 0 50 30'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden='true'
  >
    <title>KB Award Badge</title>
    <path
      d='M15.0282 15.5192L15.912 20.4927C15.9219 20.5512 15.9137 20.6114 15.8884 20.6652C15.8632 20.719 15.8221 20.7637 15.7708 20.7935C15.7194 20.8234 15.6601 20.8368 15.6009 20.832C15.5417 20.8272 15.4854 20.8045 15.4395 20.7668L13.3511 19.1994C13.2503 19.1241 13.1279 19.0834 13.002 19.0834C12.8762 19.0834 12.7537 19.1241 12.6529 19.1994L10.5611 20.7662C10.5152 20.8038 10.4589 20.8265 10.3998 20.8313C10.3406 20.8361 10.2815 20.8227 10.2301 20.793C10.1788 20.7633 10.1377 20.7186 10.1124 20.6649C10.0871 20.6113 10.0788 20.5512 10.0886 20.4927L10.9717 15.5192'
      stroke='white'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M13 16.1667C14.933 16.1667 16.5 14.5997 16.5 12.6667C16.5 10.7337 14.933 9.16669 13 9.16669C11.067 9.16669 9.5 10.7337 9.5 12.6667C9.5 14.5997 11.067 16.1667 13 16.1667Z'
      stroke='white'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M24.8849 20V9.81818H27.0376V14.3075H27.1719L30.8359 9.81818H33.4162L29.6378 14.3771L33.4609 20H30.8857L28.0966 15.8139L27.0376 17.1065V20H24.8849ZM35.0373 20V9.81818H39.114C39.863 9.81818 40.4878 9.92921 40.9883 10.1513C41.4888 10.3733 41.8649 10.6816 42.1168 11.076C42.3687 11.4671 42.4947 11.9179 42.4947 12.4283C42.4947 12.826 42.4151 13.1757 42.256 13.4773C42.0969 13.7756 41.8782 14.0208 41.5998 14.2131C41.3247 14.402 41.0098 14.5362 40.6552 14.6158V14.7152C41.043 14.7318 41.4059 14.8411 41.744 15.0433C42.0853 15.2455 42.3621 15.5289 42.5742 15.8935C42.7863 16.2547 42.8924 16.6856 42.8924 17.1861C42.8924 17.7263 42.7582 18.2086 42.4897 18.6328C42.2246 19.0537 41.8318 19.3868 41.3114 19.6321C40.7911 19.8774 40.1497 20 39.3874 20H35.0373ZM37.19 18.2401H38.945C39.5449 18.2401 39.9824 18.1257 40.2575 17.897C40.5326 17.665 40.6701 17.3568 40.6701 16.9723C40.6701 16.6906 40.6022 16.442 40.4663 16.2266C40.3304 16.0111 40.1365 15.8421 39.8846 15.7195C39.636 15.5968 39.3394 15.5355 38.9947 15.5355H37.19V18.2401ZM37.19 14.0788H38.7859C39.0808 14.0788 39.3427 14.0275 39.5714 13.9247C39.8034 13.8187 39.9857 13.6695 40.1183 13.4773C40.2541 13.285 40.3221 13.0547 40.3221 12.7862C40.3221 12.4183 40.1912 12.1217 39.9293 11.8963C39.6708 11.6709 39.3029 11.5582 38.8256 11.5582H37.19V14.0788Z'
      fill='white'
    />
  </svg>
);
