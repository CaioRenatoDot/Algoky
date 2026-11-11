import { Construction } from 'lucide-react';
import { Page } from '../components/AppShell.tsx';
import { EmptyState } from '../components/ui/Feedback.tsx';

/** Placeholder temporário enquanto a tela é construída. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <Page>
      <EmptyState
        icon={<Construction className="h-5 w-5" />}
        title={title}
        description="Esta tela está em construção."
      />
    </Page>
  );
}
