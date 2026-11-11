import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { AppShell } from './components/AppShell.tsx';
import { RedirectIfAuthed, RequireAuth } from './components/RequireAuth.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

// Cada tela do app é um chunk separado, carregado sob demanda.
const LoginPage = lazy(() => import('./pages/auth/LoginPage.tsx'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage.tsx'));
const PatternsIndexPage = lazy(() => import('./pages/PatternsIndexPage.tsx'));
const PublicPatternPage = lazy(() => import('./pages/PublicPatternPage.tsx'));
const PublicProblemsPage = lazy(() => import('./pages/PublicProblemsPage.tsx'));
const GuidesIndexPage = lazy(() => import('./pages/GuidesIndexPage.tsx'));
const GuidePage = lazy(() => import('./pages/GuidePage.tsx'));
const BigOPage = lazy(() => import('./pages/BigOPage.tsx'));
const StartHerePage = lazy(() => import('./pages/StartHerePage.tsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.tsx'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage.tsx'));
const PatternPage = lazy(() => import('./pages/PatternPage.tsx'));
const WorkspacePage = lazy(() => import('./pages/WorkspacePage.tsx'));
const ProblemsPage = lazy(() => import('./pages/ProblemsPage.tsx'));
const ReviewPage = lazy(() => import('./pages/ReviewPage.tsx'));
const FocusPage = lazy(() => import('./pages/FocusPage.tsx'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage.tsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.tsx'));

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  // Conteúdo de estudo público: não exige conta.
  { path: '/padroes', element: <PatternsIndexPage /> },
  { path: '/padroes/:patternId', element: <PublicPatternPage /> },
  { path: '/comece-aqui', element: <StartHerePage /> },
  { path: '/problemas', element: <PublicProblemsPage /> },
  { path: '/guias', element: <GuidesIndexPage /> },
  { path: '/guias/:slug', element: <GuidePage /> },
  { path: '/big-o', element: <BigOPage /> },
  {
    element: <RedirectIfAuthed />,
    children: [
      { path: '/entrar', element: <LoginPage /> },
      { path: '/cadastro', element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/app',
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'trilha', element: <RoadmapPage /> },
          { path: 'trilha/:patternId', element: <PatternPage /> },
          { path: 'problemas', element: <ProblemsPage /> },
          { path: 'problemas/:slug', element: <WorkspacePage /> },
          { path: 'revisao', element: <ReviewPage /> },
          { path: 'foco', element: <FocusPage /> },
          { path: 'conquistas', element: <AchievementsPage /> },
          { path: 'configuracoes', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
