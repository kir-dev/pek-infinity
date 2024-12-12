'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ChevronDownIcon,
  EyeIcon,
  EyeOffIcon,
  AlertTriangleIcon,
  ExternalLinkIcon,
  CameraIcon,
  SaveIcon,
} from 'lucide-react';

const VisibilityToggle = ({ isPublic, onToggle }: { isPublic: boolean; onToggle: (state: any) => void }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onToggle}
    className={`p-2 rounded-full transition-colors duration-200 ${
      isPublic ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {isPublic ? <EyeIcon className='h-4 w-4' /> : <EyeOffIcon className='h-4 w-4' />}
  </motion.button>
);

// Mock data for the edit page
const user: {
  firstName: string;
  lastName: string;
  username: string;
  previousUsernames: string[];
  email: string;
  gender: string;
  birthDate: string;
  building: string;
  room: string;
  phone: string;
  address: string;
  story: string;
  externalLinks: {
    [key: string]: string;
  };
} = {
  firstName: 'Jane',
  lastName: 'Doe',
  username: 'janedoe',
  previousUsernames: ['jane_d', 'jdoe123'],
  email: 'jane.doe@example.com',
  gender: 'Female',
  birthDate: '1995-05-15',
  building: 'A',
  room: '101',
  phone: '+1234567890',
  address: '123 Campus Street, University Town, ST 12345',
  story: "I'm a passionate student leader with a keen interest in campus politics and public speaking.",
  externalLinks: {
    twitter: '@janedoe',
    facebook: 'jane.doe',
    telegram: '@jane_doe',
    linkedin: 'jane-doe',
  },
};

export function ProfileEdit() {
  const [editedUser, setEditedUser] = useState(user);
  const [visibility, setVisibility] = useState({
    profilePicture: true,
    username: true,
    email: true,
    gender: true,
    birthDate: true,
    building: true,
    room: true,
    phone: true,
    address: true,
    story: true,
    externalLinks: {
      twitter: true,
      facebook: true,
      telegram: true,
      linkedin: true,
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleExternalLinkChange = (platform: string, value: string) => {
    setEditedUser((prev) => ({
      ...prev,
      externalLinks: { ...prev.externalLinks, [platform]: value },
    }));
  };

  const toggleVisibility = (field: any) => {
    if (field.startsWith('externalLinks.')) {
      const platform = field.split('.')[1] as 'twitter' | 'facebook'; // TODO: Replace with enum
      setVisibility((prev) => ({
        ...prev,
        externalLinks: {
          ...prev.externalLinks,
          [platform]: !prev.externalLinks[platform],
        },
      }));
    } else {
      setVisibility((prev) => ({ ...prev, [field]: !prev[field as keyof typeof visibility] }));
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900 p-4 sm:p-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-5xl mx-auto space-y-8'
      >
        <Alert className='bg-blue-100 border-l-4 border-blue-500 text-blue-700 mb-6 rounded-lg shadow-md'>
          <AlertTitle className='font-bold text-lg'>Verified User</AlertTitle>
          <AlertDescription className='mt-2'>
            <p>Your account has been verified. Thank you for confirming your identity.</p>
            <p className='mt-2'>
              To change your legal information (name or date of birth), please visit our{' '}
              <a
                href='https://example.com/legal-info-change'
                className='underline font-semibold hover:text-blue-800 transition-colors'
                target='_blank'
                rel='noopener noreferrer'
              >
                external platform <ExternalLinkIcon className='inline h-4 w-4' />
              </a>
            </p>
          </AlertDescription>
        </Alert>
        <motion.h1
          className='text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Edit Your Profile
        </motion.h1>
        <div className='grid gap-6 md:grid-cols-[250px_1fr]'>
          <Card className='h-fit bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg rounded-lg overflow-hidden'>
            <CardContent className='p-6'>
              <nav className='space-y-3'>
                {['Basic Info', 'Personal Information', 'External Links'].map((item, index) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className='block text-blue-100 hover:text-white hover:translate-x-1 transition-all duration-200'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    {item}
                  </motion.a>
                ))}
              </nav>
            </CardContent>
          </Card>
          <div className='space-y-8'>
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              id='basic-info'
              className='space-y-6 bg-white p-6 rounded-lg shadow-lg'
            >
              <h2 className='text-2xl font-semibold text-blue-600 mb-4'>Basic Information</h2>
              <div className='flex items-center space-x-6'>
                <div className='relative group'>
                  <Avatar className='h-32 w-32 border-4 border-blue-500 shadow-lg transition-transform duration-300 group-hover:scale-105'>
                    <AvatarImage
                      src='/placeholder.svg?height=128&width=128'
                      alt={`${editedUser.firstName} ${editedUser.lastName}`}
                    />
                    <AvatarFallback className='text-4xl bg-gradient-to-br from-blue-400 to-purple-400 text-white'>
                      {editedUser.firstName[0]}
                      {editedUser.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <Button variant='secondary' size='icon' className='rounded-full bg-white/80 hover:bg-white'>
                      <CameraIcon className='h-6 w-6 text-blue-500' />
                    </Button>
                  </div>
                  <div className='absolute -bottom-2 -right-2'>
                    <VisibilityToggle
                      isPublic={visibility.profilePicture}
                      onToggle={() => toggleVisibility('profilePicture')}
                    />
                  </div>
                </div>
                <div className='space-y-4 flex-grow'>
                  <Input
                    value={`${editedUser.firstName} ${editedUser.lastName}`}
                    readOnly
                    className='text-2xl font-bold bg-gray-100 border-none'
                  />
                  <div className='flex items-center space-x-2'>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant='outline' className='text-blue-500 hover:text-blue-600 hover:bg-blue-50'>
                          @{editedUser.username} <ChevronDownIcon className='ml-1 h-4 w-4' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-60 bg-white p-4 rounded-lg shadow-lg border border-blue-100'>
                        <h3 className='font-semibold mb-2 text-blue-600'>Previous usernames:</h3>
                        <ul className='list-disc list-inside space-y-1'>
                          {editedUser.previousUsernames.map((username, index) => (
                            <li key={index} className='text-sm text-gray-600'>
                              @{username}
                            </li>
                          ))}
                        </ul>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <div className='space-y-4'>
                <Label htmlFor='newUsername' className='text-lg font-medium text-gray-700'>
                  Set New Username
                </Label>
                <div className='flex items-center space-x-2'>
                  <Input
                    id='newUsername'
                    name='username'
                    value={editedUser.username}
                    onChange={handleInputChange}
                    className='flex-grow border-blue-200 focus:border-blue-500 focus:ring-blue-500'
                  />
                  <Button className='bg-blue-500 text-white hover:bg-blue-600 transition-colors'>Set Username</Button>
                </div>
                <Alert variant='default' className='bg-yellow-50 border-yellow-200 text-yellow-800 rounded-lg'>
                  <AlertTriangleIcon className='h-5 w-5' />
                  <AlertTitle className='font-semibold'>Warning</AlertTitle>
                  <AlertDescription>Username can only be changed 2 times per month.</AlertDescription>
                </Alert>
              </div>
              <Button className='w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105'>
                <SaveIcon className='mr-2 h-5 w-5' /> Save Basic Info
              </Button>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              id='personal-information'
              className='space-y-6 bg-white p-6 rounded-lg shadow-lg'
            >
              <h2 className='text-2xl font-semibold text-blue-600 mb-4'>Personal Information</h2>
              <div className='space-y-4'>
                <Label htmlFor='story' className='text-lg font-medium text-gray-700'>
                  Your Story
                </Label>
                <div className='flex items-start space-x-2'>
                  <Textarea
                    id='story'
                    name='story'
                    value={editedUser.story}
                    onChange={handleInputChange}
                    rows={4}
                    className='flex-grow border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg'
                  />
                  <VisibilityToggle isPublic={visibility.story} onToggle={() => toggleVisibility('story')} />
                </div>
              </div>
              <div className='grid gap-6 sm:grid-cols-2'>
                {[
                  { label: 'Gender', name: 'gender', type: 'select', options: ['Male', 'Female', 'Other'] },
                  { label: 'Date of Birth', name: 'birthDate', type: 'date', disabled: true },
                  { label: 'Phone', name: 'phone', type: 'tel' },
                  { label: 'Address', name: 'address', type: 'text' },
                  { label: 'Building', name: 'building', type: 'text' },
                  { label: 'Room', name: 'room', type: 'text' },
                ].map((field) => (
                  <div key={field.name} className='space-y-2'>
                    <Label htmlFor={field.name} className='text-sm font-medium text-gray-700'>
                      {field.label}
                    </Label>
                    <div className='flex items-center space-x-2'>
                      {field.type === 'select' ? (
                        <Select
                          value={editedUser[field.name as keyof typeof editedUser] as string}
                          onValueChange={(value) => setEditedUser((prev) => ({ ...prev, [field.name]: value }))}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={field.name}
                          name={field.name}
                          type={field.type}
                          value={editedUser[field.name as keyof typeof editedUser] as any}
                          onChange={handleInputChange}
                          disabled={field.disabled}
                          className={`flex-grow ${field.disabled ? 'bg-gray-100' : 'border-blue-200 focus:border-blue-500 focus:ring-blue-500'}`}
                        />
                      )}
                      <VisibilityToggle
                        isPublic={visibility[field.name as keyof typeof visibility] as boolean}
                        onToggle={() => toggleVisibility(field.name as keyof typeof visibility)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button className='w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105'>
                <SaveIcon className='mr-2 h-5 w-5' /> Save Personal Information
              </Button>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              id='external-links'
              className='space-y-6 bg-white p-6 rounded-lg shadow-lg'
            >
              <h2 className='text-2xl font-semibold text-blue-600 mb-4'>External Links</h2>
              <div className='space-y-4'>
                {Object.entries(editedUser.externalLinks).map(([platform, link], index) => (
                  <motion.div
                    key={platform}
                    className='flex items-center space-x-2'
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Badge variant='secondary' className='text-sm w-24 bg-blue-100 text-blue-800'>
                      {platform}
                    </Badge>
                    <Input
                      value={link}
                      onChange={(e) => handleExternalLinkChange(platform, e.target.value)}
                      className='flex-grow border-blue-200 focus:border-blue-500 focus:ring-blue-500'
                    />
                    <VisibilityToggle
                      isPublic={visibility.externalLinks[platform as keyof typeof visibility.externalLinks] as boolean}
                      onToggle={() => toggleVisibility(`externalLinks.${platform}`)}
                    />
                  </motion.div>
                ))}
              </div>
              <Button className='w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105'>
                <SaveIcon className='mr-2 h-5 w-5' /> Save External Links
              </Button>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
