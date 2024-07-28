'use client';

import { NavigationMenuContent, NavigationMenuItem, NavigationMenuTrigger } from '@/components/ui/navigation-menu';

import type { DropdownLink } from '.';
import { ListItem } from './list-item';

export function MatrixDropdown({ components }: { components: DropdownLink[] }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>Components</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className='grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] '>
          {components.map((component) => (
            <ListItem key={component.title} title={component.title} href={component.href}>
              {component.description}
            </ListItem>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}
