import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Detail, Subtitle, Text } from './typography';

export const MembershipCard = () => {
  // Card has a hidden linear gradient background
  const transitionClassName = 'transition-all duration-fast';
  const containerClassName =
    'transition-colors duration-fast bg-linear-to-br from-tier-2-start/60 to-tier-2-end/60 group-hover/card:from-tier-2-start/80 group-hover/card:to-tier-2-end/80';

  return (
    <div className='group/card glass-elevated max-w-80 cursor-pointer overflow-hidden rounded-3xl'>
      <Card
        className={cn('gap-0 p-0', transitionClassName, containerClassName)}
      >
        <CardHeader className='flex flex-row items-center gap-card p-card'>
          <GroupAvatar fallback='S' className='h-14 w-14 shrink-0' />
          <div className='overflow-hidden *:truncate'>
            <Subtitle className='group-hover/card:underline'>
              Szent Schönherz Senior Lovagrend
            </Subtitle>
            <Text>körvezető, gazdaságis</Text>
          </div>
        </CardHeader>
        {/* <div className='absolute right-3 left-3 h-px bg-linear-to-br from-tier-2-start to-tier-2-end opacity-50'></div> */}
        <CardContent
          className={cn(
            'flex items-end justify-between p-card',
            'bg-card/95 group-hover/card:bg-card',
            transitionClassName
          )}
        >
          <div className=''>
            <Text emphasized className='uppercase leading-loose' asChild>
              <p>RENDES TAG</p>
            </Text>
            <Text className='tabular-nums'>
              2020 <span className='opacity-80'>mar</span> -
            </Text>
          </div>
          <ActivityBarChart className='' />
        </CardContent>
      </Card>
    </div>
  );
};
function ActivityBarChart({ className }: { className?: string }) {
  return (
    <Button
      variant='ghost'
      className={cn(
        'glass-elevated [--opacity:0.7] hover:[--opacity:1]',
        'flex items-center gap-4',
        className
      )}
    >
      <Detail className='flex justify-center'>Activity</Detail>

      <div className='flex h-8 items-end gap-1.5 opacity-(--opacity) *:w-1.5 *:rounded-full'>
        <div style={{ height: '82%' }} className='bg-tier-1-start'></div>
        <div style={{ height: '100%' }} className='h-7 bg-tier-1-start'></div>
        <div style={{ height: '78%' }} className='h-5 bg-amber-600'></div>
        <div style={{ height: '45%' }} className='h-3 bg-foreground'></div>
        <div style={{ height: '18%' }} className='h-2 bg-foreground'></div>
        <div style={{ height: '67%' }} className='h-3 bg-foreground'></div>
        <div className='h-1.5 bg-muted-foreground'></div>
      </div>
    </Button>
  );
}

function GroupAvatar({
  fallback,
  className,
}: {
  fallback?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'glass flex items-center justify-center rounded-lg bg-black/20 backdrop-grayscale-50 transition-colors duration-fast group-hover/card:bg-black/30',
        className
      )}
    >
      <Text emphasized className='text-2xl text-white'>
        {fallback}
      </Text>
    </div>
  );
}
