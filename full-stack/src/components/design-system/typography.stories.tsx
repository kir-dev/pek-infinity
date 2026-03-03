import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { Detail, Paragraph, Subtitle, Text, Title } from './typography';

const meta: Meta = {
  title: 'Design System/Typescale',
  parameters: {
    layout: 'padded',
  },

  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Overview
export const AllVariants: Story = {
  name: 'Overview',
  render: () => (
    <div className='max-w-2xl space-y-8'>
      <div>
        <h2 className='mb-4 font-semibold text-lg'>Title Variants</h2>
        <div className='space-y-2'>
          <div className='flex items-center gap-4'>
            <span className='w-32 text-muted-foreground text-xs'>Default</span>
            <Title>The Quick Brown Fox</Title>
          </div>
          <div className='flex items-center gap-4'>
            <span className='w-32 text-muted-foreground text-xs'>
              Emphasized
            </span>
            <Title>The Quick Brown Fox</Title>
          </div>
        </div>
      </div>

      <div>
        <h2 className='mb-4 font-semibold text-lg'>Subtitle Variants</h2>
        <div className='space-y-2'>
          <div className='flex items-center gap-4'>
            <span className='w-32 text-muted-foreground text-xs'>Default</span>
            <Subtitle>The Quick Brown Fox</Subtitle>
          </div>
          <div className='flex items-center gap-4'>
            <span className='w-32 text-muted-foreground text-xs'>
              Emphasized
            </span>
            <Subtitle>The Quick Brown Fox</Subtitle>
          </div>
        </div>
      </div>

      <div>
        <h2 className='mb-4 font-semibold text-lg'>Paragraph Variants</h2>
        <div className='space-y-2'>
          <div className='flex items-center gap-4'>
            <span className='w-32 text-muted-foreground text-xs'>Default</span>
            <Paragraph>The Quick Brown Fox</Paragraph>
          </div>
        </div>
      </div>

      <div>
        <h2 className='mb-4 font-semibold text-lg'>Body Variants</h2>
        <div className='space-y-2'>
          <div className='flex items-center gap-4'>
            <span className='w-32 text-muted-foreground text-xs'>Default</span>
            <Text>The Quick Brown Fox</Text>
          </div>
          <div className='flex items-center gap-4'>
            <span className='w-32 text-muted-foreground text-xs'>Muted</span>
            <Text muted>The Quick Brown Fox</Text>
          </div>
          <div className='flex items-center gap-4'>
            <span className='w-32 text-muted-foreground text-xs'>
              Emphasized
            </span>
            <Text emphasized>The Quick Brown Fox</Text>
          </div>
          <div className='flex items-center gap-4'>
            <span className='w-32 text-muted-foreground text-xs'>
              Muted + Emphasized
            </span>
            <Text muted emphasized>
              The Quick Brown Fox
            </Text>
          </div>
        </div>
      </div>

      <div>
        <h2 className='mb-4 font-semibold text-lg'>Detail Variants</h2>
        <div className='space-y-2'>
          <div className='flex items-center gap-4'>
            <span className='w-32 text-muted-foreground text-xs'>Default</span>
            <Detail>The Quick Brown Fox</Detail>
          </div>
          <div className='flex items-center gap-4'>
            <span className='w-32 text-muted-foreground text-xs'>
              Emphasized
            </span>
            <Detail emphasized>The Quick Brown Fox</Detail>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Title Stories
export const TitleDefault: Story = {
  name: 'Title',
  render: () => (
    <div className='space-y-4'>
      <Title>The Quick Brown Fox Jumps Over the Lazy Dog</Title>
      <Detail>20px bold, foreground</Detail>
    </div>
  ),
};

// Subtitle Stories
export const SubtitleDefault: Story = {
  name: 'Subtitle',
  render: () => (
    <div className='space-y-4'>
      <Subtitle>The Quick Brown Fox Jumps Over the Lazy Dog</Subtitle>
      <Detail>18px medium, foreground</Detail>
    </div>
  ),
};

// Paragraph Stories
export const ParagraphDefault: Story = {
  name: 'Paragraph',
  render: () => (
    <div className='space-y-4'>
      <Paragraph>The Quick Brown Fox Jumps Over the Lazy Dog</Paragraph>
      <Detail>14px regular, foreground</Detail>
    </div>
  ),
};

// Text Stories
export const TextDefault: Story = {
  name: 'Text',
  render: () => (
    <div className='space-y-4'>
      <Text>The Quick Brown Fox Jumps Over the Lazy Dog</Text>
      <Detail>14px regular, foreground</Detail>
    </div>
  ),
};

export const TextMuted: Story = {
  name: 'Text Muted',
  render: () => (
    <div className='space-y-4'>
      <Text muted>The Quick Brown Fox Jumps Over the Lazy Dog</Text>
      <Detail>14px regular, muted</Detail>
    </div>
  ),
};

export const TextEmphasized: Story = {
  name: 'Text Emphasized',
  render: () => (
    <div className='space-y-4'>
      <Text emphasized>The Quick Brown Fox Jumps Over the Lazy Dog</Text>
      <Detail>14px medium, foreground</Detail>
    </div>
  ),
};

export const TextMutedEmphasized: Story = {
  name: 'Text Muted Emphasized',
  render: () => (
    <div className='space-y-4'>
      <Text muted emphasized>
        The Quick Brown Fox Jumps Over the Lazy Dog
      </Text>
      <Detail>14px medium, muted</Detail>
    </div>
  ),
};

// Detail Stories
export const DetailDefault: Story = {
  name: 'Detail',
  render: () => (
    <div className='space-y-4'>
      <Detail>The Quick Brown Fox Jumps Over the Lazy Dog</Detail>
      <Detail>12px regular, always muted</Detail>
    </div>
  ),
};

export const DetailEmphasized: Story = {
  name: 'Detail Emphasized',
  render: () => (
    <div className='space-y-4'>
      <Detail emphasized>The Quick Brown Fox Jumps Over the Lazy Dog</Detail>
      <Detail>12px medium, always muted</Detail>
    </div>
  ),
};

// YouTube Comment Example
export const YoutubeComment: Story = {
  name: 'YouTube Comment Example',
  render: () => (
    <div className='max-w-md rounded-lg border p-4'>
      <div className='flex gap-3'>
        {/* Avatar placeholder */}
        <div className='h-9 w-9 shrink-0 rounded-full bg-muted' />

        <div className='min-w-0 flex-1'>
          {/* Header: username and date */}
          <div className='flex items-baseline gap-2'>
            <Text emphasized>John Doe</Text>
            <Detail>3 days ago</Detail>
          </div>

          {/* Content */}
          <Paragraph className='mt-1'>
            This is exactly what I was looking for! The explanation of Tailwind
            v4's font size configuration really helped me understand how to
            customize the base size.
          </Paragraph>

          {/* Actions row */}
          <div className='mt-2 flex items-center justify-between gap-2'>
            {/* Comments button */}
            <Button variant='link' className='w-fit p-0'>
              <Text emphasized>comments ▼</Text>
            </Button>

            {/* Like button with count */}
            <Button variant='outline' size='xs' className='w-fit'>
              <svg
                className='h-4 w-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <title>Like</title>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                />
              </svg>
              <Detail emphasized>89</Detail>
            </Button>
          </div>
        </div>
      </div>
    </div>
  ),
};
