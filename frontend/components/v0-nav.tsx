'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserIcon, SearchIcon, BellIcon, LogOutIcon, MenuIcon, SettingsIcon, EditIcon, HomeIcon } from 'lucide-react';
import Link from 'next/link';

const availableRoles = [
  { id: 'verified', label: 'Verified User' },
  { id: 'student_council_leader', label: 'Student Council Group Leader' },
  { id: 'auditor', label: 'Auditor' },
  { id: 'site_admin', label: 'Site Admin' },
];

const navItems = [
  { icon: HomeIcon, label: 'Home', href: '/' },
  { icon: UserIcon, label: 'Me', href: '/me' },
];

export function Navbar() {
  const [selectedRoles, setSelectedRoles] = useState(['verified']);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New message from Student Council' },
    { id: 2, text: 'Your recent activity earned 50 points' },
    { id: 3, text: 'Upcoming event: Campus Clean-up Day' },
  ]);

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) => (prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]));
  };

  const getNavbarStyles = () => {
    if (selectedRoles.includes('site_admin')) {
      return {
        background: 'bg-gradient-to-r from-rose-500 to-pink-500',
        text: 'text-white',
      };
    } else if (selectedRoles.includes('student_council_leader')) {
      return {
        background: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        text: 'text-white',
      };
    } else if (selectedRoles.includes('auditor')) {
      return {
        background: 'bg-gradient-to-r from-amber-500 to-yellow-500',
        text: 'text-white',
      };
    }
    return {
      background: 'bg-gradient-to-r from-blue-500 to-purple-500',
      text: 'text-white',
    };
  };

  const navbarStyles = getNavbarStyles();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 w-full ${navbarStyles.background} ${navbarStyles.text} shadow-md`}
    >
      <div className='container flex h-16 items-center justify-between px-4'>
        <div className='flex items-center space-x-4'>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='md:hidden'>
                <MenuIcon className='h-6 w-6' />
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className={`${navbarStyles.background} ${navbarStyles.text}`}>
              <SheetHeader>
                <SheetTitle className='text-2xl font-bold'>Pek Menu</SheetTitle>
                <SheetDescription>Navigate through your student portal</SheetDescription>
              </SheetHeader>
              <nav className='mt-6 flex flex-col space-y-4'>
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className='flex items-center space-x-2 text-lg hover:bg-white/20 rounded-md p-2 transition-colors'
                  >
                    <item.icon className='h-5 w-5' />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href='/' className='flex items-center space-x-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='h-6 w-6'
            >
              <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' />
            </svg>
            <span className='font-bold text-xl'>Pek</span>
          </Link>
          <nav className='hidden md:flex items-center space-x-4'>
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className='flex items-center space-x-1 hover:bg-white/20 rounded-md p-2 transition-colors'
              >
                <item.icon className='h-5 w-5' />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className='flex items-center space-x-4'>
          <div className='hidden md:block'>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant='outline'
                  className={`relative h-9 w-64 justify-start text-sm font-normal shadow-none ${navbarStyles.text} bg-white/20 hover:bg-white/30`}
                >
                  <SearchIcon className='mr-2 h-4 w-4' />
                  <span>Search groups and users...</span>
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Advanced Search</DialogTitle>
                  <DialogDescription>Use PQL (P Query Language) to search for groups and users.</DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder='Enter your PQL query here...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='min-h-[100px]'
                />
                <Button type='submit' className='w-full'>
                  Search
                </Button>
              </DialogContent>
            </Dialog>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='ghost' size='icon' className='relative bg-white/30 hover:bg-white/40'>
                <BellIcon className='h-5 w-5' />
                {notifications.length > 0 && (
                  <span className='absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500' />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80'>
              <div className='flex justify-between items-center mb-2'>
                <h3 className='font-semibold'>Notifications</h3>
                <Button variant='ghost' size='sm'>
                  Mark all as read
                </Button>
              </div>
              {notifications.map((notification) => (
                <div key={notification.id} className='mb-2 p-2 hover:bg-gray-100 rounded-md'>
                  {notification.text}
                </div>
              ))}
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='bg-white/30 hover:bg-white/40'>
                <UserIcon className='h-5 w-5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem asChild>
                <Link href='/profile/edit'>
                  <EditIcon className='mr-2 h-4 w-4' />
                  <span>Edit Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='/settings'>
                  <SettingsIcon className='mr-2 h-4 w-4' />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Roles</DropdownMenuLabel>
              {availableRoles.map((role) => (
                <DropdownMenuItem key={role.id} onSelect={(e) => e.preventDefault()}>
                  <Checkbox
                    id={role.id}
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={() => toggleRole(role.id)}
                  />
                  <label
                    htmlFor={role.id}
                    className='ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    {role.label}
                  </label>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOutIcon className='mr-2 h-4 w-4' />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}
