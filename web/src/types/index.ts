// Centralized types for StylerNow
export type UserRole = 'CLIENT' | 'BARBER' | 'MANAGER' | 'MASTER' | 'SUPERADMIN';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'FREE' | 'ESSENTIAL' | 'STUDIO' | 'PRESTIGE' | 'SIGNATURE';
  status: 'PENDING_REVIEW' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  active: boolean;
  owner_id: string;
  address?: string;
  city?: string;
  country: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  trial_started_at: string;
  trial_ends_at: string;
  trial_reservations_count: number;
  trial_clients_count: number;
  trial_reminders_count: number;
  onboarding_step: number;
  onboarding_completed: boolean;
  created_at: string;
}

export interface ServiceCatalog {
  id: string;
  name: string;
  category: 'corte' | 'barba' | 'facial' | 'manicure' | 'depilacion' | 'mascarilla';
  image_path: string;
  default_price: number;
  default_duration_minutes: number;
}

export type TrialLimitType = 'reservations' | 'clients' | 'reminders';

export interface TrialStatus {
  isOnTrial: boolean;
  isExpired: boolean;
  daysLeft: number;
  hoursLeft: number;
  limits: {
    reservations: { used: number; max: number };
    clients: { used: number; max: number };
    reminders: { used: number; max: number };
  };
}

// Plan feature gates
export const PLAN_FEATURES: Record<string, string[]> = {
  FREE: ['appointments', 'staff_basic', 'services_basic', 'client_list'],
  ESSENTIAL: ['appointments', 'staff_basic', 'services_basic', 'client_list', 'email_reminders', 'push_notifications'],
  STUDIO: ['everything_in_essential', 'commissions', 'inventory', 'promotions', 'stats_basic'],
  PRESTIGE: ['everything_in_studio', 'multi_location', 'ai_marketing', 'marketplace', 'stats_advanced'],
  SIGNATURE: ['everything_in_prestige', 'white_label', 'api_access', 'custom_integrations'],
};

export const PREMIUM_FEATURES_INFO: Record<string, { plan: string; label: string }> = {
  inventory: { plan: 'STUDIO', label: 'Inventario' },
  marketplace: { plan: 'PRESTIGE', label: 'Marketplace' },
  promotions: { plan: 'STUDIO', label: 'Promociones' },
  ai_marketing: { plan: 'PRESTIGE', label: 'IA de Marketing' },
  stats_advanced: { plan: 'PRESTIGE', label: 'Estadísticas Avanzadas' },
  multi_location: { plan: 'PRESTIGE', label: 'Multi Sede' },
  commissions: { plan: 'STUDIO', label: 'Comisiones por Barbero' },
};
