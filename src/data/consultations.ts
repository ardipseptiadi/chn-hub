/**
 * Consultation Products Data
 *
 * Default consultation products available for booking.
 * These are service products that users can purchase and schedule.
 */

import { ConsultationProduct, ConsultationCategory } from "@/lib/store";

export const consultationProducts: ConsultationProduct[] = [
  {
    id: "consult-1",
    title: "Career Strategy Session",
    description: "One-on-one guidance to accelerate your career growth.",
    longDescription: "Get personalized career advice from industry experts. We'll help you identify growth opportunities, navigate career transitions, and develop strategies for advancement. Perfect for professionals at any stage looking to level up.",
    duration: 60,
    basePrice: 150,
    category: "career",
    imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
    featured: true,
    disabled: false,
  },
  {
    id: "consult-2",
    title: "Business Planning Consultation",
    description: "Strategic planning to scale your business effectively.",
    longDescription: "Comprehensive business consultation covering strategy, operations, marketing, and financial planning. We'll work together to create actionable plans tailored to your business goals and market position.",
    duration: 90,
    basePrice: 250,
    category: "business",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86bde?w=600&h=400&fit=crop",
    featured: true,
    disabled: false,
  },
  {
    id: "consult-3",
    title: "Technical Architecture Review",
    description: "Expert review of your technical stack and architecture.",
    longDescription: "Deep-dive technical consultation covering code architecture, system design, scalability, and best practices. Get actionable recommendations to improve your technical foundation and prepare for growth.",
    duration: 60,
    basePrice: 200,
    category: "technical",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14ddc40a2727?w=600&h=400&fit=crop",
    featured: true,
    disabled: false,
  },
  {
    id: "consult-4",
    title: "UX/UI Design Feedback",
    description: "Professional review of your product's user experience.",
    longDescription: "Get expert feedback on your product's design, usability, and user experience. We'll identify improvement opportunities, discuss design patterns, and provide actionable recommendations to enhance your product.",
    duration: 45,
    basePrice: 175,
    category: "design",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d4594787?w=600&h=400&fit=crop",
    featured: true,
    disabled: false,
  },
  {
    id: "consult-5",
    title: "Startup Launch Strategy",
    description: "Go-to-market planning for your startup or product launch.",
    longDescription: "Comprehensive launch strategy session covering market analysis, positioning, go-to-market tactics, and launch timeline planning. Perfect for early-stage startups preparing for product launch.",
    duration: 90,
    basePrice: 300,
    category: "business",
    imageUrl: "https://images.unsplash.com/photo-1559136555-0634e6863b1a?w=600&h=400&fit=crop",
    featured: false,
    disabled: false,
  },
  {
    id: "consult-6",
    title: "Portfolio Review for Designers",
    description: "Get expert feedback on your design portfolio.",
    longDescription: "Portfolio review session covering curation, presentation, case study selection, and overall positioning. Learn how to showcase your best work and attract the opportunities you want.",
    duration: 45,
    basePrice: 120,
    category: "design",
    imageUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&h=400&fit=crop",
    featured: false,
    disabled: false,
  },
  {
    id: "consult-7",
    title: "Code Review Best Practices",
    description: "Review your code with focus on quality and maintainability.",
    longDescription: "Comprehensive code review covering code quality, maintainability, testing, and best practices. Get actionable feedback to improve your codebase and development workflow.",
    duration: 60,
    basePrice: 180,
    category: "technical",
    imageUrl: "https://images.unsplash.com/photo-1555066932-419c4e212bfaa?w=600&h=400&fit=crop",
    featured: false,
    disabled: false,
  },
  {
    id: "consult-8",
    title: "Career Transition Coaching",
    description: "Navigate your career change with confidence.",
    longDescription: "Guidance for professionals transitioning to new roles or industries. We'll help you leverage your existing skills, identify transferable skills, and create a roadmap for successful career transition.",
    duration: 75,
    basePrice: 200,
    category: "career",
    imageUrl: "https://images.unsplash.com/photo-1542744173-8f7d5f8220f1?w=600&h=400&fit=crop",
    featured: false,
    disabled: false,
  },
];

// Helper function to get consultation by ID
export function getConsultationById(id: string): ConsultationProduct | undefined {
  return consultationProducts.find((c) => c.id === id);
}

// Helper function to get consultations by category
export function getConsultationsByCategory(category: ConsultationCategory): ConsultationProduct[] {
  return consultationProducts.filter((c) => c.category === category);
}

// Helper function to get featured consultations
export function getFeaturedConsultations(): ConsultationProduct[] {
  return consultationProducts.filter((c) => c.featured && !c.disabled);
}

// Category labels and descriptions
export const consultationCategories: Record<ConsultationCategory, { label: string; description: string; icon: string }> = {
  career: { label: "Career", description: "Career guidance and coaching", icon: "User" },
  business: { label: "Business", description: "Business strategy and planning", icon: "Briefcase" },
  technical: { label: "Technical", description: "Code and architecture review", icon: "Code" },
  design: { label: "Design", description: "UX/UI design feedback", icon: "Palette" },
};
