'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ReferenceDot } from 'recharts';
import {
  CalendarIcon,
  StarIcon,
  TrendingUpIcon,
  AwardIcon,
  TwitterIcon,
  FacebookIcon,
  SendIcon,
  MapPinIcon,
  BuildingIcon,
  MailIcon,
  ChevronDownIcon,
  InfoIcon,
} from 'lucide-react';

export function ProfilePageComponent() {
  const [hoveredPoint, setHoveredPoint] = useState<{ semester: string; total: number; highlight: boolean } | null>(
    null
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900 p-4 sm:p-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-5xl mx-auto space-y-8'
      >
        {/* Header Section */}
        <Card className='mb-8 shadow-lg bg-white rounded-lg overflow-hidden'>
          <CardHeader className='p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white'>
            <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
              <Avatar className='h-32 w-32 border-4 border-white shadow-lg'>
                <AvatarImage src='/placeholder.svg?height=128&width=128' alt='Jane Doe' />
                <AvatarFallback className='text-4xl bg-white text-blue-500'>JD</AvatarFallback>
              </Avatar>
              <div className='text-center sm:text-left'>
                <CardTitle className='text-3xl sm:text-4xl font-bold text-white mb-2'>Jane Doe</CardTitle>
                <CardDescription className='text-lg text-blue-100'>
                  <Button variant='link' className='p-0 text-blue-100 hover:text-white transition-colors'>
                    @janedoe <ChevronDownIcon className='ml-1 h-4 w-4' />
                  </Button>
                </CardDescription>
              </div>
              <div className='sm:ml-auto flex gap-2'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='ghost' size='icon' className='text-white hover:bg-white/20'>
                        <TwitterIcon className='h-5 w-5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>@janedoe</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='ghost' size='icon' className='text-white hover:bg-white/20'>
                        <FacebookIcon className='h-5 w-5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>jane.doe</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='ghost' size='icon' className='text-white hover:bg-white/20'>
                        <SendIcon className='h-5 w-5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>@jane_doe</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-6 sm:p-8'>
            <div className='grid gap-4 sm:grid-cols-3'>
              <div className='flex items-center gap-2'>
                <MailIcon className='h-5 w-5 text-gray-400' />
                <span className='text-sm text-gray-600'>jane.doe@example.com</span>
              </div>
              <div className='flex items-center gap-2'>
                <BuildingIcon className='h-5 w-5 text-gray-400' />
                <span className='text-sm text-gray-600'>Building A</span>
              </div>
              <div className='flex items-center gap-2'>
                <MapPinIcon className='h-5 w-5 text-gray-400' />
                <span className='text-sm text-gray-600'>Room 101</span>
              </div>
            </div>
            <p className='mt-4 text-gray-700'>
              I'm a passionate student leader with a keen interest in campus politics and public speaking.
            </p>
          </CardContent>
        </Card>

        {/* Groups Section */}
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl font-semibold text-gray-800'>Group Memberships</CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {[
                {
                  name: 'Student Council',
                  startDate: '2022-09-01',
                  currentRole: 'President',
                  pastRoles: ['Secretary'],
                  primary: true,
                },
                {
                  name: 'Debate Club',
                  startDate: '2021-09-01',
                  currentRole: 'Member',
                  pastRoles: ['Vice President'],
                  endDate: '2023-05-31',
                },
                { name: 'Chess Club', startDate: '2022-01-15', currentRole: 'Treasurer', pastRoles: [] },
                { name: 'Environmental Society', startDate: '2023-03-01', currentRole: 'Member', pastRoles: [] },
              ].map((membership, index) => (
                <motion.div key={index} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    key={index}
                    className={`h-full transition-shadow hover:shadow-md ${membership.primary ? 'border-blue-500' : ''} bg-gradient-to-br from-blue-50 to-purple-50`}
                  >
                    <CardHeader className='p-4'>
                      <CardTitle className='text-lg flex items-center justify-between text-gray-800'>
                        {membership.name}
                        {membership.primary && (
                          <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
                            Primary
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className='text-xs text-gray-500'>
                        <div className='flex items-center'>
                          <CalendarIcon className='mr-1 h-3 w-3' />
                          Started: {membership.startDate}
                          {membership.endDate && ` | Ended: ${membership.endDate}`}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='p-4 pt-0'>
                      <p className='text-sm text-gray-600'>
                        <strong>Role:</strong> {membership.currentRole}
                      </p>
                      {membership.pastRoles.length > 0 && (
                        <p className='text-sm text-gray-600 mt-1'>
                          <strong>Past:</strong> {membership.pastRoles.join(', ')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Points and Highlights Section */}
        <Card>
          <CardHeader className='bg-gradient-to-r from-blue-500 to-purple-500 p-6'>
            <CardTitle className='text-2xl font-bold flex items-center text-white'>
              <TrendingUpIcon className='mr-2 h-6 w-6' />
              Points and Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <Tabs defaultValue='list' className='w-full'>
              <TabsList className='w-full bg-white p-1 rounded-none'>
                <TabsTrigger
                  value='list'
                  className='w-1/2 data-[state=active]:bg-white data-[state=active]:text-blue-600'
                >
                  List View
                </TabsTrigger>
                <TabsTrigger
                  value='graph'
                  className='w-1/2 data-[state=active]:bg-white data-[state=active]:text-blue-600'
                >
                  Graph View
                </TabsTrigger>
              </TabsList>
              <TabsContent value='list' className='mt-0'>
                <div className='space-y-4 p-4'>
                  {[
                    {
                      semester: 'Fall 2023',
                      total: 180,
                      activities: [
                        {
                          group: 'Student Council',
                          points: 100,
                          highlight: true,
                          praise: 'Outstanding leadership in organizing the fall festival',
                        },
                        { group: 'Debate Club', points: 50 },
                        {
                          group: 'Chess Club',
                          points: 30,
                          highlight: true,
                          praise: 'Excellent organization of the inter-college chess tournament',
                        },
                      ],
                    },
                    {
                      semester: 'Spring 2023',
                      total: 150,
                      activities: [
                        {
                          group: 'Student Council',
                          points: 80,
                          highlight: true,
                          praise: 'Successful implementation of the new student feedback system',
                        },
                        { group: 'Debate Club', points: 40 },
                        { group: 'Environmental Society', points: 30 },
                      ],
                    },
                    {
                      semester: 'Fall 2022',
                      total: 120,
                      activities: [
                        { group: 'Student Council', points: 70 },
                        {
                          group: 'Debate Club',
                          points: 50,
                          highlight: true,
                          praise: 'Won the regional debate championship',
                        },
                      ],
                    },
                  ].map((semester, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className='overflow-hidden'>
                        <CardHeader className='bg-gradient-to-r from-blue-100 to-purple-100 p-4'>
                          <CardTitle className='text-xl flex justify-between items-center'>
                            <span>{semester.semester}</span>
                            <Badge
                              variant='secondary'
                              className='bg-blue-500 text-white hover:bg-blue-600 transition-colors'
                            >
                              {semester.total} Points
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='p-0'>
                          <ul className='divide-y divide-gray-200'>
                            {semester.activities.map((activity, actIndex) => (
                              <motion.li
                                key={actIndex}
                                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                className='p-4 transition-colors'
                              >
                                <div className='flex items-start justify-between'>
                                  <div className='flex-grow'>
                                    <div className='flex items-center justify-between'>
                                      <h4 className='text-lg font-semibold text-gray-800'>{activity.group}</h4>
                                      <span className='text-sm font-medium text-blue-600'>
                                        {activity.points} points
                                      </span>
                                    </div>
                                    {activity.highlight && (
                                      <p className='text-sm text-gray-600 mt-1 italic'>{activity.praise}</p>
                                    )}
                                  </div>
                                  {activity.highlight && (
                                    <Badge className='ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors flex items-center'>
                                      <StarIcon className='h-3 w-3 mr-1' />
                                      Highlight
                                    </Badge>
                                  )}
                                </div>
                              </motion.li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value='graph' className='mt-0'>
                <div className='p-4 bg-white'>
                  <ResponsiveContainer width='100%' height={400}>
                    <LineChart
                      data={[
                        { semester: 'Fall 2022', total: 120 },
                        { semester: 'Spring 2023', total: 150 },
                        { semester: 'Fall 2023', total: 180 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey='semester' stroke='#888' />
                      <YAxis stroke='#888' />
                      <RechartsTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className='bg-white p-3 rounded shadow-lg border border-gray-200'>
                                <p className='text-blue-600'>{`${label} : ${payload[0].value} points`}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type='monotone'
                        dataKey='total'
                        stroke='#3b82f6'
                        strokeWidth={3}
                        dot={{ r: 6, fill: '#3b82f6' }}
                      />
                      {[
                        { semester: 'Fall 2022', total: 120, highlight: true },
                        { semester: 'Spring 2023', total: 150, highlight: true },
                        { semester: 'Fall 2023', total: 180, highlight: true },
                      ].map((point, index) => (
                        <ReferenceDot
                          key={index}
                          x={point.semester}
                          y={point.total}
                          r={8}
                          fill={point.highlight ? '#eab308' : '#3b82f6'}
                          stroke='#ffffff'
                          strokeWidth={2}
                          onMouseEnter={() => setHoveredPoint(point)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>

                  <AnimatePresence>
                    {hoveredPoint && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className='mt-4 p-4 bg-gray-100 rounded-lg shadow-lg'
                      >
                        <h4 className='font-semibold text-blue-600'>{hoveredPoint.semester}</h4>
                        <p className='text-yellow-600'>Total Points: {hoveredPoint.total}</p>
                        <ul className='mt-2 space-y-2'>
                          {[
                            {
                              group: 'Student Council',
                              points: 100,
                              highlight: true,
                              praise: 'Outstanding leadership',
                            },
                            { group: 'Debate Club', points: 50 },
                            { group: 'Chess Club', points: 30, highlight: true, praise: 'Excellent organization' },
                          ].map((activity, index) => (
                            <li key={index} className='flex items-start space-x-2'>
                              <div className='mt-1'>
                                {activity.highlight ? (
                                  <AwardIcon className='h-4 w-4 text-yellow-500' />
                                ) : (
                                  <CalendarIcon className='h-4 w-4 text-gray-400' />
                                )}
                              </div>
                              <div>
                                <p className='font-medium text-blue-600'>
                                  {activity.group}: {activity.points} points
                                </p>
                                {activity.highlight && (
                                  <p className='text-sm text-yellow-600 italic'>{activity.praise}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
