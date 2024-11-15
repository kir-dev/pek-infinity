import { Building2, BuildingIcon, CalendarIcon, InfoIcon, LinkIcon, MailIcon, UserIcon } from 'lucide-react';

import { Card } from '../ui/card';

export function GroupInfo() {
  return (
    <div className='flex flex-col justify-center items-center p-4 gap-4'>
      <div className='flex flex-row gap-4 max-w-7xl w-full'>
        <Card className='bg-blue-50 p-6 rounded-lg flex-1'>
          <h2 className='text-lg font-semibold text-blue-800 flex items-center'>
            <BuildingIcon className='mr-2 h-5 w-5 text-blue-800' />
            Organization Details
          </h2>
          <p className='text-gray-600 mt-2 text-sm'> Founded</p>
          <p className='flex items-center'>
            <CalendarIcon className='h-5 w-5 mr-2' />
            2003
          </p>

          <p className='text-gray-600 mt-2 text-sm'>Parent Organization </p>
          <p className='flex items-center'>
            <Building2 className='h-5 w-5 mr-2 text-blue-600' />
            <a href='#' className='text-blue-600 hover:underline'>
              Corvin University
            </a>
          </p>
          <p className='text-gray-600 mt-2 text-sm'>Hub Director</p>
          <p className='flex items-center'>
            <UserIcon className='h-5 w-5 mr-2' />
            Dr. Emma Kovács
          </p>
        </Card>

        <Card className='bg-blue-50 p-6 rounded-lg flex-1'>
          <h2 className='text-lg font-semibold text-blue-800 flex items-center'>
            <MailIcon className='mr-2 h-5 w-5 text-blue-800' />
            Contact Information
          </h2>
          <p className='text-gray-600 mt-2 text-sm'>Website</p>
          <p className='flex items-center'>
            <LinkIcon className='mr-2 h-5 w-5 text-blue-600' />
            <a href='https://innovation.corvin.edu' className='text-blue-600 hover:underline'>
              innovation.corvin.edu
            </a>
          </p>
          <p className='text-gray-600 mt-2 text-sm'>Email</p>
          <p className='flex items-center'>
            <MailIcon className='h-5 w-5 text-blue-600 mr-2' />
            <a href='mailto:innovation@corvin.edu' className='text-blue-600 hover:underline'>
              innovation@corvin.edu
            </a>
          </p>
        </Card>
      </div>

      <Card className='bg-blue-50 p-4 rounded-lg w-full max-w-7xl'>
        <h2 className='text-lg font-semibold text-blue-800 flex items-center'>
          <InfoIcon className='mr-2 h-5 w-5 text-blue-800' />
          Description
        </h2>
        <p className='text-gray-700 mt-2'>
          The Corvin Innovation Hub is a dynamic space fostering creativity, entrepreneurship, and technological
          advancement among students and faculty.
        </p>
      </Card>
    </div>
  );
}
