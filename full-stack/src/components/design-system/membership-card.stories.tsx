import type { Meta, StoryObj } from '@storybook/react';
import { MembershipCard } from './membership-card';

const meta: Meta = {
  title: 'Design System/Membership Card',
  parameters: {
    layout: 'padded',
  },

  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Tier1: Story = {
  name: 'Tier 1',
  render: () => <MembershipCard />,
};
