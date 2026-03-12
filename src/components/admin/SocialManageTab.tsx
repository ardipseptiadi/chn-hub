import { useState } from "react";
import { useSocials, genId, SocialLink, getAdminPassword, setAdminPassword } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SocialManageTab = () => {
  const [socials, setSocials] = useSocials();
  const [form, setForm] = useState({ platform: "", url: "", icon: "Globe" });
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [pw, setPw] = useState(getAdminPassword());
  const { toast } = useToast();

  const openEdit = (s: SocialLink) => { setEditing(s); setForm({ platform: s.platform, url: s.url, icon: s.icon }); };
  const openNew = () => { setEditing(null); setForm({ platform: "", url: "", icon: "Globe" }); };

  const save = () => {
    if (!form.platform || !form.url) { toast({ title: "Fill platform & URL", variant: "destructive" }); return; }
    if (editing) {
      setSocials(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s));
      toast({ title: "Updated" });
    } else {
      setSocials(prev => [...prev, { ...form, id: genId(), enabled: true }]);
      toast({ title: "Added" });
    }
    setEditing(null); setForm({ platform: "", url: "", icon: "Globe" });
  };

  const remove = (id: string) => { setSocials(prev => prev.filter(s => s.id !== id)); toast({ title: "Removed" }); };
  const toggle = (id: string) => { setSocials(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)); };

  const savePassword = () => {
    if (pw.length < 4) { toast({ title: "Password must be at least 4 characters", variant: "destructive" }); return; }
    setAdminPassword(pw);
    toast({ title: "Admin password updated" });
  };

  return (
    <div className="space-y-8">
      {/* Admin Password */}
      <div>
        <h2 className="font-serif text-xl text-foreground mb-4">Admin Password</h2>
        <Card className="border-border">
          <CardContent className="p-5 flex gap-3 items-end">
            <div className="flex-1">
              <Label>Back Office Password</Label>
              <Input type="password" value={pw} onChange={e => setPw(e.target.value)} className="mt-1" />
            </div>
            <Button onClick={savePassword}>Save Password</Button>
          </CardContent>
        </Card>
      </div>

      {/* Social Links */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-foreground">Social & Contact Links</h2>
          <Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Add Link</Button>
        </div>

        <Card className="border-border mb-4">
          <CardContent className="p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div><Label>Platform</Label><Input value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="mt-1" placeholder="Instagram" /></div>
              <div><Label>URL</Label><Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="mt-1" placeholder="https://instagram.com/you" /></div>
              <div><Label>Icon name</Label><Input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="mt-1" placeholder="Instagram, Mail, Send..." /></div>
            </div>
            <Button onClick={save}>{editing ? "Update" : "Add"} Link</Button>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {socials.map(s => (
            <Card key={s.id} className="border-border">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-foreground">{s.platform}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{s.url}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={s.enabled} onCheckedChange={() => toggle(s.id)} />
                  <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil size={14} /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 size={14} className="text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialManageTab;
