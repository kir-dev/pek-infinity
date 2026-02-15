import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Detail, Subtitle, Text } from './typography';

const containerVariants = cva(
  'cursor-pointer overflow-hidden rounded-3xl p-0',
  {
    variants: {
      variant: {
        tier1: 'glass',
        tier2: 'glass',
        active: 'glass',
        alumni: 'glass',
        newbie:
          'border border-tier-draft border-dashed bg-card shadow-none ring-0',
      },
    },
  }
);

const headerVariants = cva('flex p-card', {
  variants: {
    variant: {
      tier1:
        'bg-linear-to-br from-tier-1-start/80 to-tier-1-end/80 group-hover/card:from-tier-1-start group-hover/card:to-tier-1-end',
      tier2:
        'bg-linear-to-br from-tier-2-start/80 to-tier-2-end/80 group-hover/card:from-tier-2-start group-hover/card:to-tier-2-end',
      active: 'bg-neutral-500/60 group-hover/card:bg-neutral-500/80',
      alumni: '',
      newbie: '',
    },
  },
});

const avatarVariants = cva(
  'flex items-center justify-center rounded-lg text-2xl text-medium transition-colors duration-fast',
  {
    variants: {
      variant: {
        tier1:
          'glass bg-black/20 text-white backdrop-grayscale-50 group-hover/card:bg-black/30',
        tier2:
          'glass bg-black/20 text-white backdrop-grayscale-50 group-hover/card:bg-black/30',
        active:
          // black on neutral need stronger contrast
          'glass bg-black/25 text-white backdrop-grayscale-50 group-hover/card:bg-black/34',
        alumni:
          'bg-muted/60 text-muted-foreground group-hover/card:bg-muted/80',
        newbie:
          'bg-muted/60 text-muted-foreground group-hover/card:bg-muted/80',
      },
    },
  }
);

export function MembershipCard({
  className,
  variant,
  groupName,
  roles,
  endDate,
}: {
  className?: string;
  variant: 'tier1' | 'tier2' | 'active' | 'alumni' | 'newbie';
  groupName: string;
  roles: string;
  endDate: string;
}) {
  const hasBackground =
    variant === 'tier1' || variant === 'tier2' || variant === 'active';
  const separator = hasBackground ? null : <div className='mx-card border-b' />;

  return (
    <Card
      className={cn(
        containerVariants({ className, variant }),
        'min-h-40 w-80 gap-0'
      )}
    >
      <CardHeader className={headerVariants({ variant })}>
        {/* Group Avatar */}
        <div className={cn(avatarVariants({ variant }), 'h-14 w-14 shrink-0')}>
          S
        </div>
        <div className='min-w-0 overflow-hidden *:truncate'>
          {/* Group name */}
          <Subtitle
            className={cn(
              'group-hover/card:underline',
              hasBackground && 'text-white'
            )}
          >
            {groupName}
          </Subtitle>
          {/* Roles */}
          <Text
            className={
              hasBackground ? 'text-white/80' : 'text-muted-foreground'
            }
          >
            {roles}
          </Text>
        </div>
      </CardHeader>
      {separator}
      <CardContent className='mt-auto flex items-end justify-between p-1'>
        {/* fix text baseline pushes content up a bit */}
        <div className='p-card pb-[calc(var(--space-card)-0.2em)]'>
          <Text
            emphasized
            className='uppercase leading-loose tracking-wide'
            asChild
          >
            <p>
              {variant === 'tier1' ||
              variant === 'tier2' ||
              variant === 'active'
                ? 'RENDES TAG'
                : null}
              {variant === 'alumni' ? 'ALUMNI' : null}
              {variant === 'newbie' ? 'ÚJONC' : null}
            </p>
          </Text>
          <Text muted className='tabular-nums'>
            {'2020 mar'}
            {endDate ? (
              <>
                <br />
                {endDate}
              </>
            ) : (
              ' -'
            )}
          </Text>
        </div>
        <Button
          type='button'
          variant='ghost'
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className={cn(
            'relative flex min-h-fit min-w-fit cursor-pointer items-center rounded-2xl p-card!',
            'border-border bg-input/50! opacity-70 transition-opacity duration-fast',
            'group/activity overflow-hidden hover:opacity-100',
            className
          )}
        >
          {/* <Detail>Activity</Detail> */}
          <div
            className={cn(
              'flex h-7 items-end gap-1 *:min-h-1.5 *:w-1.5 *:rounded-full',
              'transition-transform duration-fast group-hover/activity:-translate-y-1.5'
            )}
          >
            <div style={{ height: '82%' }} className='bg-tier-2-start' />
            <div style={{ height: '100%' }} className='bg-tier-1-start' />
            <div style={{ height: '78%' }} className='bg-tier-2-start' />
            <div style={{ height: '45%' }} className='bg-foreground/90' />
            <div style={{ height: '18%' }} className='bg-foreground/90' />
            <div style={{ height: '67%' }} className='bg-foreground/90' />
            <div style={{ height: '0%' }} className='bg-muted-foreground' />
          </div>
          <Detail
            emphasized
            className='absolute bottom-1 text-transparent transition-all duration-fast group-hover/activity:text-muted-foreground'
          >
            pontozás
          </Detail>
        </Button>
      </CardContent>
    </Card>
  );
}
