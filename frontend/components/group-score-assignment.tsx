'use client';

import { useState, useRef, useEffect, Ref } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search } from 'lucide-react';

const members = [
  { id: '1', name: 'Emma Johnson', avatar: '/placeholder.svg' },
  { id: '2', name: 'Liam Williams', avatar: '/placeholder.svg' },
  { id: '3', name: 'Olivia Brown', avatar: '/placeholder.svg' },
  { id: '4', name: 'Noah Davis', avatar: '/placeholder.svg' },
  { id: '5', name: 'Ava Wilson', avatar: '/placeholder.svg' },
  { id: '6', name: 'Ethan Taylor', avatar: '/placeholder.svg' },
  { id: '7', name: 'Sophia Anderson', avatar: '/placeholder.svg' },
  { id: '8', name: 'Mason Thompson', avatar: '/placeholder.svg' },
  { id: '9', name: 'Isabella Martinez', avatar: '/placeholder.svg' },
  { id: '10', name: 'William Clark', avatar: '/placeholder.svg' },
  { id: '11', name: 'Mia Rodriguez', avatar: '/placeholder.svg' },
  { id: '12', name: 'James Lee', avatar: '/placeholder.svg' },
  { id: '13', name: 'Charlotte Walker', avatar: '/placeholder.svg' },
  { id: '14', name: 'Benjamin King', avatar: '/placeholder.svg' },
  { id: '15', name: 'Amelia Scott', avatar: '/placeholder.svg' },
];

const roles = [
  { id: '1', name: 'Event Organizer', maxPoints: 50, visible: true },
  { id: '2', name: 'Volunteer', maxPoints: 30, visible: true },
  { id: '3', name: 'Mentor', maxPoints: 40, visible: false },
  { id: '4', name: 'Tutor', maxPoints: 35, visible: false },
  { id: '5', name: 'Committee Member', maxPoints: 45, visible: true },
  { id: '6', name: 'Social Media Manager', maxPoints: 25, visible: true },
  { id: '7', name: 'Sustainability Lead', maxPoints: 40, visible: false },
  { id: '8', name: 'Sports Coordinator', maxPoints: 35, visible: true },
  { id: '9', name: 'Cultural Ambassador', maxPoints: 30, visible: false },
  { id: '10', name: 'Tech Support', maxPoints: 20, visible: true },
];

const maxPointsPerUser = 150;

export function GroupScoreAssignmentComponent() {
  const [scores, setScores] = useState<{ [member: string]: { [role: string]: number } }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLTableElement>(null);

  const handleScoreChange = (memberId: string, roleId: string, value: string) => {
    const newScore = parseInt(value) || 0;
    setScores((prevScores) => ({
      ...prevScores,
      [memberId]: {
        ...prevScores[memberId],
        [roleId]: newScore,
      },
    }));
  };

  const getTotalScore = (memberId: string) => {
    return Object.values(scores[memberId] || {}).reduce((sum: number, score: number) => sum + score, 0);
  };

  useEffect(() => {
    const table = tableRef.current;
    if (table) {
      const handleScroll = () => {
        const scrollLeft = table.scrollLeft;
        document.documentElement.style.setProperty('--table-scroll', `${scrollLeft}px`);
      };
      table.addEventListener('scroll', handleScroll);
      return () => table.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const filteredMembers = members.filter((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className='container mx-auto p-4 max-w-full overflow-x-auto'>
      <h1 className='text-2xl font-bold mb-4'>Group Score Assignment</h1>
      <div className='mb-4 relative'>
        <Input
          type='text'
          placeholder='Search members...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='pl-10'
        />
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
      </div>
      <div className='border rounded-lg overflow-hidden'>
        <ScrollArea className='h-[calc(100vh-12rem)]' ref={tableRef}>
          <div className='min-w-max'>
            <Table className='border-collapse'>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-40 bg-muted sticky left-0 z-20'>Member</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role.id} className='w-16 p-1 text-center border-x'>
                      <div className='font-medium text-xs'>{role.name}</div>
                      <div className='text-xs text-muted-foreground'>Max: {role.maxPoints}</div>
                    </TableHead>
                  ))}
                  <TableHead className='w-16 p-1 text-center bg-muted'>
                    <div className='font-medium text-xs'>Total</div>
                    <div className='text-xs text-muted-foreground'>Max: {maxPointsPerUser}</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className='w-40 sticky left-0 bg-background z-10'>
                      <div className='flex items-center space-x-2'>
                        <Avatar className='h-6 w-6'>
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className='font-medium text-sm'>{member.name}</span>
                      </div>
                    </TableCell>
                    {roles.map((role) => (
                      <TableCell key={role.id} className='p-0 border-x w-16'>
                        <Input
                          type='number'
                          min='0'
                          max={role.maxPoints}
                          className='w-full h-8 border-0 rounded-none text-center text-sm focus:ring-2 focus:ring-primary'
                          value={scores[member.id]?.[role.id] || ''}
                          onChange={(e) => handleScoreChange(member.id, role.id, e.target.value)}
                        />
                      </TableCell>
                    ))}
                    <TableCell className='w-16 text-center font-medium text-sm bg-muted'>
                      {getTotalScore(member.id)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
