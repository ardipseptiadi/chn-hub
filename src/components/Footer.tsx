import { Link } from "react-router-dom";
import { Heart, Mail, Twitter, Github, Linkedin, Instagram, Send, Music, Globe } from "lucide-react";
import { useSettings, useSocials } from "@/lib/store";

const iconMap: Record<string, React.ElementType> = { Mail, Twitter, Github, Linkedin, Instagram, Send, Music, Globe };

const Footer = () => {
  const [settings] = useSettings();
  const [socials] = useSocials();
  const activeSocials = socials.filter(s => s.enabled);

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="font-serif text-2xl text-foreground">
              {settings.businessName}<span className="text-primary">.</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">Crafting digital products and experiences that help creators thrive.</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Pages</h4>
            <div className="flex flex-col gap-2">
              {[{ label: "Home", path: "/" }, { label: "Products", path: "/products" }, { label: "Portfolio", path: "/portfolio" }, { label: "Experience", path: "/experience" }, { label: "Blog", path: "/blog" }, { label: "Contact", path: "/contact" }].map((l) => (
                <Link key={l.label} to={l.path} className="text-sm text-muted-foreground transition-colors hover:text-primary">{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Products</h4>
            <div className="flex flex-col gap-2">
              {["Ebooks", "SaaS Tools", "Courses", "Templates"].map((l) => (
                <Link key={l} to="/products" className="text-sm text-muted-foreground transition-colors hover:text-primary">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Connect</h4>
            <div className="flex flex-wrap gap-3">
              {activeSocials.map((s) => {
                const Icon = iconMap[s.icon] || Globe;
                return (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" title={s.platform} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {settings.businessName}. All rights reserved.</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">Made with <Heart size={12} className="text-primary" /> for creators everywhere</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
