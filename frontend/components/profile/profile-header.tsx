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

export function ProfileHeader() {
  const description = "I'm a passionate student leader with a keen interest in campus politics and public speaking.";
  const name = 'Jane Doe';
  const email = 'jane.doe@example.com';
  const building = 'Building A';
  const room = 'Room 101';
  const twitterHandle = '@janedoe';
  const facebookHandle = 'jane.doe';
  const sendHandle = '@jane_doe';
  const avatarSrc = '/placeholder.svg?height=128&width=128';

  return (
    <>
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
              <span className='text-sm text-gray-600'>{email}</span>
            </div>
            <div className='flex items-center gap-2'>
              <BuildingIcon className='h-5 w-5 text-gray-400' />
              <span className='text-sm text-gray-600'>{building}</span>
            </div>
            <div className='flex items-center gap-2'>
              <MapPinIcon className='h-5 w-5 text-gray-400' />
              <span className='text-sm text-gray-600'>{room}</span>
            </div>
          </div>
          <p className='mt-4 text-gray-700'>{description}</p>
        </CardContent>
      </Card>
    </>
  );
}
