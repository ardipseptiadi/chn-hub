export type PortfolioTag = "web" | "mobile" | "branding" | "ui/ux" | "saas";

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  tags: PortfolioTag[];
  image: string;
  link?: string;
}

export const portfolioItems: PortfolioItem[] = [
  {
    id: "1",
    title: "Bloom Health App",
    description: "A wellness tracking app with beautiful data visualizations and personalized insights. Designed the full UI/UX and developed the React Native frontend.",
    tags: ["mobile", "ui/ux"],
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
    link: "#",
  },
  {
    id: "2",
    title: "Verdant Brand Identity",
    description: "Complete brand identity for a sustainable fashion label, including logo, color palette, typography system, packaging design, and brand guidelines.",
    tags: ["branding"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
    link: "#",
  },
  {
    id: "3",
    title: "NovaPay Dashboard",
    description: "A fintech SaaS dashboard with real-time analytics, transaction management, and team collaboration features. Built with React and TypeScript.",
    tags: ["web", "saas", "ui/ux"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    link: "#",
  },
  {
    id: "4",
    title: "Artisan Coffee Co.",
    description: "E-commerce website and brand refresh for a specialty coffee roaster. Features an interactive bean selector and subscription management.",
    tags: ["web", "branding"],
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
    link: "#",
  },
  {
    id: "5",
    title: "StudyBuddy Platform",
    description: "An ed-tech SaaS platform connecting students with tutors. Includes video chat, scheduling, progress tracking, and payment processing.",
    tags: ["web", "saas"],
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&h=400&fit=crop",
    link: "#",
  },
  {
    id: "6",
    title: "FitTrack Mobile",
    description: "Fitness tracking mobile app with workout builder, progress photos, and social challenges. Focused on delightful micro-interactions.",
    tags: ["mobile", "ui/ux"],
    image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=400&fit=crop",
    link: "#",
  },
];
