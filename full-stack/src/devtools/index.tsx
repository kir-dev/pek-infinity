import { TanStackDevtools } from '@tanstack/react-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { PackageJsonPanel } from './package-json.devtool';
import { StoreDevtoolPanel } from './tanstack-store.devtools';

export function Devtools() {
  return (
    <TanStackDevtools
      config={{
        position: 'bottom-right',
        theme: 'light',
      }}
      eventBusConfig={{ connectToServerBus: true }}
      plugins={[
        {
          name: 'TanStack Query',
          render: <ReactQueryDevtoolsPanel />,
        },
        {
          name: 'TanStack Router',
          render: <TanStackRouterDevtoolsPanel />,
        },
        {
          name: 'TanStack Store',
          render: <StoreDevtoolPanel />,
        },

        {
          name: 'Dependencies',
          render: <PackageJsonPanel />,
        },
      ]}
    />
  );
}
