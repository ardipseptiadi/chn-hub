/**
 * Pricing Management Tab Component
 *
 * Admin interface for managing consultation pricing.
 * Configure pricing matrix based on consultation type, duration, and member tier.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Plus, Edit, Trash2, Search } from "lucide-react";
import { useConsultationPricing, useProblemTypes } from "@/lib/store";

const CONSULTATION_CATEGORIES: Array<{ value: string; label: string; icon: string }> = [
  { value: "career", label: "Career", icon: "User" },
  { value: "business", label: "Business", icon: "Briefcase" },
  { value: "technical", label: "Technical", icon: "Code" },
  { value: "design", label: "Design", icon: "Palette" },
];

const MEMBER_TIERS = [
  { value: "free", label: "Free", description: "Standard pricing" },
  { value: "premium", label: "Premium", description: "20% discount" },
  { value: "vip", label: "VIP", description: "40% discount" },
];

const DURATIONS = [30, 45, 60, 75, 90, 120];

const PricingManageTab = () => {
  const [pricing, setPricing] = useConsultationPricing();
  const [problemTypes] = useProblemTypes();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPricing, setEditingPricing] = useState<(typeof pricing)[0] | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    duration: 60,
    consultType: "career" as const,
    memberType: "free" as const,
    problemType: "",
    price: "",
  });

  // Filter pricing
  const filteredPricing = pricing.filter((p) => {
    const matchesSearch =
      searchQuery === "" ||
      p.problemType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.consultType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || p.consultType === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Sort by category, then duration
  const sortedPricing = [...filteredPricing].sort((a, b) => {
    if (a.consultType !== b.consultType) {
      return a.consultType.localeCompare(b.consultType);
    }
    return a.duration - b.duration;
  });

  const handleOpenAddDialog = () => {
    setFormData({
      duration: 60,
      consultType: "career",
      memberType: "free",
      problemType: "",
      price: "",
    });
    setShowAddDialog(true);
  };

  const handleOpenEditDialog = (item: (typeof pricing)[0]) => {
    setEditingPricing(item);
    setFormData({
      duration: item.duration,
      consultType: item.consultType,
      memberType: item.memberType,
      problemType: item.problemType,
      price: item.price.toString(),
    });
    setShowAddDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingPricing(null);
    setFormData({
      duration: 60,
      consultType: "career",
      memberType: "free",
      problemType: "",
      price: "",
    });
  };

  const handleSave = () => {
    const priceValue = parseFloat(formData.price);

    if (isNaN(priceValue) || priceValue < 0) {
      return;
    }

    if (!formData.problemType.trim()) {
      return;
    }

    if (editingPricing) {
      // Update existing
      setPricing((prev) =>
        prev.map((p) =>
          p.id === editingPricing.id
            ? {
                ...p,
                duration: formData.duration,
                consultType: formData.consultType,
                memberType: formData.memberType,
                problemType: formData.problemType.trim(),
                price: priceValue,
              }
            : p
        )
      );
    } else {
      // Add new
      const newPricing = {
        id: crypto.randomUUID(),
        duration: formData.duration,
        consultType: formData.consultType,
        memberType: formData.memberType,
        problemType: formData.problemType.trim(),
        price: priceValue,
      };
      setPricing((prev) => [...prev, newPricing]);
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setPricing((prev) => prev.filter((p) => p.id !== id));
  };

  // Get category label
  const getCategoryLabel = (value: string) => {
    return CONSULTATION_CATEGORIES.find((c) => c.value === value)?.label || value;
  };

  const getMemberTierLabel = (value: string) => {
    return MEMBER_TIERS.find((t) => t.value === value)?.label || value;
  };

  // Stats
  const stats = {
    totalPricing: pricing.length,
    avgPrice: pricing.length > 0
      ? Math.round(pricing.reduce((sum, p) => sum + p.price, 0) / pricing.length)
      : 0,
    categories: new Set(pricing.map((p) => p.consultType)).size,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.totalPricing}</div>
                <div className="text-xs text-muted-foreground">Pricing Rules</div>
              </div>
              <DollarSign className="text-primary" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">${stats.avgPrice}</div>
                <div className="text-xs text-muted-foreground">Avg. Price</div>
              </div>
              <DollarSign className="text-green-600" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.categories}</div>
                <div className="text-xs text-muted-foreground">Categories</div>
              </div>
              <DollarSign className="text-blue-600" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl text-foreground">Consultation Pricing</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage pricing matrix for different consultation types and member tiers
              </p>
            </div>
            <Button onClick={handleOpenAddDialog} className="rounded-full">
              <Plus size={16} className="mr-2" />
              Add Pricing Rule
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search pricing rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {CONSULTATION_CATEGORIES.map((cat) => (
                <Button
                  key={cat.value}
                  variant={categoryFilter === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(cat.value === categoryFilter ? "all" : cat.value)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Pricing Table */}
          {sortedPricing.length > 0 ? (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Category</TableHead>
                      <TableHead>Problem Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Member Tier</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPricing.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {getCategoryLabel(item.consultType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {item.problemType}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{item.duration} min</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.memberType === "vip"
                                ? "default"
                                : item.memberType === "premium"
                                ? "secondary"
                                : "outline"
                            }
                            className="capitalize"
                          >
                            {getMemberTierLabel(item.memberType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-lg font-semibold text-primary">
                            ${item.price}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditDialog(item)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <DollarSign className="mx-auto h-16 w-16 text-muted-foreground/30" size={64} />
              <h3 className="mt-4 font-serif text-lg text-foreground">No pricing rules found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery || categoryFilter !== "all"
                  ? "No pricing rules match your filters."
                  : "Add your first pricing rule to get started."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingPricing ? "Edit Pricing Rule" : "Add Pricing Rule"}
            </DialogTitle>
            <DialogDescription>
              Configure pricing for a specific consultation type and member tier
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="consultType">Consultation Category</Label>
              <Select
                value={formData.consultType}
                onValueChange={(v) => setFormData({ ...formData, consultType: v as any })}
              >
                <SelectTrigger id="consultType" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONSULTATION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(v) => setFormData({ ...formData, duration: parseInt(v, 10) })}
              >
                <SelectTrigger id="duration" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      {d} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="memberType">Member Tier</Label>
              <Select
                value={formData.memberType}
                onValueChange={(v) => setFormData({ ...formData, memberType: v as any })}
              >
                <SelectTrigger id="memberType" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEMBER_TIERS.map((tier) => (
                    <SelectItem key={tier.value} value={tier.value}>
                      <div className="flex items-center gap-2">
                        <span>{tier.label}</span>
                        <span className="text-xs text-muted-foreground">({tier.description})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="problemType">Problem Type</Label>
              <Input
                id="problemType"
                value={formData.problemType}
                onChange={(e) => setFormData({ ...formData, problemType: e.target.value })}
                placeholder="e.g., Career Transition, Business Strategy"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Specific type of consultation within this category
              </p>
            </div>

            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <div className="relative mt-1">
                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="150"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleCloseDialog} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.problemType.trim() || !formData.price}
                className="flex-1"
              >
                {editingPricing ? "Update" : "Add"} Pricing Rule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PricingManageTab;
