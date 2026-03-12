import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { usePortfolio, StoredPortfolioItem, genId } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

const emptyItem: Omit<StoredPortfolioItem, "id"> = {
  title: "", description: "", tags: [], image: "", link: "", disabled: false,
};

const PortfolioManageTab = () => {
  const [items, setItems] = usePortfolio();
  const [editing, setEditing] = useState<StoredPortfolioItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();

  const openNew = () => { setEditing({ id: genId(), ...emptyItem } as StoredPortfolioItem); setIsNew(true); setTagInput(""); };
  const openEdit = (p: StoredPortfolioItem) => { setEditing({ ...p }); setIsNew(false); setTagInput(p.tags.join(", ")); };

  const save = () => {
    if (!editing || !editing.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    const updated = { ...editing, tags: tagInput.split(",").map((t) => t.trim()).filter(Boolean) as any };
    if (isNew) { setItems((prev) => [updated, ...prev]); } else { setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p))); }
    setEditing(null);
    toast({ title: isNew ? "Item created!" : "Item updated!" });
  };

  const remove = (id: string) => { setItems((prev) => prev.filter((p) => p.id !== id)); toast({ title: "Item deleted" }); };
  const toggleDisabled = (id: string) => { setItems((prev) => prev.map((p) => p.id === id ? { ...p, disabled: !p.disabled } : p)); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-foreground">Portfolio</h2>
        <Button onClick={openNew} size="sm" className="rounded-full"><Plus size={14} className="mr-1" /> New Item</Button>
      </div>

      <Card className="border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.id} className={p.disabled ? "opacity-50" : ""}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell><div className="flex flex-wrap gap-1">{p.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs capitalize">{t}</Badge>)}</div></TableCell>
                <TableCell><Badge variant={p.disabled ? "secondary" : "default"}>{p.disabled ? "hidden" : "visible"}</Badge></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleDisabled(p.id)}>{p.disabled ? <Eye size={14} /> : <EyeOff size={14} />}</Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 size={14} className="text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No items yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        {editing && (
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-serif">{isNew ? "New Portfolio Item" : "Edit Item"}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="min-h-[80px]" /></div>
              <div><Label>Image URL</Label><Input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} /></div>
              <div><Label>External Link</Label><Input value={editing.link || ""} onChange={(e) => setEditing({ ...editing, link: e.target.value })} /></div>
              <div><Label>Tags (comma-separated: web, mobile, branding, ui/ux, saas)</Label><Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} /></div>
              <div className="flex items-center gap-2"><Switch checked={editing.disabled} onCheckedChange={(v) => setEditing({ ...editing, disabled: v })} /><Label>Hidden</Label></div>
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

export default PortfolioManageTab;
