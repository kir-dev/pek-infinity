'use client';

import {
  BuildingIcon,
  ChevronDownIcon,
  FacebookIcon,
  Link,
  MailIcon,
  MapPinIcon,
  SendIcon,
  TwitterIcon,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
export interface ProfileHeaderProps {
  user: {
    description: string;
    name: string;
    email: string;
    building: string;
    room: string;
    twitterHandle: string;
    facebookHandle: string;
    sendHandle: string;
    shortName: string;
    userTag: string;
  };
}

export function ProfileHeader({
  user: { description, name, email, building, room, twitterHandle, facebookHandle, sendHandle, shortName, userTag },
}: ProfileHeaderProps) {
  return (
    <Card className='mb-8 shadow-lg bg-white rounded-lg overflow-hidden'>
      <CardHeader className='p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white'>
        <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
          <Avatar className='h-32 w-32 border-4 border-white shadow-lg'>
            <AvatarImage src='/placeholder.svg?height=128&width=128' alt='Jane Doe' />
            <AvatarFallback className='text-4xl bg-white text-blue-500'>{shortName}</AvatarFallback>
          </Avatar>
          <div className='text-center sm:text-left'>
            <CardTitle className='text-3xl sm:text-4xl font-bold text-white mb-2'>{name}</CardTitle>
            <CardDescription className='text-lg text-blue-100'>
              <Button variant='link' className='p-0 text-blue-100 hover:text-white transition-colors'>
                {userTag} <ChevronDownIcon className='ml-1 h-4 w-4' />
              </Button>
            </CardDescription>
          </div>
          <div className='sm:ml-auto flex gap-2'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='ghost' size='icon' className='text-white hover:bg-white/20'>
                    <a href={`https://x.com/${twitterHandle}`} target='_blank' rel='noopener noreferrer'>
                      <TwitterIcon className='h-5 w-5' />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{twitterHandle}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button variant='ghost' size='icon' className='text-white hover:bg-white/20'>
                    <a href={`https://facebook.com/${facebookHandle}`} target='_blank' rel='noopener noreferrer'>
                      <FacebookIcon className='h-5 w-5' />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{facebookHandle}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='ghost' size='icon' className='text-white hover:bg-white/20'>
                    <a href={`https://gmail.com/${sendHandle}`} target='_blank' rel='noopener noreferrer'>
                      <SendIcon className='h-5 w-5' />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{sendHandle}</p>
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
  );
}
