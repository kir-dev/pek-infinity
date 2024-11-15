'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { ProfileHeader } from './profile/profile-header';
import { ProfilePointsHighlights } from './profile/profile-points-highlights';

export function ProfilePageComponent() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900 p-4 sm:p-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-5xl mx-auto space-y-8'
      >
        <ProfileHeader />

        {/* Groups Section */}
        <GroupMemberships />

        <ProfilePointsHighlights />
      </motion.div>
    </div>
  );
}
