'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AwardIcon,
  BuildingIcon,
  CalendarIcon,
  ChevronDownIcon,
  FacebookIcon,
  InfoIcon,
  MailIcon,
  MapPinIcon,
  SendIcon,
  StarIcon,
  TrendingUpIcon,
  TwitterIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';

import { GroupMemberships } from '@/components/profile/group-memberships';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { ProfileHeader } from './profile/profile-header';

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
        <ProfileHeader />

        {/* Groups Section */}
        <GroupMemberships />

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
