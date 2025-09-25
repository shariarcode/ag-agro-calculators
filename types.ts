
export interface FeedDataItem {
  code: string;
  name: string;
  price: number;
  kg: number;
}

export interface FeedCartItem {
  code: string;
  name: string;
  bags: number;
  kg: number;
  final: number;
}

export interface FeedHistoryItem {
  id: number;
  timestamp: string;
  shopName: string;
  items: FeedCartItem[];
  totalAmount: number;
  totalBags: number;
  totalKg: number;
}

export interface BroilerHistoryItem {
  id: number;
  timestamp: string;
  farmerName: string;
  farmerMobile: string;
  farmerAddress: string;
  totalBirds: number;
  feedConsumed: number;
  totalWeight: number;
  age: number;
  avgWeightPerBird: string;
  fcr: string;
  perBagWeight: string;
}

export interface ProfitHistoryItem {
  id: number;
  timestamp: string;
  totalChicks: number;
  chickPrice: number;
  totalFeedCost: number;
  totalMedicineCost: number;
  totalUtilityCost: number;
  totalLaborCost: number;
  totalWeightSold: number;
  pricePerKg: number;
  totalCost: number;
  totalIncome: number;
  netProfit: number;
  profitPerBird: number;
  costPerKg: number;
}

export interface NoticeItem {
  id: number;
  title: string;
  content: string;
  date: string;
  isActive: boolean;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export type View = 'main-menu' | 'feed-calculator' | 'broiler-calculator' | 'profit-calculator' | 'company-info' | 'farm-info' | 'admin-login' | 'admin-panel' | 'ai-assistant';

// --- Structured Company Info Types ---
export interface FeedMill {
  location: string;
  capacity: string;
  monthlyProduction: string;
}

export interface ManagementMember {
  title: string;
  name: string;
}

export interface ProductService {
  title: string;
  description: string;
}

export interface CompanyInfoData {
  introduction: string;
  feedMills: FeedMill[];
  depots: string[];
  products: ProductService[];
  management: ManagementMember[];
  ceoNote: string;
  socialResponsibility: string;
}

// --- Structured Farm Info Types ---
export interface FarmSetupInfo {
  location: string[];
  structure: string[];
  space: string[];
}

export interface AgeCareInfo {
  title: string;
  details: string[];
}

export interface VaccineInfo {
  id: string;
  age: string;
  vaccine: string;
  disease: string;
}

export interface FarmInfoData {
  setup: FarmSetupInfo;
  equipment: string[];
  broilerCare: AgeCareInfo;
  layerCare: AgeCareInfo;
  vaccineSchedule: VaccineInfo[];
  health: string[];
  economics: string[];
  tips: string[];
}
