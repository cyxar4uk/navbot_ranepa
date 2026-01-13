import { 
  Calendar, 
  Users, 
  Map, 
  MessageCircle, 
  Briefcase, 
  Info,
  Sparkles,
  LucideIcon 
} from 'lucide-react';

interface ModuleTileProps {
  name: string;
  icon: string;
  onClick?: () => void;
  badge?: number;
}

const iconMap: Record<string, LucideIcon> = {
  Calendar,
  Users,
  Map,
  MessageCircle,
  Briefcase,
  Info,
  Sparkles
};

export function ModuleTile({ name, icon, onClick, badge }: ModuleTileProps) {
  const Icon = iconMap[icon] || Info;

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-2.5 py-4 group active:scale-95 transition-transform"
    >
      {badge !== undefined && badge > 0 && (
        <div className="absolute top-0 right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center z-10">
          {badge}
        </div>
      )}

      <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
        <Icon className="w-8 h-8 md:w-9 md:h-9 text-secondary group-hover:text-primary transition-colors" strokeWidth={1.5} />
      </div>

      <span className="text-xs md:text-sm text-foreground text-center leading-tight px-1">{name}</span>
    </button>
  );
}
