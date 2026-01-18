'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  MessageCircle, 
  Users, 
  Settings, 
  LogOut, 
  Smartphone,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

const menuItems = [
  { href: '/inbox', label: 'Conversas', icon: MessageCircle },
  { href: '/contatos', label: 'Contatos', icon: Users },
  { href: '/whatsapp', label: 'WhatsApp', icon: Smartphone },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { usuario, logout } = useAuthStore();

  return (
    <aside className="w-64 bg-whatsapp-teal text-white flex flex-col">
      <div className="p-4 border-b border-whatsapp-dark">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-whatsapp-light rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">ZAID</h1>
            <p className="text-xs text-white/70">Multiatendimento</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition',
                isActive
                  ? 'bg-whatsapp-dark text-white'
                  : 'text-white/80 hover:bg-whatsapp-dark/50 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-whatsapp-dark">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-whatsapp-light rounded-full flex items-center justify-center text-sm font-bold">
            {usuario?.nome?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{usuario?.nome || 'Usuário'}</p>
            <p className="text-xs text-white/70 truncate">{usuario?.cargo}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-white/80 hover:text-white transition w-full px-4 py-2 rounded-lg hover:bg-whatsapp-dark/50"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
