import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { usePortfolio, StoredPortfolioItem } from "@/lib/store";
import { PortfolioTag } from "@/data/portfolio";

const tags: { label: string; value: PortfolioTag | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Web", value: "web" },
  { label: "Mobile", value: "mobile" },
  { label: "Branding", value: "branding" },
  { label: "UI/UX", value: "ui/ux" },
  { label: "SaaS", value: "saas" },
];

const Portfolio = () => {
  const [items] = usePortfolio();
  const [activeTag, setActiveTag] = useState<PortfolioTag | "all">("all");
  const [selected, setSelected] = useState<StoredPortfolioItem | null>(null);

  const activeItems = items.filter((p) => !p.disabled);
  const filtered = activeTag === "all" ? activeItems : activeItems.filter((p) => p.tags.includes(activeTag as PortfolioTag));

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="font-serif text-4xl text-foreground md:text-5xl">Portfolio</h1>
            <p className="mt-3 text-lg text-muted-foreground">A selection of projects I'm proud of</p>
          </div>

          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {tags.map((tag) => (
              <button key={tag.value} onClick={() => setActiveTag(tag.value)} className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${activeTag === tag.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                {tag.label}
              </button>
            ))}
          </div>

          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                  <Card className="group cursor-pointer overflow-hidden border-border transition-shadow hover:shadow-lg" onClick={() => setSelected(item)}>
                    <div className="aspect-[3/2] overflow-hidden">
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                    </div>
                    <CardContent className="p-5">
                      <div className="mb-2 flex flex-wrap gap-1">{item.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs capitalize">{t}</Badge>)}</div>
                      <h3 className="font-serif text-xl text-foreground">{item.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">{selected.title}</DialogTitle>
              <DialogDescription><div className="flex flex-wrap gap-1">{selected.tags.map((t) => <Badge key={t} variant="secondary" className="capitalize">{t}</Badge>)}</div></DialogDescription>
            </DialogHeader>
            <div className="overflow-hidden rounded-lg"><img src={selected.image} alt={selected.title} className="h-64 w-full object-cover" /></div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{selected.description}</p>
            {selected.link && (
              <div className="mt-4">
                <Button asChild variant="outline" className="rounded-full">
                  <a href={selected.link} target="_blank" rel="noopener noreferrer">View Project <ExternalLink size={14} className="ml-2" /></a>
                </Button>
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </Layout>
  );
};

export default Portfolio;
