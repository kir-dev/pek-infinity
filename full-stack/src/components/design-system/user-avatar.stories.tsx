import type { Meta, StoryObj } from '@storybook/react';
import { UserAvatar, UserAvatarFallback, UserAvatarImage } from './user-avatar';

const meta: Meta<typeof UserAvatar> = {
  title: 'Design System/User Avatar',
  component: UserAvatar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  subcomponents: {
    UserAvatarImage,
    UserAvatarFallback,
  },
};

export default meta;
type Story = StoryObj<typeof UserAvatar>;

// ============================================================================
// Base Stories
// ============================================================================

export const Tier1: Story = {
  name: 'Tier 1 (AB Award)',
  args: {
    tier: 'tier-1',
    size: 'default',
    showBadge: true,
    children: (
      <>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='User with AB Award'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </>
    ),
  },
};

export const Tier2: Story = {
  name: 'Tier 2 (KB Award)',
  args: {
    tier: 'tier-2',
    size: 'default',
    showBadge: true,
    children: (
      <>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='User with KB Award'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </>
    ),
  },
};

export const Tier3: Story = {
  name: 'Tier 3 (Active)',
  args: {
    tier: 'active',
    size: 'default',
    showBadge: true,
    children: (
      <>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='Active User'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </>
    ),
  },
};

export const Unknown: Story = {
  name: 'Unknown (New User)',
  args: {
    tier: 'unknown',
    size: 'default',
    children: (
      <>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='New User'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </>
    ),
  },
};

export const Inactive: Story = {
  name: 'Inactive',
  args: {
    tier: 'inactive',
    size: 'default',
    children: (
      <>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='Inactive User'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </>
    ),
  },
};

// ============================================================================
// Size Stories
// ============================================================================

export const Small: Story = {
  name: 'Small Size (No Badge)',
  args: {
    tier: 'tier-1',
    size: 'sm',
    children: (
      <>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='Small User'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </>
    ),
  },
};

export const Default: Story = {
  name: 'Default Size',
  args: {
    tier: 'tier-1',
    size: 'default',
    children: (
      <>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='Default User'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </>
    ),
  },
};

export const Large: Story = {
  name: 'Large Size (2x Badge)',
  args: {
    tier: 'tier-2',
    size: 'lg',
    children: (
      <>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='Large User'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </>
    ),
  },
};

// ============================================================================
// Fallback Stories
// ============================================================================

export const WithFallback: Story = {
  name: 'With Fallback Only',
  args: {
    tier: 'tier-1',
    size: 'default',
    children: <UserAvatarFallback>AB</UserAvatarFallback>,
  },
};

export const WithoutBadge: Story = {
  name: 'Without Badge',
  args: {
    tier: 'tier-1',
    size: 'default',
    showBadge: false,
    children: (
      <>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='User without badge'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </>
    ),
  },
};

// ============================================================================
// Composite Stories
// ============================================================================

export const AllTiers: Story = {
  name: 'All Tiers',
  render: () => (
    <div className='flex flex-wrap items-end gap-8'>
      <UserAvatar tier='tier-1'>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='Tier 1'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </UserAvatar>
      <UserAvatar tier='tier-2'>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='Tier 2'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </UserAvatar>
      <UserAvatar tier='active'>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='Tier 3'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </UserAvatar>
      <UserAvatar tier='unknown'>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='Unknown'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </UserAvatar>
      <UserAvatar tier='inactive'>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='Inactive'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </UserAvatar>
    </div>
  ),
};

export const AllSizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div className='flex flex-wrap items-end gap-8'>
      <UserAvatar tier='tier-1' className='avatar-small'>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='Small'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </UserAvatar>
      <UserAvatar tier='tier-1' className='avatar-default'>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='Default'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </UserAvatar>
      <UserAvatar tier='tier-1' className='avatar-large'>
        <UserAvatarImage
          src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
          alt='Large'
        />
        <UserAvatarFallback>JD</UserAvatarFallback>
      </UserAvatar>
    </div>
  ),
};

export const AllVariants: Story = {
  name: 'Complete Grid',
  render: () => (
    <div className='flex flex-col gap-8'>
      {/* Tier 1 row */}
      <div className='flex items-end gap-4'>
        <UserAvatar tier='tier-1' className='avatar-small'>
          <UserAvatarFallback>T1</UserAvatarFallback>
        </UserAvatar>
        <UserAvatar tier='tier-1' className='avatar-default'>
          <UserAvatarFallback>T1</UserAvatarFallback>
        </UserAvatar>
        <UserAvatar tier='tier-1' className='avatar-large'>
          <UserAvatarFallback>T1</UserAvatarFallback>
        </UserAvatar>
      </div>
      {/* Tier 2 row */}
      <div className='flex items-end gap-4'>
        <UserAvatar tier='tier-2' className='avatar-small'>
          <UserAvatarFallback>T2</UserAvatarFallback>
        </UserAvatar>
        <UserAvatar tier='tier-2' className='avatar-default'>
          <UserAvatarFallback>T2</UserAvatarFallback>
        </UserAvatar>
        <UserAvatar tier='tier-2' className='avatar-large'>
          <UserAvatarFallback>T2</UserAvatarFallback>
        </UserAvatar>
      </div>
      {/* Tier 3 row */}
      <div className='flex items-end gap-4'>
        <UserAvatar tier='active' className='avatar-small'>
          <UserAvatarFallback>T3</UserAvatarFallback>
        </UserAvatar>
        <UserAvatar tier='active' className='avatar-default'>
          <UserAvatarFallback>T3</UserAvatarFallback>
        </UserAvatar>
        <UserAvatar tier='active' className='avatar-large'>
          <UserAvatarFallback>T3</UserAvatarFallback>
        </UserAvatar>
      </div>
      {/* Draft row */}
      <div className='flex items-end gap-4'>
        <UserAvatar tier='unknown' className='avatar-small'>
          <UserAvatarFallback>DR</UserAvatarFallback>
        </UserAvatar>
        <UserAvatar tier='unknown' className='avatar-default'>
          <UserAvatarFallback>DR</UserAvatarFallback>
        </UserAvatar>
        <UserAvatar tier='unknown' className='avatar-large'>
          <UserAvatarFallback>DR</UserAvatarFallback>
        </UserAvatar>
      </div>
      {/* Inactive row */}
      <div className='flex items-end gap-4'>
        <UserAvatar tier='inactive' className='avatar-small'>
          <UserAvatarFallback>IN</UserAvatarFallback>
        </UserAvatar>
        <UserAvatar tier='inactive' className='avatar-default'>
          <UserAvatarFallback>IN</UserAvatarFallback>
        </UserAvatar>
        <UserAvatar tier='inactive' className='avatar-large'>
          <UserAvatarFallback>IN</UserAvatarFallback>
        </UserAvatar>
      </div>
    </div>
  ),
};
