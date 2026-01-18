import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarData(data: string | Date) {
  const d = new Date(data);
  const agora = new Date();
  const diff = agora.getTime() - d.getTime();
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (dias === 0) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } else if (dias === 1) {
    return 'Ontem';
  } else if (dias < 7) {
    return d.toLocaleDateString('pt-BR', { weekday: 'short' });
  } else {
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
}
