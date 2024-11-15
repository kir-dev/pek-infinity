'use client';

import { motion } from 'framer-motion';

import { GroupMemberships } from '@/components/profile/group-memberships';

import { ProfileHeader, ProfileHeaderProps } from './profile/profile-header';
import { ProfilePointsHighlights } from './profile/profile-points-highlights';

const headerProps: ProfileHeaderProps = {
  user: {
    description: "I'm a passionate student leader with a keen interest in campus politics and public speaking.",
    name: 'Jane Doe',
    email: '',
    building: 'Building A',
    room: 'Room 101',
    twitterHandle: '@janedoe',
    facebookHandle: 'jane.doe',
    sendHandle: '@jane_doe',
    userTag: '@janedoe',
    shortName: 'JD',
  },
};

export function ProfilePageComponent() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900 p-4 sm:p-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-5xl mx-auto space-y-8'
      >
        <ProfileHeader user={headerProps.user} />

        {/* Groups Section */}
        <GroupMemberships />

        <ProfilePointsHighlights />
      </motion.div>
    </div>
  );
}
