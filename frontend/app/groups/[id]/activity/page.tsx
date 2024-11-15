'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AwardIcon, ChevronDownIcon, StarIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// This would typically come from an API or props
const groupData = {
  name: 'Corvin Innovation Hub',
  semesters: ['2023/2024 spring', '2023/2024 ősz', '2022/2023 spring', '2022/2023 ősz'],
  leaderPraise:
    "Our group has shown exceptional dedication this semester. We've seen increased participation in campus events and significant contributions from many members. Special recognition goes to those who went above and beyond in organizing our major initiatives.",
  members: [
    {
      id: 1,
      name: 'Emma Johnson',
      score: 9,
      awardClass: 'AB',
      comment:
        "Outstanding leadership in organizing the fall festival. Emma's initiative brought the community together and showcased our group's talents.",
    },
    { id: 2, name: 'Liam Williams', score: 47, awardClass: 'DO' },
    { id: 3, name: 'Olivia Brown', score: 12, awardClass: 'DO' },
    {
      id: 4,
      name: 'Noah Davis',
      score: 27,
      awardClass: 'KB',
      comment:
        "Exceptional effort in coordinating the new student orientation program. Noah's innovative approach helped new students integrate seamlessly.",
    },
    { id: 5, name: 'Ava Wilson', score: 5, awardClass: 'DO' },
    { id: 6, name: 'Ethan Taylor', score: 11, awardClass: 'DO' },
    { id: 7, name: 'Sophia Anderson', score: 5, awardClass: 'DO' },
    {
      id: 8,
      name: 'Mason Thompson',
      score: 50,
      awardClass: 'AB',
      comment:
        "Innovative ideas for improving student engagement. Mason's creativity led to a significant increase in participation across all events.",
    },
    {
      id: 9,
      name: 'Isabella Martinez',
      score: 26,
      awardClass: 'KB',
      comment:
        "Exemplary work in developing the group's social media presence. Isabella's efforts greatly improved our outreach and community engagement.",
    },
    { id: 10, name: 'William Clark', score: 5, awardClass: 'DO' },
    { id: 11, name: 'Mia Rodriguez', score: 5, awardClass: 'DO' },
    { id: 12, name: 'James Lee', score: 26, awardClass: 'DO' },
  ],
};

export default function GroupSemesterScores() {
  const [selectedSemester, setSelectedSemester] = useState(groupData.semesters[0]);
  const totalMembers = groupData.members.length;
  const entryCards = groupData.members.filter((member) => member.awardClass !== 'DO').length;

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900 p-4 sm:p-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-5xl mx-auto space-y-8'
      >
        <Card className='overflow-hidden shadow-lg'>
          <CardHeader className='p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-purple-500'>
            <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
              <Avatar className='h-32 w-32 border-4 border-white shadow-lg'>
                <AvatarImage src='/placeholder.svg?height=128&width=128' alt={groupData.name} />
                <AvatarFallback className='text-4xl bg-white text-blue-500'>
                  {groupData.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className='text-center sm:text-left'>
                <CardTitle className='text-3xl sm:text-4xl font-bold text-white mb-2'>{groupData.name}</CardTitle>
                <CardDescription className='text-lg text-blue-100'>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className='border-none bg-white/20 text-white hover:bg-white/30 transition-colors'>
                      <SelectValue placeholder='Select semester' />
                    </SelectTrigger>
                    <SelectContent>
                      {groupData.semesters.map((semester) => (
                        <SelectItem key={semester} value={semester}>
                          {semester}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardDescription>
              </div>
              <div className='sm:ml-auto flex gap-2'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='ghost' size='icon' className='text-white hover:bg-white/20'>
                        <UserIcon className='h-5 w-5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Group Members</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='ghost' size='icon' className='text-white hover:bg-white/20'>
                        <StarIcon className='h-5 w-5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Group Achievements</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='flex items-center justify-between bg-blue-100 rounded-lg p-4'>
                <div className='flex items-center space-x-2'>
                  <UserIcon className='h-6 w-6 text-blue-600' />
                  <span className='text-sm font-medium text-blue-800'>Total Members</span>
                </div>
                <span className='text-2xl font-bold text-blue-600'>{totalMembers}</span>
              </div>
              <div className='flex items-center justify-between bg-purple-100 rounded-lg p-4'>
                <div className='flex items-center space-x-2'>
                  <StarIcon className='h-6 w-6 text-purple-600' />
                  <span className='text-sm font-medium text-purple-800'>Entry Cards</span>
                </div>
                <span className='text-2xl font-bold text-purple-600'>{entryCards}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          <motion.div
            key='leader-praise'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className='overflow-hidden shadow-lg'>
              <CardHeader className='bg-gradient-to-r from-yellow-400 to-orange-500 p-6'>
                <CardTitle className='text-2xl font-bold flex items-center text-white'>
                  <AwardIcon className='mr-2 h-8 w-8' />
                  Group Leader's Praise
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <p className='text-gray-700 italic'>&ldquo;{groupData.leaderPraise}&rdquo;</p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          <motion.div
            key='member-contributions'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className='overflow-hidden shadow-lg'>
              <CardHeader className='bg-gradient-to-r from-green-400 to-blue-500 p-6'>
                <CardTitle className='text-2xl font-bold flex items-center text-white'>
                  <UserIcon className='mr-2 h-8 w-8' />
                  Member Contributions
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='flex-1'>Name</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead className='w-32 text-center'>Award Class</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupData.members.map((member, index) => (
                        <motion.tr
                          key={member.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className='group hover:bg-gray-50'
                        >
                          <TableCell className='font-medium'>
                            <Link
                              href={`/profile/${member.id}`}
                              className='text-blue-600 hover:text-blue-800 transition-colors duration-200'
                            >
                              {member.name}
                            </Link>
                            {(member.awardClass === 'AB' || member.awardClass === 'KB') && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.3 }}
                                className='text-sm text-gray-600 mt-1'
                              >
                                {member.comment}
                              </motion.div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className='font-semibold text-gray-700 text-center'>{member.score}</span>
                          </TableCell>
                          <TableCell className='text-center'>
                            <Badge
                              variant={
                                member.awardClass === 'AB'
                                  ? 'default'
                                  : member.awardClass === 'KB'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className={`
                                ${member.awardClass === 'AB' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
                                ${member.awardClass === 'KB' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}
                                ${member.awardClass === 'DO' ? 'bg-gray-500 hover:bg-gray-600 text-white' : ''}
                                transition-all duration-300 ease-in-out transform hover:scale-105
                              `}
                            >
                              {member.awardClass}
                            </Badge>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
