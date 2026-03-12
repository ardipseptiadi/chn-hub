import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useState, useEffect, useCallback } from "react";
import { products as defaultProducts, Product } from "@/data/products";
import { portfolioItems as defaultPortfolio, PortfolioItem } from "@/data/portfolio";
import { blogPosts as defaultBlog, BlogPost } from "@/data/blog";

// Extended types with admin fields
export interface StoredProduct extends Product {
  disabled: boolean;
}

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

export interface SiteSettings {
  businessName: string;
}

const KEYS = {
  products: "store_products",
  portfolio: "store_portfolio",
  blog: "store_blog",
  contacts: "store_contacts",
  settings: "store_settings",
  socials: "store_socials",
  experiences: "store_experiences",
  adminPassword: "store_admin_password",
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
    write(KEYS.settings, { businessName: "Creativo" });
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

// Public hooks
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
  return useStoreData<SiteSettings>(KEYS.settings, { businessName: "Creativo" });
}

export function useSocials() {
  return useStoreData<SocialLink[]>(KEYS.socials, defaultSocials);
}

export function useExperiences() {
  return useStoreData<ExperienceItem[]>(KEYS.experiences, defaultExperiences);
}

export function getAdminPassword(): string {
  return read<string>(KEYS.adminPassword, "admin123");
}

export function setAdminPassword(pw: string) {
  write(KEYS.adminPassword, pw);
}

// Helper to add a contact message (used by the Contact page)
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

// Generate unique ID
export function genId() {
  return crypto.randomUUID();
}
