import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { TooltipProvider } from './components/ui/tooltip';
// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    Wrap: (props: { children: React.ReactNode }) => {
      return (
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>{props.children}</TooltipProvider>
        </QueryClientProvider>
      );
    },
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
};
