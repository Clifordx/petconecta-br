import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Dog, 
  Scissors, 
  Stethoscope, 
  AlertTriangle, 
  CalendarDays, 
  HeartHandshake, 
  FileText,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { profile, organization } = useAuth();
  const location = useLocation();

  const isAdmin = profile?.papel === 'SUPER_ADMIN' || profile?.papel === 'ADMIN_MUNICIPIO';

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Pets', icon: Dog, path: '/admin/pets' },
    { name: 'Castração', icon: Scissors, path: '/admin/castracao' },
    { name: 'Consultas', icon: Stethoscope, path: '/admin/consultas' },
    { name: 'Denúncias', icon: AlertTriangle, path: '/admin/denuncias' },
    { name: 'Feiras', icon: CalendarDays, path: '/admin/feiras' },
    { name: 'Adoções', icon: HeartHandshake, path: '/admin/adocoes' },
    { name: 'Relatórios', icon: FileText, path: '/admin/relatorios' },
    ...(isAdmin ? [{ name: 'Usuários', icon: Users, path: '/admin/usuarios' }] : []),
  ];

  const roleLabels: Record<string, string> = {
    'SUPER_ADMIN': 'Super Admin',
    'ADMIN_MUNICIPIO': 'Admin Município',
    'MEMBRO_ONG': 'Membro ONG',
    'VETERINARIO': 'Veterinário',
    'CIDADAO': 'Cidadão',
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col md:sticky md:top-16 md:h-[calc(100vh-4rem)]",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Organization Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="font-semibold text-gray-900 truncate">
            {organization?.nome || 'Sistema PetConecta BR'}
          </div>
          <div className="mt-2 flex gap-2">
            <Badge variant="primary" className="text-xs">
              {profile?.papel ? roleLabels[profile.papel] : ''}
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary-50 text-primary-700" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={cn(
                  "mr-3 flex-shrink-0 h-5 w-5",
                  isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-500"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
