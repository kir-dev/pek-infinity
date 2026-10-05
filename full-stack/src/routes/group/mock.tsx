import { createFileRoute } from '@tanstack/react-router';
import { Archive, Crown, Filter, Moon, Sprout, Sun } from 'lucide-react';
import { useState } from 'react';
import { MembershipKind } from '@/_generated/prisma/enums';
import {
  Paragraph,
  Subtitle,
  Text,
} from '@/components/design-system/typography';
import {
  UserAvatar,
  UserAvatarFallback,
  type UserAvatarTier,
} from '@/components/design-system/user-avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getInitials } from '@/utils/string';

export const Route = createFileRoute('/group/mock')({
  component: GroupProfilePage,
});

interface GroupRef {
  id: string;
  name: string;
}

interface MemberData {
  membershipId: string;
  userId: string;
  name: string;
  kind: MembershipKind;
  roleTitle?: string;
  points: number | null;
  tier?: UserAvatarTier;
  isLeader: boolean;
}

const KIND_LABEL: Record<MembershipKind, string> = {
  ACTIVE: 'RENDES TAG',
  NEWBIE: 'ÚJONC',
  FORMER: 'ALUMNI',
  ARCHIVED: 'ARCHIVÁLT',
};

const KIND_TEXT_CLASS: Record<MembershipKind, string> = {
  ACTIVE: 'text-status-member',
  NEWBIE: 'text-status-newbie',
  FORMER: 'text-status-alumni',
  ARCHIVED: 'text-status-alumni',
};

const OBJECTIVE_TEXT =
  'Mióta 2001 folyamatosan fejlesztünk webes alkalmazásokat az egyetemi közösség számára. A Pék-Next, a KonferenciaApp és számos további projekt fejlesztői vagyunk.';

const MOCK_MEMBERS: Array<MemberData> = [
  {
    membershipId: 'mem-1',
    userId: 'u-1',
    name: 'Pekkaros Péter',
    kind: MembershipKind.ACTIVE,
    roleTitle: 'Körvezető',
    points: 48,
    tier: 'tier-2',
    isLeader: true,
  },
  {
    membershipId: 'mem-2',
    userId: 'u-2',
    name: 'Backend Balázs',
    kind: MembershipKind.ACTIVE,
    points: 41,
    tier: 'tier-1',
    isLeader: false,
  },
  {
    membershipId: 'mem-3',
    userId: 'u-3',
    name: 'Kódoló Kata',
    kind: MembershipKind.ACTIVE,
    roleTitle: 'Frontend Lead',
    points: 38,
    isLeader: false,
  },
  {
    membershipId: 'mem-4',
    userId: 'u-4',
    name: 'Newbie Norbert',
    kind: MembershipKind.NEWBIE,
    roleTitle: 'Trainee',
    points: null,
    isLeader: false,
  },
  {
    membershipId: 'mem-5',
    userId: 'u-5',
    name: 'Old Olivér',
    kind: MembershipKind.FORMER,
    points: null,
    isLeader: false,
  },
];

const MOCK_PARENTS: GroupRef[] = [
  { id: 'g-szakkoll', name: 'Simonyi Károly Szakkollégium' },
];
const CURRENT_GROUP: GroupRef = { id: 'g-kirdev', name: 'Kir-Dev' };
const MOCK_CHILDREN: GroupRef[] = [
  { id: 'g-cmsch', name: 'CMSch Project' },
  { id: 'g-devops', name: 'DevOps Team' },
  { id: 'g-ci-2025s', name: 'Course Instructors 2025 Spring' },
];

const FOUNDATION_YEAR = 2001;
const TOTAL_ACTIVITY = 12_450;
const SEMESTER_BADGE = 'Aktív szemeszter';

const POINTS_MAX = 50;

function tierTone(tier: UserAvatarTier): { text: string; bar: string } {
  if (tier === 'tier-2') {
    return {
      text: 'text-tier-2-start',
      bar: 'bg-linear-to-r from-tier-2-start to-tier-2-end',
    };
  }
  if (tier === 'tier-1') {
    return {
      text: 'text-tier-1-start',
      bar: 'bg-linear-to-r from-tier-1-start to-tier-1-end',
    };
  }
  return { text: 'text-indigo-400', bar: 'bg-indigo-400' };
}

function openMember(_member: MemberData) {}

function MemberRow({ member }: { member: MemberData }) {
  const tier = member.tier ?? 'unknown';
  const initials = getInitials(member.name);
  const hasPoints = member.points !== null;
  const tone = hasPoints ? tierTone(tier) : null;
  const width = hasPoints
    ? Math.round(((member.points ?? 0) / POINTS_MAX) * 100)
    : 0;

  return (
    <button
      type='button'
      onClick={() => openMember(member)}
      className='group flex w-full cursor-pointer items-center gap-4 py-3 text-left'
    >
      <div className='relative shrink-0'>
        <UserAvatar tier={tier} showBadge={false} className='avatar-small'>
          <UserAvatarFallback>{initials}</UserAvatarFallback>
        </UserAvatar>
        {member.isLeader && (
          <span className='absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-background bg-linear-to-br from-amber-400 to-rose-500 text-white'>
            <Crown className='size-3' />
          </span>
        )}
      </div>

      <div className='min-w-0 flex-1'>
        <Text
          emphasized
          className='truncate font-semibold group-hover:underline'
        >
          {member.name}
        </Text>
        <div className='mt-0.5 flex items-center gap-2'>
          <span
            className={cn(
              'shrink-0 font-medium text-xs uppercase tracking-wide',
              KIND_TEXT_CLASS[member.kind]
            )}
          >
            {KIND_LABEL[member.kind]}
          </span>
          {member.roleTitle ? (
            <>
              <span className='shrink-0 text-muted-foreground'>·</span>
              <Text muted className='truncate text-xs'>
                {member.roleTitle}
              </Text>
            </>
          ) : null}
        </div>
      </div>

      <div className='flex w-28 shrink-0 flex-col items-end gap-1.5'>
        {hasPoints && tone ? (
          <>
            <Text emphasized className={cn('tabular-nums', tone.text)}>
              {member.points}
            </Text>
            <div className='h-1 w-full overflow-hidden rounded-full bg-muted'>
              <div
                className={cn('h-full rounded-full', tone.bar)}
                style={{ width: `${width}%` }}
              />
            </div>
          </>
        ) : (
          <span className='flex h-6 items-center justify-end'>
            {member.kind === MembershipKind.NEWBIE ? (
              <Sprout className='size-5 text-status-newbie' />
            ) : (
              <Archive className='size-5 text-status-alumni' />
            )}
          </span>
        )}
      </div>
    </button>
  );
}

function GroupProfilePage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const activeCount = MOCK_MEMBERS.filter(
    (m) => m.kind !== MembershipKind.FORMER
  ).length;

  return (
    <div
      data-theme={theme}
      className='min-h-screen bg-background text-foreground transition-colors duration-normal'
    >
      <div className='fixed top-page right-page z-50'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          aria-label='Téma váltása'
          className='border-border/60 bg-background/60 backdrop-blur-md'
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        >
          {theme === 'dark' ? (
            <Sun className='size-5' />
          ) : (
            <Moon className='size-5' />
          )}
        </Button>
      </div>

      <header className='bg-banner'>
        <div className='flex w-full mx-auto max-w-6xl flex-col gap-6 p-page md:flex-row md:items-end md:justify-between'>
          <div className='flex min-w-0 flex-col gap-3 px-section'>
            <span className='inline-flex w-fit items-center rounded-md bg-black/30 px-2.5 py-1 font-semibold text-[11px] text-slate-200 uppercase tracking-wider'>
              {SEMESTER_BADGE}
            </span>
            <h1 className='font-bold text-4xl text-white tracking-tight md:text-5xl'>
              {CURRENT_GROUP.name}
            </h1>
            <p className='max-w-lg text-slate-400 text-sm leading-relaxed'>
              Alapítva: {FOUNDATION_YEAR} • {OBJECTIVE_TEXT}
            </p>
          </div>
          <dl className='flex shrink-0 items-end gap-x-10 px-section'>
            <div className='flex flex-col gap-1 text-left md:text-right'>
              <dt className='font-medium text-slate-400 text-xs uppercase tracking-wider'>
                Aktivitás
              </dt>
              <dd className='font-bold text-2xl text-white tabular-nums'>
                {TOTAL_ACTIVITY.toLocaleString('en-US')}
              </dd>
            </div>
            <div className='flex flex-col gap-1 text-left md:text-right'>
              <dt className='font-medium text-slate-400 text-xs uppercase tracking-wider'>
                Tagok
              </dt>
              <dd className='font-bold text-2xl text-white tabular-nums'>
                {MOCK_MEMBERS.length}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <main className='mx-auto w-full max-w-6xl p-page'>
        <div className='grid gap-y-10 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] md:gap-x-section'>
          <div className='flex flex-col gap-8'>
            {/*TODO org tree component*/}
            <section className='flex flex-col gap-3 px-section hidden md:block'>
              <Subtitle>Struktúra</Subtitle>
              <ul className='list-disc space-y-1 pl-5 text-sm'>
                {[...MOCK_PARENTS, CURRENT_GROUP, ...MOCK_CHILDREN].map(
                  (group) => (
                    <li
                      key={group.id}
                      className={cn(
                        group.id === CURRENT_GROUP.id
                          ? 'font-semibold text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {group.name}
                    </li>
                  )
                )}
              </ul>
            </section>

            <section className='flex flex-col gap-4 px-section'>
              <Subtitle>Cél</Subtitle>
              <Paragraph className='text-muted-foreground'>
                {OBJECTIVE_TEXT}
              </Paragraph>
            </section>
          </div>

          <section className='flex min-w-0 flex-col gap-2 px-section'>
            <div className='mb-2 flex items-center justify-between gap-3'>
              <div className='flex items-baseline gap-2'>
                <Subtitle>Tagok</Subtitle>
                <Text muted className='text-sm'>
                  {activeCount} Aktív
                </Text>
              </div>
              <Button type='button' variant='outline' size='sm'>
                <Filter className='size-4' />
                <span>Rendezés</span>
              </Button>
            </div>
            <div className='divide-y divide-border/60'>
              {MOCK_MEMBERS.map((member) => (
                <MemberRow key={member.membershipId} member={member} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
