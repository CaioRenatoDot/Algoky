import { ACHIEVEMENTS, type MutationResponse } from '@algoky/shared';
import { toast } from 'sonner';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function confetti(big = false) {
  if (reducedMotion()) return;
  const { default: fire } = await import('canvas-confetti');
  const colors = ['#c8372d', '#ef5a4c', '#f6c6bc', '#12a594', '#d18a00'];
  void fire({
    particleCount: big ? 160 : 70,
    spread: big ? 100 : 70,
    origin: { y: 0.7 },
    colors,
    disableForReducedMotion: true,
  });
}

/** Feedback visual para cada ação de estudo: XP, subida de nível e conquistas. */
export function celebrate(res: MutationResponse<unknown>, previousLevel?: number) {
  if (res.xpGained > 0) {
    toast.success(`+${res.xpGained} XP`, {
      description: `${res.level.xp} XP no total · nível ${res.level.level}`,
    });
  }
  const leveledUp = previousLevel !== undefined && res.level.level > previousLevel;
  if (leveledUp) {
    toast(`Nível ${res.level.level} alcançado!`, {
      description: `Agora você é ${res.level.title}.`,
      icon: '🎉',
    });
  }
  for (const code of res.newAchievements) {
    const a = ACHIEVEMENTS.find((x) => x.code === code);
    if (a) toast(`Conquista desbloqueada: ${a.name}`, { description: a.description, icon: '🏆' });
  }
  if (leveledUp || res.newAchievements.length > 0) void confetti(true);
  else if (res.xpGained >= 20) void confetti(false);
}
