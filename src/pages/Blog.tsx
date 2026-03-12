import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { useBlog } from "@/lib/store";

const BlogList = () => {
  const [posts] = useBlog();
  const published = posts.filter((p) => p.status === "published");

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="font-serif text-4xl text-foreground md:text-5xl">Stories & Insights</h1>
            <p className="mt-3 text-lg text-muted-foreground">Thoughts on building, creating, and growing</p>
          </div>
          <div className="mx-auto max-w-3xl space-y-8">
            {published.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}>
                <Link to={`/blog/${post.slug}`}>
                  <Card className="group overflow-hidden border-border transition-shadow hover:shadow-lg">
                    <div className="aspect-[2/1] overflow-hidden">
                      <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                    </div>
                    <CardContent className="p-6">
                      <div className="mb-2 flex flex-wrap gap-1">{post.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs capitalize">{t}</Badge>)}</div>
                      <h2 className="font-serif text-2xl text-foreground">{post.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
                      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

const BlogPost = () => {
  const { slug } = useParams();
  const [posts] = useBlog();
  const post = posts.find((p) => p.slug === slug && p.status === "published");

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
          <div className="text-center">
            <h1 className="font-serif text-3xl text-foreground">Post Not Found</h1>
            <Link to="/blog" className="mt-4 inline-block text-primary hover:underline">← Back to Blog</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <Link to="/blog" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"><ArrowLeft size={14} /> Back to Stories</Link>
            <div className="mb-2 flex flex-wrap gap-1">{post.tags.map((t) => <Badge key={t} variant="secondary" className="capitalize">{t}</Badge>)}</div>
            <h1 className="font-serif text-3xl text-foreground md:text-5xl">{post.title}</h1>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>
            </div>
            <div className="mt-8 overflow-hidden rounded-xl"><img src={post.coverImage} alt={post.title} className="h-80 w-full object-cover" /></div>
            <div className="prose mt-10 max-w-none text-muted-foreground prose-headings:font-serif prose-headings:text-foreground prose-p:leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </div>
      </article>
    </Layout>
  );
};

export { BlogList, BlogPost };
