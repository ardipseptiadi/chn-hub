import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, Sparkles, BookOpen, Code, Palette, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { useProducts, useSettings, StoredProduct } from "@/lib/store";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

// Product Card Component with image carousel support
const ProductCard = ({ product, index }: { product: StoredProduct; index: number }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allImages = product.images && product.images.length > 0 ? product.images : [{ id: "primary", url: product.image, alt: product.title, order: 0 }];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Get display price
  const getDisplayPrice = () => {
    if (product.priceType === "range" && product.priceMin && product.priceMax) {
      return `$${product.priceMin} - $${product.priceMax}`;
    }
    return `$${product.price}`;
  };

  return (
    <motion.div custom={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
      <Card className="group cursor-pointer overflow-hidden border-border transition-shadow hover:shadow-lg">
        <div className="relative aspect-[3/2] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={allImages[currentImageIndex].url}
              alt={allImages[currentImageIndex].alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </AnimatePresence>

          {/* Image carousel for multiple images */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={16} />
              </button>
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>

        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2">
            <span className="mb-2 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize text-secondary-foreground">{product.category}</span>
            {product.previewSize && product.previewSize !== "medium" && (
              <Badge variant="outline" className="text-xs capitalize">{product.previewSize}</Badge>
            )}
          </div>
          <h3 className="font-serif text-lg text-foreground">{product.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-primary">{getDisplayPrice()}</span>
            <Link to="/products" className="text-sm font-medium text-primary hover:underline">Learn more →</Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Index = () => {
  const [products] = useProducts();
  const [settings] = useSettings();
  const featuredProducts = products.filter((p) => p.featured && !p.disabled).slice(0, 4);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-warm-peach py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles size={14} /> Welcome to {settings.businessName}
              </span>
              <h1 className="mt-6 font-serif text-4xl leading-tight text-foreground md:text-6xl">
                {settings.heroTitle || "Digital Products That"}
                <br />
                <span className="text-primary">Empower Creators</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
                {settings.heroSubtitle || "Beautifully crafted ebooks, courses, templates, and tools to help you build, launch, and grow your creative business."}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link to="/products">
                    {settings.heroCtaText || "Browse Products"} <ArrowRight size={16} className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                  <Link to="/portfolio">View Portfolio</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10" />
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl text-foreground md:text-4xl">Featured Products</h2>
            <p className="mt-3 text-muted-foreground">Handpicked resources to accelerate your growth</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" className="rounded-full"><Link to="/products">View All Products</Link></Button>
          </div>
        </div>
      </section>

      {/* About / What I Do */}
      <section className="bg-card py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl text-foreground md:text-4xl">What I Create</h2>
            <p className="mt-4 text-muted-foreground">I'm passionate about creating resources that make a real difference.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: BookOpen, title: "Ebooks & Guides", desc: "In-depth resources packed with actionable insights and real-world strategies." },
              { icon: Code, title: "SaaS & Tools", desc: "Beautiful software solutions designed to streamline your workflow." },
              { icon: Palette, title: "Courses & Templates", desc: "Learn new skills or get a head start with ready-to-use templates." },
            ].map((item, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="border-border p-6 text-center transition-shadow hover:shadow-md">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-serif text-xl text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl text-foreground md:text-4xl">What People Are Saying</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Sarah Chen", role: "Indie Maker", text: "The Creator's Playbook completely changed how I think about digital products. Worth every penny!" },
              { name: "Marcus Johnson", role: "Freelance Designer", text: "TaskFlow Pro is the only project management tool that doesn't feel overwhelming. Clean, simple, powerful." },
              { name: "Emily Rivera", role: "Course Creator", text: "The Design Systems Masterclass helped me build a system that saved our team hundreds of hours." },
            ].map((t, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="border-border p-6">
                  <div className="mb-3 flex gap-1">
                    {[...Array(5)].map((_, j) => (<Star key={j} size={14} className="fill-warm-gold text-warm-gold" />))}
                  </div>
                  <p className="text-sm text-muted-foreground italic">"{t.text}"</p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-serif text-3xl text-primary-foreground">Stay in the Loop</h2>
            <p className="mt-3 text-primary-foreground/80">Get updates on new products, behind-the-scenes insights, and exclusive discounts.</p>
            <div className="mt-6 flex gap-3">
              <Input type="email" placeholder="your@email.com" className="flex-1 rounded-full border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50" />
              <Button variant="secondary" className="rounded-full px-6">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
