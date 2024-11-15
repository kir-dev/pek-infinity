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
import { ProfileHeader } from './profile/profile-header';
import { ProfilePointsHighlights } from './profile/profile-points-highlights';


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
        <ProfilePointsHighlights />
      </motion.div>
    </div>
  );
}
