import { motion } from 'framer-motion';

import { GroupMembershipCard } from '@/components/profile/group-membership-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function GroupMemberships() {
  const memberships = [
    {
      name: 'Student Council',
      startDate: '2022-09-01',
      currentRole: 'President',
      pastRoles: ['Secretary'],
      primary: true,
    },
    {
      name: 'Debate Club',
      startDate: '2021-09-01',
      currentRole: 'Member',
      pastRoles: ['Vice President'],
      endDate: '2023-05-31',
    },
    { name: 'Chess Club', startDate: '2022-01-15', currentRole: 'Treasurer', pastRoles: [] },
    { name: 'Environmental Society', startDate: '2023-03-01', currentRole: 'Member', pastRoles: [] },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-2xl font-semibold text-gray-800'>Group Memberships</CardTitle>
      </CardHeader>
      <CardContent className='p-6'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {memberships.map((membership, index) => (
            <motion.div key={index} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <GroupMembershipCard membership={membership} />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
