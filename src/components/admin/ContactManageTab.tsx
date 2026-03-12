import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useContacts } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Trash2, Mail } from "lucide-react";

const ContactManageTab = () => {
  const [messages, setMessages] = useContacts();
  const { toast } = useToast();

  const markRead = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const remove = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    toast({ title: "Message removed" });
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-foreground">
          Contact Messages
          {unreadCount > 0 && (
            <Badge className="ml-2" variant="default">{unreadCount} new</Badge>
          )}
        </h2>
      </div>

      <Card className="border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((m) => (
              <TableRow key={m.id} className={!m.read ? "bg-primary/5" : ""}>
                <TableCell>{!m.read && <Mail size={14} className="text-primary" />}</TableCell>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.email}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{m.message}</TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(m.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  {!m.read && (
                    <Button variant="ghost" size="icon" onClick={() => markRead(m.id)} title="Mark as read">
                      <CheckCircle size={14} />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => remove(m.id)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {messages.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No messages yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ContactManageTab;
