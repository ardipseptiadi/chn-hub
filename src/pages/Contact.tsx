import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, MapPin, Globe } from "lucide-react";
import { Twitter, Github, Linkedin, Instagram, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { addContactMessage, useSocials } from "@/lib/store";

const iconMap: Record<string, React.ElementType> = { Mail, Twitter, Github, Linkedin, Instagram, Send, Music, Globe };

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [socials] = useSocials();
  const activeSocials = socials.filter(s => s.enabled);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    addContactMessage({ name: form.name.trim(), email: form.email.trim(), message: form.message.trim() });
    toast({ title: "Message sent!", description: "Thanks for reaching out. I'll get back to you soon." });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="font-serif text-4xl text-foreground md:text-5xl">Get in Touch</h1>
            <p className="mt-3 text-lg text-muted-foreground">Have a question or want to work together? I'd love to hear from you.</p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-5">
            <motion.div className="md:col-span-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Card className="border-border">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div><Label htmlFor="name">Name</Label><Input id="name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" maxLength={100} /></div>
                    <div><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" maxLength={255} /></div>
                    <div><Label htmlFor="message">Message</Label><Textarea id="message" placeholder="Tell me about your project or question..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1.5 min-h-[120px]" maxLength={1000} /></div>
                    <Button type="submit" className="w-full rounded-full"><Send size={14} className="mr-2" /> Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div className="space-y-6 md:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div><h3 className="flex items-center gap-2 font-serif text-lg text-foreground"><Mail size={18} className="text-primary" /> Email</h3><p className="mt-1 text-sm text-muted-foreground">hello@creativo.com</p></div>
              <div><h3 className="flex items-center gap-2 font-serif text-lg text-foreground"><MapPin size={18} className="text-primary" /> Location</h3><p className="mt-1 text-sm text-muted-foreground">Remote — Available Worldwide</p></div>
              <div>
                <h3 className="font-serif text-lg text-foreground">Follow Me</h3>
                <div className="mt-3 flex flex-wrap gap-3">
                  {activeSocials.map((s) => {
                    const Icon = iconMap[s.icon] || Globe;
                    return (
                      <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" title={s.platform} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                        <Icon size={18} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
