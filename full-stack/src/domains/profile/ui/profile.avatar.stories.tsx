import type { Meta, StoryObj } from '@storybook/react';
import { ProfileAvatar } from './profile.avatar';

const meta: Meta<typeof ProfileAvatar> = {
  title: 'Domains/Profile/ProfileAvatar',
  component: ProfileAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
    },
  },
  args: {
    src: 'https://www.w3schools.com/howto/img_avatar.png',
  },
};

export default meta;
type Story = StoryObj<typeof ProfileAvatar>;

export const KDO: Story = {
  args: {
    size: "4xl",
    status: { type: 'KDO', value: 42 },
    fallback: 'KD',
  },
};

export const KB: Story = {
  args: {
    size: "4xl",
    status: { type: 'KB', value: 85 },
    fallback: 'KB',
  },
};

export const AB: Story = {
  args: {
    size: "4xl",
    status: { type: 'AB', value: 100 },
    fallback: 'AB',
  },
};

export const Disabled: Story = {
  args: {
    size: 'xl',
    status: { type: 'disabled' },
    fallback: '??',
  },
};

export const Empty: Story = {
  args: {
    size: 'xl',
    status: false,
    src: undefined,
    fallback: 'JD',
  },
};

export const AllSizes: Story = {
  render: (args) => (
    <div className='flex items-end gap-2'>
      <ProfileAvatar {...args} size='xs' />
      <ProfileAvatar {...args} size='sm' />
      <ProfileAvatar {...args} size='md' />
      <ProfileAvatar {...args} size='lg' />
      <ProfileAvatar {...args} size='xl' />
      <ProfileAvatar {...args} size='2xl' />
      <ProfileAvatar {...args} size='3xl' />
      <ProfileAvatar {...args} size='4xl' />
    </div>
  ),
  args: {
    status: { type: 'KDO', value: 42 },
    fallback: '42',
  },
};
