'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CalendarIcon,
  LinkIcon,
  MailIcon,
  UserIcon,
  SearchIcon,
  ArrowUpDown,
  BuildingIcon,
  InfoIcon,
} from 'lucide-react';
import Link from 'next/link';

const group = {
  name: 'Corvin Innovation Hub',
  foundingYear: 2018,
  isActive: true,
  parent: 'Corvin University',
  website: 'innovation.corvin.edu',
  mailingList: 'innovation@corvin.edu',
  leader: 'Dr. Emma Kovács',
  description:
    'The Corvin Innovation Hub is a dynamic space fostering creativity, entrepreneurship, and technological advancement among students and faculty.',
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

export function GroupViewComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const membersPerPage = 4;

  const filteredAndSortedMembers = useMemo(() => {
    return group.members
      .filter(
        (member) =>
          member.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (statusFilter === 'all' || member.status === statusFilter)
      )
      .sort((a, b) => {
        if (sortBy === 'name') {
          return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortBy === 'joinDate') {
          return sortOrder === 'asc' ? a.joinDate.localeCompare(b.joinDate) : b.joinDate.localeCompare(a.joinDate);
        } else if (sortBy === 'statusUpdatedDate') {
          return sortOrder === 'asc'
            ? a.statusUpdatedDate.localeCompare(b.statusUpdatedDate)
            : b.statusUpdatedDate.localeCompare(a.statusUpdatedDate);
        }
        return 0;
      });
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredAndSortedMembers.slice(indexOfFirstMember, indexOfLastMember);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900 p-4 sm:p-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-5xl mx-auto space-y-8'
      >
        <Card className='overflow-hidden shadow-lg'>
          <CardHeader className='p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-purple-500'>
            <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
              <Avatar className='h-32 w-32 border-4 border-white shadow-lg rounded-lg'>
                <AvatarImage src='/placeholder.svg?height=128&width=128' alt={group.name} />
                <AvatarFallback className='text-4xl bg-white text-blue-500'>
                  {group.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className='text-center sm:text-left'>
                <CardTitle className='text-3xl sm:text-4xl font-bold text-white mb-2'>{group.name}</CardTitle>
                <CardDescription className='text-lg text-blue-100 flex flex-col sm:flex-row sm:items-center'>
                  <span>Founded in {group.foundingYear}</span>
                  {group.isActive && (
                    <Badge className='ml-0 sm:ml-2 mt-2 sm:mt-0 bg-green-400 text-green-800 self-start sm:self-auto'>
                      Active
                    </Badge>
                  )}
                  <Link
                    href='https://pek-group-activity.v0.build/'
                    className='mt-2 sm:mt-0 sm:ml-4 text-white hover:underline self-start sm:self-auto'
                  >
                    View Activity Report
                  </Link>
                </CardDescription>
              </div>
              {/* Removed User and Star Icons */}
            </div>
          </CardHeader>
          <CardContent className='p-6 space-y-8'>
            <div className='grid gap-6 md:grid-cols-2'>
              <Card className='bg-blue-50'>
                <CardHeader>
                  <CardTitle className='text-xl flex items-center text-blue-800'>
                    <BuildingIcon className='mr-2 h-5 w-5' />
                    Organization Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className='space-y-2'>
                    <div>
                      <dt className='text-sm font-medium text-gray-600'>Parent Organization</dt>
                      <dd className='text-lg text-gray-900'>
                        <Link href='https://pek-group-activity.v0.build/' className='text-blue-600 hover:underline'>
                          {group.parent}
                        </Link>
                      </dd>
                    </div>
                    <div>
                      <dt className='text-sm font-medium text-gray-600'>Hub Director</dt>
                      <dd className='text-lg text-gray-900'>{group.leader}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              <Card className='bg-blue-50'>
                <CardHeader>
                  <CardTitle className='text-xl flex items-center text-blue-800'>
                    <MailIcon className='mr-2 h-5 w-5' />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className='space-y-2'>
                    <div>
                      <dt className='text-sm font-medium text-gray-600'>Website</dt>
                      <dd className='text-lg'>
                        <a
                          href={`https://${group.website}`}
                          className='text-blue-600 hover:underline flex items-center'
                        >
                          <LinkIcon className='mr-1 h-4 w-4' />
                          {group.website}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className='text-sm font-medium text-gray-600'>Email</dt>
                      <dd className='text-lg'>
                        <a
                          href={`mailto:${group.mailingList}`}
                          className='text-blue-600 hover:underline flex items-center'
                        >
                          <MailIcon className='mr-1 h-4 w-4' />
                          {group.mailingList}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
            <Card className='bg-purple-50'>
              <CardHeader>
                <CardTitle className='text-xl flex items-center text-gray-800'>
                  <InfoIcon className='mr-2 h-5 w-5' />
                  Mission Statement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-lg text-gray-700'>{group.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='bg-gradient-to-r from-blue-500 to-purple-500 p-6'>
                <CardTitle className='text-2xl font-bold flex items-center text-white'>
                  <UserIcon className='mr-2 h-6 w-6' />
                  Hub Members
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0'>
                  <div className='relative w-full md:w-auto'>
                    <SearchIcon className='absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground' />
                    <Input
                      type='text'
                      placeholder='Search by username'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='pl-8 w-full md:w-auto'
                    />
                  </div>
                  <div className='flex space-x-2 w-full md:w-auto'>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder='Filter by status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All</SelectItem>
                        <SelectItem value='active'>Active</SelectItem>
                        <SelectItem value='passive'>Passive</SelectItem>
                        <SelectItem value='archived'>Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(value) => handleSort(value)}>
                      <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder='Sort by' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='name'>Name</SelectItem>
                        <SelectItem value='joinDate'>Join Date</SelectItem>
                        <SelectItem value='statusUpdatedDate'>Status Updated Date</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant='outline' onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                      <ArrowUpDown className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
                <div className='flex justify-between items-center mb-4'>
                  <div className='text-sm text-muted-foreground'>
                    Showing {indexOfFirstMember + 1}-{Math.min(indexOfLastMember, filteredAndSortedMembers.length)} of{' '}
                    {filteredAndSortedMembers.length} members
                  </div>
                  <div className='flex'>
                    {Array.from({ length: Math.ceil(filteredAndSortedMembers.length / membersPerPage) }, (_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? 'default' : 'outline'}
                        className='mx-1'
                        onClick={() => paginate(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  <AnimatePresence>
                    {currentMembers.map((member, index) => (
                      <motion.div
                        key={member.username}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className='flex flex-col h-full transition-shadow hover:shadow-md bg-gray-50'>
                          <CardHeader className='p-4 pb-2 flex-grow'>
                            <div className='flex items-center space-x-3 mb-2'>
                              <Avatar className='h-10 w-10'>
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback>
                                  {member.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className='text-lg'>
                                  <Link href='https://pek-user.v0.build/' className='text-blue-600 hover:underline'>
                                    {member.name}
                                  </Link>
                                </CardTitle>
                                <CardDescription className='text-sm'>@{member.username}</CardDescription>
                              </div>
                            </div>
                            <div className='flex flex-wrap gap-1 mt-2'>
                              {member.currentRoles.map((role, roleIndex) => (
                                <Badge key={roleIndex} variant='secondary' className='bg-blue-100 text-blue-800'>
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </CardHeader>
                          <CardContent className='p-4 pt-2 flex flex-col justify-end'>
                            {member.pastRoles.length > 0 && (
                              <div className='mb-2'>
                                <span className='text-sm font-medium text-muted-foreground'>Past roles:</span>
                                <div className='flex flex-wrap gap-1 mt-1'>
                                  {member.pastRoles.map((role, roleIndex) => (
                                    <Badge
                                      key={roleIndex}
                                      variant='outline'
                                      className='bg-purple-100 text-purple-800 transition-colors duration-200 hover:bg-purple-200 hover:text-purple-900'
                                    >
                                      {role}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className='flex items-center text-sm text-muted-foreground mt-2'>
                              <CalendarIcon className='mr-1 h-3 w-3' />
                              <span>Joined: {member.joinDate}</span>
                            </div>
                            {member.endDate && (
                              <div className='flex items-center text-sm text-muted-foreground mt-1'>
                                <CalendarIcon className='mr-1 h-3 w-3' />
                                <span>Left: {member.endDate}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
