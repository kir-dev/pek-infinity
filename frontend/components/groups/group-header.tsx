import { InfoIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const group = {
  id: 1,
  name: 'Kir-Dev',
  foundingYear: 2001,
  isActive: true,
  isSvieMember: false,
  parent: 'Simonyi Károly Szakkollégium',
  website: 'kir-dev.hu',
  mailingList: 'hello@kir-dev.hu',
  leader: 'Bujdosó "Bohóc" Gergő',
  description:
    'A Szent Schönherz Senior Lovagrendben a BME Villamosmérnöki és Informatikai Karára kerülő elsősök nevelésével foglalkozunk. Figyelünk rájuk, segítjük a beilleszkedésüket az egyetemi életbe és koordináljuk a különböző közösségépítő és tanulmányi programokat (kirándulások, táborok, vacsorák, stb.). Lényeges részt vállalunk a kari Gólyatábor megszervezésében is. Szervezetünk fenti céljai mellett folyamatosan törekszünk tagjaink készségeinek fejlesztésére. Rendszeresen látogatunk és szervezünk tréningeket, csapatépítő táborokat, melyen karunk hallgatói vehetnek részt.',
  members: [
    {
      name: 'Dr. Emma Kovács',
      username: 'emma_k',
      avatar: '/placeholder.svg?height=40&width=40',
      currentRoles: ['Director', 'Professor'],
      pastRoles: ['Researcher'],
      joinDate: '2018.09.01',
      statusUpdatedDate: '2023.01.15',
      endDate: null,
      status: 'active',
    },
    {
      name: 'Máté Nagy',
      username: 'mate_n',
      avatar: '/placeholder.svg?height=40&width=40',
      currentRoles: ['Rep', 'Coordinator'],
      pastRoles: ['Intern'],
      joinDate: '2020.03.15',
      statusUpdatedDate: '2022.11.30',
      endDate: null,
      status: 'active',
    },
    {
      name: 'Zsófia Tóth',
      username: 'zsofia_t',
      avatar: '/placeholder.svg?height=40&width=40',
      currentRoles: ['Mentor', 'Facilitator'],
      pastRoles: ['Speaker'],
      joinDate: '2019.01.10',
      statusUpdatedDate: '2023.06.22',
      endDate: null,
      status: 'passive',
    },
    {
      name: 'Balázs Fekete',
      username: 'balazs_f',
      avatar: '/placeholder.svg?height=40&width=40',
      currentRoles: ['Tech Lead', 'Researcher'],
      pastRoles: ['Developer'],
      joinDate: '2018.11.05',
      statusUpdatedDate: '2023.03.01',
      endDate: null,
      status: 'active',
    },
    {
      name: 'Eszter Varga',
      username: 'eszter_v',
      avatar: '/placeholder.svg?height=40&width=40',
      currentRoles: ['Marketing', 'Social Media'],
      pastRoles: ['Planner'],
      joinDate: '2021.06.20',
      statusUpdatedDate: '2023.09.10',
      endDate: null,
      status: 'passive',
    },
    {
      name: 'Gábor Szilágyi',
      username: 'gabor_s',
      avatar: '/placeholder.svg?height=40&width=40',
      currentRoles: ['Liaison', 'Advisor'],
      pastRoles: ['Investor'],
      joinDate: '2019.09.01',
      statusUpdatedDate: '2023.12.31',
      endDate: '2023.12.31',
      status: 'archived',
    },
  ],
};

export function GroupHeader() {
  const historyUrl = `/groups/${group.id}/history`;
  return (
    <Card className='overflow-hidden shadow-lg max-w-7xl m-auto'>
      <CardHeader className='p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-purple-500'>
        <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
          <div className='text-center sm:text-left'>
            <CardTitle className='text-3xl sm:text-4xl font-bold text-white mb-3 flex items-center gap-3'>
              {group.name}
              <Badge variant={group.isActive ? 'success' : 'destructive'} className='tracking-wide'>
                {group.isActive ? 'Aktív' : 'Inaktív'}
              </Badge>
              <Badge variant={group.isSvieMember ? 'success' : 'destructive'} className='tracking-wide'>
                {group.isSvieMember ? 'SVIE tag' : 'Nem SVIE tag'}
              </Badge>
            </CardTitle>
            <p className='text-lg text-primary-foreground pb-7 text-justify'>{group.description}</p>
            <CardDescription className='text-lg text-blue-100 flex flex-col sm:flex-row sm:items-center gap-6'>
              <Link href={historyUrl} className={buttonVariants({ variant: 'secondary' })}>
                Jelentkezés
              </Link>
              <Link href={historyUrl} className={buttonVariants({ variant: 'secondary' })}>
                Történet
              </Link>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
