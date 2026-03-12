export type ProductCategory = "all" | "ebook" | "saas" | "course" | "template";

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export type ProductPreviewSize = "small" | "medium" | "large";

export interface Product {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  price: number;
  priceMin?: number;
  priceMax?: number;
  priceType?: "fixed" | "range";
  category: ProductCategory;
  image: string; // Primary image (backward compatibility)
  images?: ProductImage[]; // Multiple images
  previewSize?: ProductPreviewSize;
  featured: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    title: "The Creator's Playbook",
    description: "A comprehensive guide to building your digital empire from scratch.",
    longDescription: "Learn the exact strategies and frameworks used by top creators to build sustainable online businesses. This 200+ page ebook covers audience building, content strategy, monetization, and scaling your impact. Packed with real-world case studies and actionable worksheets.",
    price: 29,
    category: "ebook",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=400&fit=crop",
    featured: true,
  },
  {
    id: "2",
    title: "TaskFlow Pro",
    description: "Smart project management tool designed for solopreneurs and small teams.",
    longDescription: "TaskFlow Pro is a beautifully designed SaaS application that helps you manage projects, track time, and collaborate effortlessly. Features include Kanban boards, time tracking, client portals, automated invoicing, and integrations with your favorite tools.",
    price: 19,
    category: "saas",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
    featured: true,
  },
  {
    id: "3",
    title: "Design Systems Masterclass",
    description: "Build scalable design systems that your whole team will love.",
    longDescription: "This comprehensive video course takes you from design system fundamentals to advanced patterns. Learn component architecture, token systems, documentation best practices, and how to get organizational buy-in. Includes 40+ video lessons, Figma files, and code templates.",
    price: 99,
    category: "course",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop",
    featured: true,
  },
  {
    id: "4",
    title: "Startup Landing Kit",
    description: "Beautiful, conversion-optimized landing page templates.",
    longDescription: "Launch faster with our collection of 12 professionally designed landing page templates. Built with React and Tailwind CSS, these templates are fully responsive, accessible, and optimized for conversions. Includes A/B testing guides and copywriting frameworks.",
    price: 49,
    category: "template",
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop",
    featured: true,
  },
  {
    id: "5",
    title: "SEO Deep Dive",
    description: "Everything you need to rank #1 on Google in 2024.",
    longDescription: "Master modern SEO with this data-driven ebook. Covers technical SEO, content optimization, link building strategies, and AI-powered content workflows. Updated quarterly with the latest algorithm changes and best practices.",
    price: 24,
    category: "ebook",
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&h=400&fit=crop",
    featured: false,
  },
  {
    id: "6",
    title: "Full-Stack Freelancing",
    description: "Go from employee to thriving freelancer in 90 days.",
    longDescription: "A step-by-step video course covering everything from finding your niche, pricing your services, landing clients, managing projects, and scaling to a six-figure freelance business. Includes templates for proposals, contracts, and invoices.",
    price: 79,
    category: "course",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
    featured: false,
  },
];
