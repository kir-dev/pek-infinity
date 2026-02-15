import type { Meta, StoryObj } from '@storybook/react';
import { MembershipCard } from './membership-card';

const meta: Meta<typeof MembershipCard> = {
  title: 'Design System/Membership Card',
  component: MembershipCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MembershipCard>;

const baseProps = {
  groupName: 'Szent Schönherz Senior Lovagrend',
  groupAvatarFallback: 'SS',
  roles: 'körvezeto, gazdaságis',
  membershipType: 'TAG',
  startDate: '2020 mar',
};

export const Tier1: Story = {
  name: 'Tier 1 (AB Award)',
  args: {
    ...baseProps,
    variant: 'tier1',
  },
};

export const Tier2: Story = {
  name: 'Tier 2 (KB Award)',
  args: {
    ...baseProps,
    variant: 'tier2',
  },
};

export const Default: Story = {
  name: 'Default (Active)',
  args: {
    ...baseProps,
    variant: 'active',
  },
};

export const Alumni: Story = {
  name: 'Alumni (Archived)',
  args: {
    ...baseProps,
    variant: 'alumni',
    endDate: '2024 jún',
  },
};

export const Newbie: Story = {
  name: 'Newbie (Draft)',
  args: {
    ...baseProps,
    variant: 'newbie',
  },
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div className='flex flex-wrap gap-section'>
      <MembershipCard {...baseProps} variant='tier1' />
      <MembershipCard {...baseProps} variant='tier2' />
      <MembershipCard {...baseProps} variant='active' />
      <MembershipCard {...baseProps} variant='alumni' endDate='2024 jún' />
      <MembershipCard {...baseProps} variant='newbie' />
    </div>
  ),
};
