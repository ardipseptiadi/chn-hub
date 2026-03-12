import { useState } from "react";
import { useExperiences, genId, ExperienceItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const empty: Omit<ExperienceItem, "id"> = { title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "", tags: [] };

const ExperienceManageTab = () => {
  const [experiences, setExperiences] = useExperiences();
  const [editing, setEditing] = useState<ExperienceItem | null>(null);
  const [form, setForm] = useState(empty);
  const [tagsInput, setTagsInput] = useState("");
  const { toast } = useToast();

  const openNew = () => { setEditing(null); setForm(empty); setTagsInput(""); };
  const openEdit = (item: ExperienceItem) => { setEditing(item); setForm(item); setTagsInput(item.tags.join(", ")); };

  const save = () => {
    if (!form.title || !form.company || !form.startDate) { toast({ title: "Fill required fields", variant: "destructive" }); return; }
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    if (editing) {
      setExperiences(prev => prev.map(e => e.id === editing.id ? { ...form, id: editing.id, tags } : e));
      toast({ title: "Experience updated" });
    } else {
      setExperiences(prev => [{ ...form, id: genId(), tags }, ...prev]);
      toast({ title: "Experience added" });
    }
    setEditing(null); setForm(empty); setTagsInput("");
  };

  const remove = (id: string) => { setExperiences(prev => prev.filter(e => e.id !== id)); toast({ title: "Deleted" }); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-foreground">Experience Timeline</h2>
        <Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Add</Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1" placeholder="Senior Designer" /></div>
            <div><Label>Company *</Label><Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="mt-1" placeholder="Acme Inc." /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="mt-1" placeholder="Remote" /></div>
            <div><Label>Start Date *</Label><Input type="month" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="mt-1" /></div>
            <div className="flex items-center gap-3">
              <Switch checked={form.current} onCheckedChange={c => setForm({ ...form, current: c, endDate: c ? "" : form.endDate })} />
              <Label>Current role</Label>
            </div>
            {!form.current && <div><Label>End Date</Label><Input type="month" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="mt-1" /></div>}
          </div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>
          <div><Label>Tags (comma-separated)</Label><Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="mt-1" placeholder="React, Design, Leadership" /></div>
          <Button onClick={save}>{editing ? "Update" : "Add"} Experience</Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {[...experiences].sort((a, b) => b.startDate.localeCompare(a.startDate)).map(exp => (
          <Card key={exp.id} className="border-border">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-foreground">{exp.title}</p>
                <p className="text-sm text-muted-foreground">{exp.company} · {exp.startDate} — {exp.current ? "Present" : exp.endDate}</p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => openEdit(exp)}><Pencil size={14} /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(exp.id)}><Trash2 size={14} className="text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExperienceManageTab;
