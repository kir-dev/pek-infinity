'use client';

import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';
import * as React from 'react';

import {
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MatrixDropdown } from './matrix-dropdown';
import { WidgetDropdown } from './widget-dropdown';

export interface DropdownLink {
  title: string;
  href: string;
  description: string;
}

const matrixComponents: DropdownLink[] = [
  {
    title: 'Alert Dialog',
    href: '/',
    description: 'A modal dialog that interrupts the user with important content and expects a response.',
  },
  {
    title: 'Hover Card',
    href: '/',
    description: 'For sighted users to preview content available behind a link.',
  },
  {
    title: 'Progress',
    href: '/',
    description:
      'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.',
  },
  {
    title: 'Scroll-area',
    href: '/',
    description: 'Visually or semantically separates content.',
  },
  {
    title: 'Tabs',
    href: '/',
    description: 'A set of layered sections of content—known as tab panels—that are displayed one at a time.',
  },
  {
    title: 'Tooltip',
    href: '/',
    description:
      'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
  },
];

const widgetComponents: DropdownLink[] = [
  {
    href: '/',
    title: 'Introduction',
    description: 'Re-usable components built using Radix UI and Tailwind CSS.',
  },
  {
    href: '/',
    title: 'Installation',
    description: 'How to install dependencies and structure your app.',
  },
  {
    href: '/',
    title: 'Typography',
    description: 'Styles for headings, paragraphs, lists...etc',
  },
];

export const Navbar = forwardRef<
  ElementRef<typeof NavigationMenuPrimitive.Root>,
  ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn('relative z-10 flex w-screen flex-1 items-center justify-between sm:p-4', className)}
    {...props}
  >
    <NavigationMenuList>
      <NavigationMenuItem>
        <Link href='/' legacyBehavior passHref>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>PÉK</NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <div className='flex w-full max-w-sm items-center space-x-2'>
          <Input type='text' />
          <Button type='submit'>Search</Button>
        </div>
      </NavigationMenuItem>
    </NavigationMenuList>

    <NavigationMenuList>
      <WidgetDropdown components={widgetComponents} />
      <MatrixDropdown components={matrixComponents} />
      <Link href='/' legacyBehavior passHref>
        <NavigationMenuLink className={navigationMenuTriggerStyle()}>⚙️</NavigationMenuLink>
      </Link>
    </NavigationMenuList>
    <NavigationMenuViewport className='fixed right-0'>{/* navigation dropdown content */}</NavigationMenuViewport>
  </NavigationMenuPrimitive.Root>
));
Navbar.displayName = 'Navbar';
