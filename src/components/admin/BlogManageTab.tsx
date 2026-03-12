import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBlog, StoredBlogPost, genId } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

const emptyPost: Omit<StoredBlogPost, "id"> = {
  slug: "", title: "", excerpt: "", content: "", coverImage: "", date: new Date().toISOString().split("T")[0], readTime: "3 min read", tags: [], status: "draft",
};

const BlogManageTab = () => {
  const [posts, setPosts] = useBlog();
  const [editing, setEditing] = useState<StoredBlogPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();

  const openNew = () => {
    setEditing({ id: genId(), ...emptyPost } as StoredBlogPost);
    setIsNew(true);
    setTagInput("");
  };

  const openEdit = (p: StoredBlogPost) => {
    setEditing({ ...p });
    setIsNew(false);
    setTagInput(p.tags.join(", "));
  };

  const save = () => {
    if (!editing || !editing.title.trim() || !editing.slug.trim()) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    const updated = { ...editing, tags: tagInput.split(",").map((t) => t.trim()).filter(Boolean) };
    if (isNew) {
      setPosts((prev) => [updated, ...prev]);
    } else {
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
    setEditing(null);
    toast({ title: isNew ? "Post created!" : "Post updated!" });
  };

  const remove = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Post deleted" });
  };

  const toggleStatus = (id: string) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: p.status === "published" ? "draft" as const : "published" as const } : p));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-foreground">Blog Posts</h2>
        <Button onClick={openNew} size="sm" className="rounded-full">
          <Plus size={14} className="mr-1" /> New Post
        </Button>
      </div>

      <Card className="border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{p.date}</TableCell>
                <TableCell>
                  <Badge variant={p.status === "published" ? "default" : "secondary"}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleStatus(p.id)} title="Toggle status">
                    {p.status === "published" ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 size={14} className="text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No posts yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        {editing && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">{isNew ? "New Post" : "Edit Post"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
              <div><Label>Excerpt</Label><Textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} className="min-h-[60px]" /></div>
              <div><Label>Content (HTML)</Label><Textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className="min-h-[120px] font-mono text-xs" /></div>
              <div><Label>Cover Image URL</Label><Input value={editing.coverImage} onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Date</Label><Input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></div>
                <div><Label>Read Time</Label><Input value={editing.readTime} onChange={(e) => setEditing({ ...editing, readTime: e.target.value })} /></div>
              </div>
              <div><Label>Tags (comma-separated)</Label><Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} /></div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={save}>{isNew ? "Create" : "Save"}</Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default BlogManageTab;
