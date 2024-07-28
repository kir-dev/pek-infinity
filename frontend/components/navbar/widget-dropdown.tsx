'use client';

import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

import type { DropdownLink } from '.';
import { ListItem } from './list-item';

export function WidgetDropdown({ components }: { components: DropdownLink[] }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className='grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]'>
          <li className='row-span-3'>
            <NavigationMenuLink asChild>
              <a
                className='flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md'
                href='/'
              >
                <span className='h-6 w-6'>ICON</span>
                <div className='mb-2 mt-4 text-lg font-medium'>shadcn/ui</div>
                <p className='text-sm leading-tight text-muted-foreground'>
                  Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable.
                  Open Source.
                </p>
              </a>
            </NavigationMenuLink>
          </li>
          {components.map((component) => (
            <ListItem href={component.href} title={component.title} key={component.title}>
              {component.description}
            </ListItem>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}
