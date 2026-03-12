import { useState, useEffect, useCallback } from "react";
import { products as defaultProducts, Product } from "@/data/products";
import { portfolioItems as defaultPortfolio, PortfolioItem } from "@/data/portfolio";
import { blogPosts as defaultBlog, BlogPost } from "@/data/blog";
import { consultationProducts as defaultConsultationProducts } from "@/data/consultations";
import { hashPassword, generateToken, setSession } from "@/lib/auth";

// Extended types with admin fields
export interface StoredProduct extends Product {
  disabled: boolean;
}

// ==================== USER MODELS ====================

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface StoredUser extends Omit<User, "passwordHash"> {
  // Password hash excluded for storage in a separate, more secure location in production
}

// ==================== ORDER MODELS ====================

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "completed" | "cancelled" | "refunded";
  createdAt: string;
  updatedAt: string;
}

// ==================== SCHEDULE MODELS ====================

export interface ScheduleArtifact {
  id: string;
  type: "video" | "pdf" | "note" | "audio";
  title: string;
  url: string;
  uploadedAt: string;
}

export interface Schedule {
  id: string;
  userId: string;
  type: "consultation" | "meeting";
  title: string;
  description?: string;
  dateTime: string;
  duration: number; // minutes
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  artifacts?: ScheduleArtifact[];
  createdAt: string;
  updatedAt: string;
}

// ==================== CONSULTATION MODELS ====================

export interface ConsultationProduct {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  duration: number; // minutes
  basePrice: number;
  category: ConsultationCategory;
  imageUrl: string;
  featured: boolean;
  disabled: boolean;
}

export type ConsultationCategory = "career" | "business" | "technical" | "design";

export interface ConsultationBooking {
  id: string;
  userId: string;
  productId: string;
  scheduledTime: string;
  duration: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  notes?: string;
  artifacts?: ConsultationArtifact[];
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationArtifact {
  id: string;
  type: "video" | "pdf" | "note" | "audio";
  title: string;
  url: string;
  uploadedAt: string;
}

export interface TimeSlot {
  id: string;
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  available: boolean;
}

export interface AvailabilitySlot {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  enabled: boolean;
}

export interface ConsultationPricing {
  id: string;
  duration: number; // minutes
  consultType: ConsultationCategory;
  memberType: "free" | "premium" | "vip";
  problemType: string;
  price: number;
}

export interface ProblemType {
  id: string;
  name: string;
  description: string;
}

// ==================== ANALYTICS MODELS ====================

export interface AnalyticsEvent {
  id: string;
  type: "view" | "click" | "purchase" | "consultation_booking";
  productId?: string;
  userId?: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface ProductAnalytics {
  productId: string;
  views: number;
  clicks: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
}

export interface UserActivity {
  userId: string;
  actions: AnalyticsEvent[];
  lastActive: string;
  totalSessions: number;
  totalPurchases: number;
  totalSpent: number;
}

// ==================== EXISTING MODELS ====================

export interface StoredPortfolioItem extends PortfolioItem {
  disabled: boolean;
}

export interface StoredBlogPost extends BlogPost {
  status: "published" | "draft";
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  read: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  enabled: boolean;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  tags: string[];
}

// ==================== EXTENDED SITE SETTINGS ====================

export interface SiteSettings {
  businessName: string;
  // Typography
  headingFont: string;
  bodyFont: string;
  baseFontSize: string;
  headingScale: number;
  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  // Hero content
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
}

const defaultSiteSettings: SiteSettings = {
  businessName: "Creativo",
  headingFont: "Inter",
  bodyFont: "Inter",
  baseFontSize: "16",
  headingScale: 1.2,
  primaryColor: "#6366f1",
  secondaryColor: "#8b5cf6",
  accentColor: "#f59e0b",
  heroTitle: "Digital Products That Empower Creators",
  heroSubtitle: "Beautifully crafted ebooks, courses, templates, and tools to help you build, launch, and grow your creative business.",
  heroCtaText: "Browse Products",
};

const KEYS = {
  products: "store_products",
  portfolio: "store_portfolio",
  blog: "store_blog",
  contacts: "store_contacts",
  settings: "store_settings",
  socials: "store_socials",
  experiences: "store_experiences",
  adminPassword: "store_admin_password",
  // New keys for user portal
  users: "store_users",
  orders: "store_orders",
  schedules: "store_schedules",
  consultationProducts: "store_consultation_products",
  consultationBookings: "store_consultation_bookings",
  availabilitySlots: "store_availability_slots",
  consultationPricing: "store_consultation_pricing",
  problemTypes: "store_problem_types",
  analyticsEvents: "store_analytics_events",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event("store-updated"));
}

const defaultSocials: SocialLink[] = [
  { id: "1", platform: "Email", url: "mailto:hello@creativo.com", icon: "Mail", enabled: true },
  { id: "2", platform: "Instagram", url: "https://instagram.com", icon: "Instagram", enabled: true },
  { id: "3", platform: "Telegram", url: "https://t.me", icon: "Send", enabled: false },
  { id: "4", platform: "TikTok", url: "https://tiktok.com", icon: "Music", enabled: false },
  { id: "5", platform: "Twitter / X", url: "https://x.com", icon: "Twitter", enabled: true },
  { id: "6", platform: "GitHub", url: "https://github.com", icon: "Github", enabled: true },
  { id: "7", platform: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin", enabled: true },
];

const defaultExperiences: ExperienceItem[] = [
  {
    id: "1",
    title: "Senior Product Designer",
    company: "Creativo Studio",
    location: "Remote",
    startDate: "2022-01",
    endDate: "",
    current: true,
    description: "Leading product design for digital products, creating user-centered experiences that drive engagement and growth.",
    tags: ["Product Design", "UX Research", "Design Systems"],
  },
  {
    id: "2",
    title: "UX Designer",
    company: "TechFlow Inc.",
    location: "San Francisco, CA",
    startDate: "2019-06",
    endDate: "2021-12",
    current: false,
    description: "Designed intuitive interfaces for SaaS products serving 50K+ users. Led user research and prototyping efforts.",
    tags: ["UI/UX", "Prototyping", "User Research"],
  },
  {
    id: "3",
    title: "Junior Designer",
    company: "PixelCraft Agency",
    location: "New York, NY",
    startDate: "2017-03",
    endDate: "2019-05",
    current: false,
    description: "Created brand identities and marketing materials for diverse clients across tech, fashion, and hospitality.",
    tags: ["Branding", "Graphic Design", "Marketing"],
  },
];

// Seed defaults
function seedDefaults() {
  if (!localStorage.getItem(KEYS.products)) {
    write(KEYS.products, defaultProducts.map((p) => ({ ...p, disabled: false })));
  }
  if (!localStorage.getItem(KEYS.portfolio)) {
    write(KEYS.portfolio, defaultPortfolio.map((p) => ({ ...p, disabled: false })));
  }
  if (!localStorage.getItem(KEYS.blog)) {
    write(KEYS.blog, defaultBlog.map((p) => ({ ...p, status: "published" as const })));
  }
  if (!localStorage.getItem(KEYS.contacts)) {
    write(KEYS.contacts, []);
  }
  if (!localStorage.getItem(KEYS.settings)) {
    write(KEYS.settings, defaultSiteSettings);
  }
  if (!localStorage.getItem(KEYS.socials)) {
    write(KEYS.socials, defaultSocials);
  }
  if (!localStorage.getItem(KEYS.experiences)) {
    write(KEYS.experiences, defaultExperiences);
  }
  if (!localStorage.getItem(KEYS.adminPassword)) {
    write(KEYS.adminPassword, "admin123");
  }
  // New keys for user portal
  if (!localStorage.getItem(KEYS.users)) {
    write(KEYS.users, []);
  }
  if (!localStorage.getItem(KEYS.orders)) {
    write(KEYS.orders, []);
  }
  if (!localStorage.getItem(KEYS.schedules)) {
    write(KEYS.schedules, []);
  }
  if (!localStorage.getItem(KEYS.consultationProducts)) {
    write(KEYS.consultationProducts, defaultConsultationProducts);
  }
  if (!localStorage.getItem(KEYS.consultationBookings)) {
    write(KEYS.consultationBookings, []);
  }
  if (!localStorage.getItem(KEYS.availabilitySlots)) {
    // Default availability: Mon-Fri 9am-5pm
    const defaultSlots: AvailabilitySlot[] = [1, 2, 3, 4, 5].map((day) => ({
      id: crypto.randomUUID(),
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "17:00",
      enabled: true,
    }));
    write(KEYS.availabilitySlots, defaultSlots);
  }
  if (!localStorage.getItem(KEYS.consultationPricing)) {
    write(KEYS.consultationPricing, []);
  }
  if (!localStorage.getItem(KEYS.problemTypes)) {
    const defaultProblemTypes: ProblemType[] = [
      { id: "1", name: "Career Guidance", description: "Career path and progression advice" },
      { id: "2", name: "Business Strategy", description: "Business planning and growth strategies" },
      { id: "3", name: "Technical Review", description: "Code review and technical architecture" },
      { id: "4", name: "Design Feedback", description: "UI/UX design review and feedback" },
    ];
    write(KEYS.problemTypes, defaultProblemTypes);
  }
  if (!localStorage.getItem(KEYS.analyticsEvents)) {
    write(KEYS.analyticsEvents, []);
  }
}

seedDefaults();

// Generic hook that re-reads on storage events
function useStoreData<T>(key: string, fallback: T): [T, (updater: (prev: T) => T) => void] {
  const [data, setData] = useState<T>(() => read(key, fallback));

  useEffect(() => {
    const handler = () => setData(read(key, fallback));
    window.addEventListener("store-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("store-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, [key]);

  const update = useCallback(
    (updater: (prev: T) => T) => {
      const current = read(key, fallback);
      const next = updater(current);
      write(key, next);
      setData(next);
    },
    [key]
  );

  return [data, update];
}

// ==================== PUBLIC HOOKS ====================

export function useProducts() {
  return useStoreData<StoredProduct[]>(KEYS.products, []);
}

export function usePortfolio() {
  return useStoreData<StoredPortfolioItem[]>(KEYS.portfolio, []);
}

export function useBlog() {
  return useStoreData<StoredBlogPost[]>(KEYS.blog, []);
}

export function useContacts() {
  return useStoreData<ContactMessage[]>(KEYS.contacts, []);
}

export function useSettings() {
  return useStoreData<SiteSettings>(KEYS.settings, defaultSiteSettings);
}

export function useSocials() {
  return useStoreData<SocialLink[]>(KEYS.socials, defaultSocials);
}

export function useExperiences() {
  return useStoreData<ExperienceItem[]>(KEYS.experiences, defaultExperiences);
}

// ==================== USER AUTH HOOKS ====================

export function useUsers() {
  return useStoreData<User[]>(KEYS.users, []);
}

export function useOrders() {
  return useStoreData<Order[]>(KEYS.orders, []);
}

export function useUserOrders(userId: string) {
  const [allOrders] = useOrders();
  return (allOrders || []).filter((o) => o.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function useSchedules() {
  return useStoreData<Schedule[]>(KEYS.schedules, []);
}

export function useUserSchedules(userId: string) {
  const [allSchedules] = useSchedules();
  return (allSchedules || []).filter((s) => s.userId === userId).sort((a, b) => b.dateTime.localeCompare(a.dateTime));
}

// ==================== CONSULTATION HOOKS ====================

export function useConsultationProducts() {
  return useStoreData<ConsultationProduct[]>(KEYS.consultationProducts, []);
}

export function useConsultationBookings() {
  return useStoreData<ConsultationBooking[]>(KEYS.consultationBookings, []);
}

export function useUserConsultationBookings(userId: string) {
  const [allBookings] = useConsultationBookings();
  return (allBookings || []).filter((b) => b.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function useAvailabilitySlots() {
  return useStoreData<AvailabilitySlot[]>(KEYS.availabilitySlots, []);
}

export function useConsultationPricing() {
  return useStoreData<ConsultationPricing[]>(KEYS.consultationPricing, []);
}

export function useProblemTypes() {
  return useStoreData<ProblemType[]>(KEYS.problemTypes, []);
}

// ==================== ANALYTICS HOOKS ====================

export function useAnalyticsEvents() {
  return useStoreData<AnalyticsEvent[]>(KEYS.analyticsEvents, []);
}

// Track an analytics event
export function trackEvent(event: Omit<AnalyticsEvent, "id" | "timestamp">) {
  const current = read<AnalyticsEvent[]>(KEYS.analyticsEvents, []);
  const newEvent: AnalyticsEvent = {
    ...event,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  write(KEYS.analyticsEvents, [newEvent, ...current]);
}

// Get product analytics
export function getProductAnalytics(productId: string): ProductAnalytics {
  const events = read<AnalyticsEvent[]>(KEYS.analyticsEvents, []);
  const productEvents = events.filter((e) => e.productId === productId);

  const views = productEvents.filter((e) => e.type === "view").length;
  const clicks = productEvents.filter((e) => e.type === "click").length;
  const purchases = productEvents.filter((e) => e.type === "purchase").length;

  // Calculate revenue from purchases
  const revenue = productEvents
    .filter((e) => e.type === "purchase")
    .reduce((sum, e) => sum + (Number(e.details?.price) || 0), 0);

  const conversionRate = views > 0 ? (purchases / views) * 100 : 0;

  return { productId, views, clicks, purchases, revenue, conversionRate };
}

// Get user activity
export function getUserActivity(userId: string): UserActivity {
  const events = read<AnalyticsEvent[]>(KEYS.analyticsEvents, []);
  const userEvents = events.filter((e) => e.userId === userId);

  const orders = read<Order[]>(KEYS.orders, []).filter((o) => o.userId === userId && o.status === "completed");

  return {
    userId,
    actions: userEvents,
    lastActive: userEvents.length > 0 ? userEvents[0].timestamp : "",
    totalSessions: new Set(userEvents.map((e) => e.timestamp.split("T")[0])).size,
    totalPurchases: orders.length,
    totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
  };
}

// ==================== AUTH FUNCTIONS ====================

// Register a new user
export async function registerUser(email: string, password: string, name: string): Promise<{ user: StoredUser; token: string } | null> {
  const users = read<User[]>(KEYS.users, []);

  // Check if email already exists
  if (users.some((u) => u.email === email)) {
    return null;
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password);
  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
    name,
    role: "user",
    createdAt: new Date().toISOString(),
  };

  // Save user
  write(KEYS.users, [...users, newUser]);

  // Generate token and set session
  const token = generateToken(newUser.id);
  setSession(newUser, token);

  const storedUser: StoredUser = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    createdAt: newUser.createdAt,
  };

  return { user: storedUser, token };
}

// Login user
export async function loginUser(email: string, password: string): Promise<{ user: StoredUser; token: string } | null> {
  const users = read<User[]>(KEYS.users, []);
  const passwordHash = await hashPassword(password);

  const user = users.find((u) => u.email === email && u.passwordHash === passwordHash);
  if (!user) {
    return null;
  }

  const token = generateToken(user.id);
  setSession(user, token);

  const storedUser: StoredUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };

  return { user: storedUser, token };
}

// Get user by ID
export function getUserById(userId: string): StoredUser | null {
  const users = read<User[]>(KEYS.users, []);
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  const { passwordHash: _, ...storedUser } = user;
  return storedUser;
}

// ==================== EXISTING HELPERS ====================

export function getAdminPassword(): string {
  return read<string>(KEYS.adminPassword, "admin123");
}

export function setAdminPassword(pw: string) {
  write(KEYS.adminPassword, pw);
}

export function addContactMessage(msg: Omit<ContactMessage, "id" | "date" | "read">) {
  const current = read<ContactMessage[]>(KEYS.contacts, []);
  const newMsg: ContactMessage = {
    ...msg,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    read: false,
  };
  write(KEYS.contacts, [newMsg, ...current]);
}

export function genId() {
  return crypto.randomUUID();
}
