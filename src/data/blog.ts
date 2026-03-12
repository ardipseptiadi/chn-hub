export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  date: string;
  readTime: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "building-digital-products-that-sell",
    title: "Building Digital Products That Actually Sell",
    excerpt: "The secret isn't in the product — it's in the problem you solve. Here's how to validate and launch digital products people want to buy.",
    content: `<p>Creating a digital product is easy. Creating one that sells? That's a different story entirely.</p>
<p>After launching over a dozen digital products — some wildly successful, others complete flops — I've distilled the process into a framework that works every time.</p>
<h2>Start With the Pain</h2>
<p>The biggest mistake creators make is building what they think is cool instead of what people actually need. Before writing a single line of code or a single page of content, you need to validate the problem.</p>
<p>Talk to your audience. Read their comments. Join their communities. What are they struggling with? What keeps them up at night?</p>
<h2>The MVP Approach</h2>
<p>Don't spend six months building the perfect product. Launch a minimum viable version, get feedback, and iterate. Your first version should be slightly embarrassing — that means you launched fast enough.</p>
<h2>Price With Confidence</h2>
<p>Underpricing is the #1 mistake new creators make. If your product genuinely solves a problem, price it at what the solution is worth, not what the medium costs to produce.</p>`,
    coverImage: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&h=400&fit=crop",
    date: "2024-12-15",
    readTime: "5 min read",
    tags: ["business", "products"],
  },
  {
    id: "2",
    slug: "design-systems-for-indie-makers",
    title: "Design Systems for Indie Makers",
    excerpt: "You don't need a team of 50 to have a design system. Here's how solopreneurs can build consistent, beautiful products faster.",
    content: `<p>Design systems aren't just for big companies. In fact, indie makers might benefit from them even more.</p>
<h2>Why Bother?</h2>
<p>When you're building multiple products or features, a design system saves you from making thousands of small decisions. It's like having a creative co-pilot that ensures everything looks cohesive.</p>
<h2>Start Small</h2>
<p>You don't need a comprehensive system on day one. Start with: a color palette (5-7 colors), typography scale (3-4 sizes), spacing system (based on a 4px or 8px grid), and a handful of reusable components.</p>
<h2>Tools That Help</h2>
<p>Tailwind CSS is perfect for indie makers building design systems. Its utility-first approach lets you codify design decisions directly in your config file, making consistency automatic rather than effortful.</p>`,
    coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop",
    date: "2024-11-28",
    readTime: "4 min read",
    tags: ["design", "development"],
  },
  {
    id: "3",
    slug: "from-side-project-to-full-time",
    title: "From Side Project to Full-Time: My Journey",
    excerpt: "How I went from building things on weekends to running a sustainable creative business. The honest truth about the transition.",
    content: `<p>Two years ago, I was working a 9-5 and building digital products on nights and weekends. Today, my creative business generates a full-time income. Here's the unfiltered story.</p>
<h2>The Turning Point</h2>
<p>It wasn't a single moment. It was a series of small wins that compounded. My first ebook made $500 in its first month. Not life-changing, but proof that people would pay for what I created.</p>
<h2>The Messy Middle</h2>
<p>Months 3-12 were the hardest. Revenue was inconsistent. Imposter syndrome was real. I questioned everything. But I kept shipping, kept learning, and kept talking to customers.</p>
<h2>What Actually Worked</h2>
<p>Building in public, being genuinely helpful in communities, creating free content that demonstrated my expertise, and having the patience to let compounding do its thing.</p>`,
    coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop",
    date: "2024-11-10",
    readTime: "6 min read",
    tags: ["personal", "business"],
  },
];
