import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

const meta: Meta<typeof Sheet> = {
  title: 'Design System/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          background:
            'linear-gradient(135deg, hsl(320 100% 50%), hsl(200 100% 50%))',
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>Open Right Sheet</Button>
      </SheetTrigger>
      <SheetContent side='right'>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <label htmlFor='name' className='text-right'>
              Name
            </label>
            <input
              id='name'
              defaultValue='Pedro Duarte'
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <label htmlFor='username' className='text-right'>
              Username
            </label>
            <input
              id='username'
              defaultValue='@peduarte'
              className='col-span-3'
            />
          </div>
        </div>
        <SheetFooter>
          <Button type='submit'>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>Open Left Sheet</Button>
      </SheetTrigger>
      <SheetContent side='left'>
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            Access different sections of the app.
          </SheetDescription>
        </SheetHeader>
        <div className='py-4'>
          <nav className='space-y-2'>
            <button
              type='button'
              className='block w-full rounded px-4 py-2 text-left hover:bg-accent'
            >
              Home
            </button>
            <button
              type='button'
              className='block w-full rounded px-4 py-2 text-left hover:bg-accent'
            >
              Profile
            </button>
            <button
              type='button'
              className='block w-full rounded px-4 py-2 text-left hover:bg-accent'
            >
              Settings
            </button>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const Top: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>Open Top Sheet</Button>
      </SheetTrigger>
      <SheetContent side='top'>
        <SheetHeader>
          <SheetTitle>Notification</SheetTitle>
          <SheetDescription>
            You have a new message from the team.
          </SheetDescription>
        </SheetHeader>
        <div className='py-4'>
          <p>
            Hey there! Just wanted to check in and see how things are going.
          </p>
        </div>
        <SheetFooter>
          <Button>Reply</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>Open Bottom Sheet</Button>
      </SheetTrigger>
      <SheetContent side='bottom'>
        <SheetHeader>
          <SheetTitle>Confirm Action</SheetTitle>
          <SheetDescription>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button variant='outline'>Cancel</Button>
          <Button variant='destructive'>Delete</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const WithoutCloseButton: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>Open Sheet (No Close Button)</Button>
      </SheetTrigger>
      <SheetContent side='right' showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>Custom Close</SheetTitle>
          <SheetDescription>
            This sheet has no built-in close button. Use the footer button
            instead.
          </SheetDescription>
        </SheetHeader>
        <div className='py-4'>
          <p>Content goes here...</p>
        </div>
        <SheetFooter>
          <SheetTrigger asChild>
            <Button>Close</Button>
          </SheetTrigger>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
