import { motion } from "framer-motion";
import { Briefcase, MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { useExperiences } from "@/lib/store";

const Experience = () => {
  const [experiences] = useExperiences();
  const sorted = [...experiences].sort((a, b) => b.startDate.localeCompare(a.startDate));

  const formatDate = (d: string) => {
    if (!d) return "Present";
    const [y, m] = d.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="font-serif text-4xl text-foreground md:text-5xl">Experience</h1>
            <p className="mt-3 text-lg text-muted-foreground">My professional journey and the roles that shaped me.</p>
          </div>

          <div className="relative mx-auto max-w-3xl">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 h-full w-0.5 bg-border md:left-1/2 md:-translate-x-px" />

            {sorted.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative mb-10 flex flex-col md:flex-row ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}
              >
                {/* Dot */}
                <div className="absolute left-6 top-6 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-primary bg-background md:left-1/2" />

                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pl-10" : "md:pr-10 md:text-right"}`}>
                  <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                    <div className={`mb-2 flex items-center gap-2 text-xs text-muted-foreground ${i % 2 !== 0 ? "md:justify-end" : ""}`}>
                      <Calendar size={12} />
                      <span>{formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate)}</span>
                    </div>
                    <h3 className="font-serif text-lg text-foreground">{exp.title}</h3>
                    <div className={`mt-1 flex items-center gap-2 text-sm text-primary ${i % 2 !== 0 ? "md:justify-end" : ""}`}>
                      <Briefcase size={13} />
                      <span>{exp.company}</span>
                    </div>
                    <div className={`mt-0.5 flex items-center gap-2 text-xs text-muted-foreground ${i % 2 !== 0 ? "md:justify-end" : ""}`}>
                      <MapPin size={12} />
                      <span>{exp.location}</span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{exp.description}</p>
                    <div className={`mt-3 flex flex-wrap gap-1.5 ${i % 2 !== 0 ? "md:justify-end" : ""}`}>
                      {exp.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Experience;
