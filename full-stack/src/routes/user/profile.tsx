import { createFileRoute } from '@tanstack/react-router';
import {
  ChevronDown,
  Clock,
  GraduationCap,
  Home,
  type LucideIcon,
  Moon,
  MoreVertical,
  Search,
  Send,
  Sun,
} from 'lucide-react';
import { useState } from 'react';
import { MembershipCard } from '@/components/design-system/membership-card';
import { Text } from '@/components/design-system/typography';
import {
  UserAvatar,
  UserAvatarFallback,
} from '@/components/design-system/user-avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { getInitials } from '@/utils/string';

export const Route = createFileRoute('/user/profile')({
  component: UserProfilePage,
});

type GroupVariant = 'tier1' | 'tier2' | 'active' | 'alumni' | 'newbie';

interface GroupData {
  id: string;
  variant: GroupVariant;
  groupName: string;
  roles: string;
  startDate: string;
  startUnit?: string;
  endDate?: string;
}

const MOCK_PROFILE = {
  name: 'Jane Doe',
  nickname: 'Jenny',
  handle: '@realijanedo',
};

const MOCK_GROUPS: Array<GroupData> = [
  {
    id: 'lovagrend-1',
    variant: 'tier2',
    groupName: 'Szent Schönherz Senior Lovagrend',
    roles: 'körvezető, administrátor',
    startDate: '2000 MAR',
  },
  {
    id: 'lovagrend-2',
    variant: 'tier2',
    groupName: 'Szent Schönherz Senior Lovagrend',
    roles: 'körvezető, administrátor',
    startDate: '2000 MAR',
  },
  {
    id: 'lovagrend-3',
    variant: 'alumni',
    groupName: 'Szent Schönherz Senior Lovagrend',
    roles: 'körvezető, administrátor',
    startDate: '2000 MAR',
  },
  {
    id: 'lovagrend-4',
    variant: 'alumni',
    groupName: 'Szent Schönherz Senior Lovagrend',
    roles: 'körvezető, administrátor',
    startDate: '2000 MAR',
  },
  {
    id: 'lovagrend-5',
    variant: 'alumni',
    groupName: 'Szent Schönherz Senior Lovagrend',
    roles: 'körvezető, administrátor',
    startDate: '2000 MAR',
  },
  {
    id: 'lovagrend-6',
    variant: 'alumni',
    groupName: 'Szent Schönherz Senior Lovagrend',
    roles: 'alumni',
    startDate: '2000 MAR',
    endDate: '2025 JUN',
  },
];

const INFO_ITEMS: Array<{ icon: LucideIcon; value: string; label: string }> = [
  { icon: Home, value: 'SCH-1313', label: 'Residence' },
  { icon: Clock, value: '2021', label: 'Joined' },
  { icon: GraduationCap, value: '2025', label: 'Last Active' },
];

function ContactButton({
  className,
  onClick,
}: {
  className?: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant='outline'
      size='sm'
      className={cn(
        'justify-center max-lg:aspect-square max-lg:h-full max-lg:w-fit',
        className
      )}
      onClick={onClick}
    >
      <span className='flex items-center gap-2'>
        <Send className='size-5' />
        <Text className='max-lg:hidden'>Contact</Text>
      </span>
    </Button>
  );
}

function UserProfilePage() {
  // TODO: wire behavior
  function handleOpenContact() {}
  function handleToggleHandleMenu() {}
  function handleSearchSubmit() {}
  function handleOpenOverflowMenu() {}
  function handleOpenGroup(_group: GroupData) {}

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  return (
    <div
      data-theme={theme}
      className='min-h-screen bg-background text-foreground'
    >
      <div className='flex min-h-screen flex-col lg:flex-row'>
        <aside className='flex min-h-fit shrink-0 flex-col gap-4 px-section pt-section lg:min-w-64 lg:rounded-tr-[18px] lg:rounded-br-[18px] lg:border-r lg:border-b-0 lg:p-section'>
          <div className='flex flex-row gap-4 border-b-0 py-2 lg:flex-col lg:border-b'>
            <UserAvatar
              tier='tier-2'
              className='avatar-default lg:avatar-large'
            >
              <UserAvatarFallback className='overflow-hidden text-6xl'>
                {getInitials(MOCK_PROFILE.name)}
              </UserAvatarFallback>
            </UserAvatar>

            <div className='flex flex-col justify-center'>
              <div className='flex items-baseline gap-2'>
                <Text className='font-bold text-xl tracking-tight'>
                  {MOCK_PROFILE.name}
                </Text>
                <Text muted>({MOCK_PROFILE.nickname})</Text>
              </div>
              <Button
                variant='ghost'
                size='sm'
                className='m-0 justify-start px-0'
                onClick={handleToggleHandleMenu}
              >
                <span className='flex items-center gap-1.5 text-muted-foreground'>
                  {MOCK_PROFILE.handle}
                  <ChevronDown className='size-4' />
                </span>
              </Button>
            </div>
          </div>

          <ContactButton
            className='max-lg:hidden'
            onClick={handleOpenContact}
          />

          <div className='flex flex-wrap items-center gap-x-4 gap-y-3 lg:flex-col lg:items-start'>
            {INFO_ITEMS.map(({ icon: Icon, value, label }) => (
              <div key={label} className='flex items-center gap-2.5'>
                <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card p-2'>
                  <Icon className='size-5 text-muted-foreground' />
                </div>
                <div className='flex flex-col leading-none'>
                  <Text emphasized>{value}</Text>
                  <Text muted className='text-xs'>
                    {label}
                  </Text>
                </div>
              </div>
            ))}
            <ContactButton className='lg:hidden' onClick={handleOpenContact} />
          </div>
        </aside>

        <main className='flex-1 flex-col p-section'>
          <Tabs defaultValue='groups' className='min-h-0 w-full flex-1'>
            <div className='flex justify-between gap-3 pb-4 lg:items-center'>
              <TabsList aria-label='Groups / Activity'>
                <TabsTrigger value='groups'>Groups</TabsTrigger>
                <TabsTrigger value='activity'>Activity</TabsTrigger>
              </TabsList>
              <div className='ml-auto flex items-center gap-3'>
                <Input className='max-w-72' placeholder='pl. újonc' />
                <Separator
                  orientation='vertical'
                  className='hidden h-8 lg:block'
                />
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleSearchSubmit}
                >
                  <Search className='size-5' />
                </Button>
                <div className='flex flex-row gap-3 max-lg:fixed max-lg:top-4 max-lg:right-4 max-lg:z-40'>
                  <Button
                    aria-label='Téma váltása'
                    onClick={() =>
                      setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
                    }
                    size='icon-lg'
                    type='button'
                    variant='ghost'
                  >
                    {theme === 'dark' ? (
                      <Sun className='size-5' />
                    ) : (
                      <Moon className='size-5' />
                    )}
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon-lg'
                    onClick={handleOpenOverflowMenu}
                  >
                    <MoreVertical className='size-5' />
                  </Button>
                </div>
              </div>
            </div>

            <TabsContent value='groups'>
              <div className='flex flex-row flex-wrap justify-center gap-8 lg:justify-start'>
                {MOCK_GROUPS.map((group) => (
                  <MembershipCard
                    key={group.id}
                    variant={group.variant}
                    groupName={group.groupName}
                    roles={group.roles}
                    startDate={group.startDate}
                    endDate={group.endDate}
                    onOpen={() => handleOpenGroup(group)}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value='activity'>
              <div>Activity</div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
