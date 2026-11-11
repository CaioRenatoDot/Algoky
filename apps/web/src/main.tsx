import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { PageLoader } from './components/ui/Feedback.tsx';
import { queryClient } from './lib/queries.ts';
import { initTheme, useTheme } from './lib/theme.ts';
import { router } from './router.tsx';
import './styles.css';

initTheme();

function ThemedToaster() {
  const { resolved } = useTheme();
  return (
    <Toaster
      theme={resolved}
      position="top-center"
      richColors={false}
      closeButton
      toastOptions={{ duration: 3500 }}
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<PageLoader />}>
        <RouterProvider router={router} />
      </Suspense>
      <ThemedToaster />
    </QueryClientProvider>
  </StrictMode>,
);
