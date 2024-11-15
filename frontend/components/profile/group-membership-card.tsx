import { CalendarIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface MembershipProps {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  currentRole: string;
  pastRoles: string[];
}

export function GroupMembershipCard({ membership }: { membership: MembershipProps }) {
  return (
    <Card
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
  );
}
