import { EventClient } from '@tanstack/devtools-event-client';
import { createAtom, Store } from '@tanstack/store';
import { useEffect, useState } from 'react';

export const store = new Store({
  firstName: 'Jane',
  lastName: 'Smith',
});

export const fullName = createAtom(
  () => `${store.state.firstName} ${store.state.lastName}`
);

type EventMap = {
  'store-devtools:state': {
    firstName: string;
    lastName: string;
    fullName: string;
  };
};

class StoreDevtoolsEventClient extends EventClient<EventMap> {
  constructor() {
    super({
      pluginId: 'store-devtools',
    });
  }
}

const devToolsClient = new StoreDevtoolsEventClient();

store.subscribe(() => {
  devToolsClient.emit('store-devtools:state', {
    firstName: store.state.firstName,
    lastName: store.state.lastName,
    fullName: fullName.get(),
  });
});

export function StoreDevtoolPanel() {
  const [state, setState] = useState<EventMap['store-devtools:state']>(() => ({
    firstName: store.state.firstName,
    lastName: store.state.lastName,
    fullName: fullName.get(),
  }));

  useEffect(() => {
    return devToolsClient.on('store-devtools:state', (e) =>
      setState(e.payload)
    );
  }, []);

  return (
    <div className='grid grid-cols-[1fr_10fr] gap-4 p-4'>
      <div className='whitespace-nowrap font-bold text-gray-500 text-sm'>
        First Name
      </div>
      <div className='text-sm'>{state?.firstName}</div>
      <div className='whitespace-nowrap font-bold text-gray-500 text-sm'>
        Last Name
      </div>
      <div className='text-sm'>{state?.lastName}</div>
      <div className='whitespace-nowrap font-bold text-gray-500 text-sm'>
        Full Name
      </div>
      <div className='text-sm'>{state?.fullName}</div>
    </div>
  );
}
