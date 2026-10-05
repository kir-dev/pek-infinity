import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetFooter } from './sheet';

const meta: Meta = {
  title: 'UI/Sheet',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background p-8">
        <div data-theme="dark" className="min-h-[calc(100vh-4rem)] rounded-xl">
          <Story />
        </div>
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="space-y-4">
        <Button onClick={() => setOpen(true)}>Open Sheet</Button>
        <Sheet
          open={open}
          onOpenChange={setOpen}
          title="Tag névjegye"
          description="Minta tartalom a glass sheetben."
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Itt lenne a tag részletes információjának listája, a tagsági
              kártyával együtt.
            </p>
          </div>
          <SheetFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Bezárás
            </Button>
            <Button>Módosítás</Button>
          </SheetFooter>
        </Sheet>
      </div>
    );
  },
};

export const NoTitle: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="space-y-4">
        <Button onClick={() => setOpen(true)}>Open Sheet (No Title)</Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Content without a header area.
            </p>
          </div>
          <SheetFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button>Confirm</Button>
          </SheetFooter>
        </Sheet>
      </div>
    );
  },
};

export const LongContent: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="space-y-4">
        <Button onClick={() => setOpen(true)}>Open Sheet (Long Content)</Button>
        <Sheet
          open={open}
          onOpenChange={setOpen}
          title="Szent Schönherz Senior Lovagrend szereplések"
        >
          <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-secondary p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    2020 ősz #{i}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {i * 10} pont
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sint commodi ex impedit architecto unde dolor. Nulla ut quo
                  quaerat. Quae qui ea dolor natus aut magnam eum.
                </p>
              </div>
            ))}
          </div>
        </Sheet>
      </div>
    );
  },
};
