/**
 * SOUVERAIN - Types spécifiques au mode Commerce
 * Définit les structures pour les établissements/commerces
 */

// ============================================================
// ADRESSE
// ============================================================

export interface CommerceAddress {
  street: string;
  streetComplement?: string;
  postalCode: string;
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// ============================================================
// HORAIRES D'OUVERTURE
// ============================================================

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeSlot {
  open: string;   // Format "HH:mm"
  close: string;  // Format "HH:mm"
}

export interface DaySchedule {
  isOpen: boolean;
  slots: TimeSlot[];  // Permet plusieurs créneaux (ex: 9h-12h + 14h-19h)
}

export type OpeningHours = Record<DayOfWeek, DaySchedule>;

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

export const DAY_ORDER: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

// ============================================================
// ACCESSIBILITÉ & COMMODITÉS
// ============================================================

export type AccessibilityFeature =
  | 'wheelchair'
  | 'elevator'
  | 'parking'
  | 'parking_disabled'
  | 'public_transport'
  | 'bike_parking';

export interface AccessInfo {
  features: AccessibilityFeature[];
  publicTransport?: string;         // Description des transports (ex: "Métro Bastille ligne 1")
  parkingInfo?: string;             // Info parking (ex: "Parking souterrain à 50m")
  customInstructions?: string;      // Instructions personnalisées
}

export const ACCESSIBILITY_LABELS: Record<AccessibilityFeature, { label: string; icon: string }> = {
  wheelchair: { label: 'Accès PMR', icon: '♿' },
  elevator: { label: 'Ascenseur', icon: '🛗' },
  parking: { label: 'Parking', icon: '🅿️' },
  parking_disabled: { label: 'Place handicapé', icon: '♿🅿️' },
  public_transport: { label: 'Transports', icon: '🚇' },
  bike_parking: { label: 'Parking vélo', icon: '🚲' },
};

// ============================================================
// COMMODITÉS
// ============================================================

export type AmenityFeature =
  | 'wifi'
  | 'terrace'
  | 'air_conditioning'
  | 'heating'
  | 'toilets'
  | 'baby_changing'
  | 'pets_allowed'
  | 'private_room'
  | 'group_events';

export const AMENITY_LABELS: Record<AmenityFeature, { label: string; icon: string }> = {
  wifi: { label: 'WiFi gratuit', icon: '📶' },
  terrace: { label: 'Terrasse', icon: '☀️' },
  air_conditioning: { label: 'Climatisation', icon: '❄️' },
  heating: { label: 'Chauffage', icon: '🔥' },
  toilets: { label: 'Toilettes', icon: '🚻' },
  baby_changing: { label: 'Table à langer', icon: '👶' },
  pets_allowed: { label: 'Animaux acceptés', icon: '🐕' },
  private_room: { label: 'Salle privée', icon: '🚪' },
  group_events: { label: 'Événements groupe', icon: '👥' },
};

// ============================================================
// MOYENS DE PAIEMENT
// ============================================================

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'contactless'
  | 'check'
  | 'apple_pay'
  | 'google_pay'
  | 'ticket_restaurant'
  | 'bank_transfer';

export const PAYMENT_LABELS: Record<PaymentMethod, { label: string; icon: string }> = {
  cash: { label: 'Espèces', icon: '💵' },
  card: { label: 'Carte bancaire', icon: '💳' },
  contactless: { label: 'Sans contact', icon: '📱' },
  check: { label: 'Chèque', icon: '🏦' },
  apple_pay: { label: 'Apple Pay', icon: '🍎' },
  google_pay: { label: 'Google Pay', icon: '🤖' },
  ticket_restaurant: { label: 'Ticket Restaurant', icon: '🎟️' },
  bank_transfer: { label: 'Virement', icon: '🏧' },
};

// ============================================================
// PROFIL COMMERCE COMPLET
// ============================================================

export interface CommerceProfile {
  id: string;
  portfolioId: string;

  // Identité
  name: string;
  commerceType: string;             // Secteur (coiffeur_esthetique, restaurant_cafe, etc.)
  tagline?: string;                 // Slogan court

  // Visuels
  logoPath?: string;
  coverPhotoPath?: string;
  galleryPaths?: string[];

  // Localisation
  address: CommerceAddress;

  // Horaires
  openingHours: OpeningHours;
  exceptionalClosures?: string[];   // Dates de fermetures exceptionnelles

  // Accessibilité & Commodités
  access?: AccessInfo;
  amenities?: AmenityFeature[];

  // Paiement
  paymentMethods?: PaymentMethod[];
  priceRange?: 1 | 2 | 3 | 4;       // € à €€€€

  // Contact
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    linkedin?: string;
  };

  // Réservation
  bookingUrl?: string;
  bookingPhone?: string;
  acceptsWalkIns?: boolean;

  // Description
  about?: string;

  // Certifications & Spécialités
  certifications?: string[];
  specialties?: string[];

  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Crée des horaires par défaut (Lun-Ven 9h-18h)
 */
export function createDefaultOpeningHours(): OpeningHours {
  const defaultSlot: TimeSlot = { open: '09:00', close: '18:00' };

  return {
    monday: { isOpen: true, slots: [defaultSlot] },
    tuesday: { isOpen: true, slots: [defaultSlot] },
    wednesday: { isOpen: true, slots: [defaultSlot] },
    thursday: { isOpen: true, slots: [defaultSlot] },
    friday: { isOpen: true, slots: [defaultSlot] },
    saturday: { isOpen: false, slots: [] },
    sunday: { isOpen: false, slots: [] },
  };
}

/**
 * Formate les horaires pour affichage
 */
export function formatOpeningHours(hours: OpeningHours): string[] {
  const lines: string[] = [];

  for (const day of DAY_ORDER) {
    const schedule = hours[day];
    if (!schedule.isOpen || schedule.slots.length === 0) {
      lines.push(`${DAY_LABELS[day]}: Fermé`);
    } else {
      const slotsStr = schedule.slots
        .map((s) => `${s.open} - ${s.close}`)
        .join(', ');
      lines.push(`${DAY_LABELS[day]}: ${slotsStr}`);
    }
  }

  return lines;
}

/**
 * Vérifie si l'établissement est actuellement ouvert
 */
export function isCurrentlyOpen(hours: OpeningHours): boolean {
  const now = new Date();
  const dayIndex = now.getDay(); // 0 = Dimanche
  const dayMap: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayMap[dayIndex];

  const schedule = hours[today];
  if (!schedule.isOpen) return false;

  const currentTime = now.getHours() * 60 + now.getMinutes();

  for (const slot of schedule.slots) {
    const [openH, openM] = slot.open.split(':').map(Number);
    const [closeH, closeM] = slot.close.split(':').map(Number);
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;

    if (currentTime >= openTime && currentTime <= closeTime) {
      return true;
    }
  }

  return false;
}

/**
 * Crée un profil commerce vide
 */
export function createEmptyCommerceProfile(portfolioId: string): Partial<CommerceProfile> {
  return {
    portfolioId,
    name: '',
    commerceType: '',
    address: {
      street: '',
      postalCode: '',
      city: '',
      country: 'France',
    },
    openingHours: createDefaultOpeningHours(),
    paymentMethods: ['cash', 'card'],
    amenities: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
