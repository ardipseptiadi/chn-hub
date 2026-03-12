import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useProducts, StoredProduct, genId } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, X, GripVertical, Star } from "lucide-react";
import { ProductCategory, ProductImage, ProductPreviewSize } from "@/data/products";
import { Reorder } from "framer-motion";

const emptyProduct: Omit<StoredProduct, "id"> = {
  title: "",
  description: "",
  longDescription: "",
  price: 0,
  priceMin: undefined,
  priceMax: undefined,
  priceType: "fixed",
  category: "ebook",
  image: "",
  images: [],
  previewSize: "medium",
  featured: false,
  disabled: false,
};

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const ProductManageTab = () => {
  const [products, setProducts] = useProducts();
  const [editing, setEditing] = useState<StoredProduct | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const openNew = () => {
    setEditing({ id: genId(), ...emptyProduct, images: [] } as StoredProduct);
    setIsNew(true);
  };

  const openEdit = (p: StoredProduct) => {
    setEditing({ ...p, images: p.images || [] });
    setIsNew(false);
  };

  const save = () => {
    if (!editing || !editing.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    // If price range is set, update priceType to range
    if (editing.priceMin !== undefined || editing.priceMax !== undefined) {
      editing.priceType = "range";
    }

    // Ensure primary image is set from images array if available
    if (editing.images && editing.images.length > 0 && !editing.image) {
      editing.image = editing.images[0].url;
    }

    if (isNew) {
      setProducts((prev) => [editing, ...prev]);
    } else {
      setProducts((prev) => prev.map((p) => (p.id === editing.id ? editing : p)));
    }
    setEditing(null);
    toast({ title: isNew ? "Product created!" : "Product updated!" });
  };

  const remove = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Product deleted" });
  };

  const toggleDisabled = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, disabled: !p.disabled } : p)));
  };

  // Image upload handlers
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !editing) return;

    const maxSize = 5 * 1024 * 1024; // 5MB limit
    const validFiles = Array.from(files).filter((file) => file.size <= maxSize);

    if (validFiles.length !== files.length) {
      toast({ title: "Some files are too large", description: "Maximum file size is 5MB", variant: "destructive" });
    }

    if (validFiles.length === 0) return;

    try {
      setUploadProgress(0);
      const newImages: ProductImage[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const base64 = await fileToBase64(validFiles[i]);
        const newImage: ProductImage = {
          id: crypto.randomUUID(),
          url: base64,
          alt: validFiles[i].name,
          order: (editing.images?.length || 0) + i,
        };
        newImages.push(newImage);
        setUploadProgress(((i + 1) / validFiles.length) * 100);
      }

      setEditing({
        ...editing,
        images: [...(editing.images || []), ...newImages],
        // Set primary image if not set
        image: editing.image || newImages[0]?.url || "",
      });

      toast({ title: "Images uploaded successfully" });
    } catch (error) {
      toast({ title: "Upload failed", description: "Please try again", variant: "destructive" });
    } finally {
      setUploadProgress(0);
    }
  };

  const removeImage = (imageId: string) => {
    if (!editing) return;
    const updatedImages = (editing.images || []).filter((img) => img.id !== imageId);
    setEditing({
      ...editing,
      images: updatedImages,
      // Update primary image if needed
      image: editing.image === updatedImages.find((img) => img.id === imageId)?.url
        ? updatedImages[0]?.url || ""
        : editing.image,
    });
  };

  const setPrimaryImage = (imageUrl: string) => {
    if (!editing) return;
    setEditing({ ...editing, image: imageUrl });
  };

  const reorderImages = (newImages: ProductImage[]) => {
    if (!editing) return;
    const reorderedImages = newImages.map((img, index) => ({ ...img, order: index }));
    setEditing({ ...editing, images: reorderedImages });
  };

  // Get display price for table
  const getDisplayPrice = (p: StoredProduct) => {
    if (p.priceType === "range" && p.priceMin && p.priceMax) {
      return `$${p.priceMin} - $${p.priceMax}`;
    }
    return `$${p.price}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-foreground">Products</h2>
        <Button onClick={openNew} size="sm" className="rounded-full">
          <Plus size={14} className="mr-1" /> New Product
        </Button>
      </div>

      <Card className="border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Images</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} className={p.disabled ? "opacity-50" : ""}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell><Badge variant="secondary" className="capitalize">{p.category}</Badge></TableCell>
                <TableCell>{getDisplayPrice(p)}</TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {p.images?.length || 1} {(p.images?.length || 1) === 1 ? "image" : "images"}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{p.previewSize || "medium"}</Badge>
                </TableCell>
                <TableCell>{p.featured ? "⭐" : "—"}</TableCell>
                <TableCell>
                  <Badge variant={p.disabled ? "secondary" : "default"}>
                    {p.disabled ? "disabled" : "active"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleDisabled(p.id)}>
                    {p.disabled ? <Eye size={14} /> : <EyeOff size={14} />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(p.id)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No products yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        {editing && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">{isNew ? "New Product" : "Edit Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {/* Title & Description */}
              <div>
                <Label>Title</Label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="min-h-[60px]" />
              </div>
              <div>
                <Label>Long Description</Label>
                <Textarea value={editing.longDescription} onChange={(e) => setEditing({ ...editing, longDescription: e.target.value })} className="min-h-[80px]" />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v as ProductCategory })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ebook">Ebook</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price Type</Label>
                  <Select value={editing.priceType || "fixed"} onValueChange={(v) => setEditing({ ...editing, priceType: v as "fixed" | "range" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="range">Price Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{editing.priceType === "range" ? "Base Price ($)" : "Price ($)"}</Label>
                  <Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
                </div>
              </div>

              {/* Price Range */}
              {editing.priceType === "range" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min Price ($)</Label>
                    <Input type="number" value={editing.priceMin || ""} onChange={(e) => setEditing({ ...editing, priceMin: Number(e.target.value) || undefined })} placeholder="Min price" />
                  </div>
                  <div>
                    <Label>Max Price ($)</Label>
                    <Input type="number" value={editing.priceMax || ""} onChange={(e) => setEditing({ ...editing, priceMax: Number(e.target.value) || undefined })} placeholder="Max price" />
                  </div>
                </div>
              )}

              {/* Preview Size */}
              <div>
                <Label>Image Preview Size</Label>
                <Select value={editing.previewSize || "medium"} onValueChange={(v) => setEditing({ ...editing, previewSize: v as ProductPreviewSize })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (300x200)</SelectItem>
                    <SelectItem value="medium">Medium (600x400)</SelectItem>
                    <SelectItem value="large">Large (800x600)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload */}
              <div>
                <Label>Product Images</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload multiple images. Drag to reorder. First image or starred image is the primary.
                </p>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, GIF up to 5MB each
                    </p>
                  </label>
                  {uploadProgress > 0 && (
                    <div className="mt-3">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Uploading... {Math.round(uploadProgress)}%</p>
                    </div>
                  )}
                </div>

                {/* Images Grid */}
                {(editing.images || []).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Product Images ({(editing.images || []).length})</p>
                    <Re.Group values={editing.images || []} onReorder={reorderImages} axis="y">
                      <div className="grid grid-cols-4 gap-3">
                        <Re.Item>
                          {(editing.images || []).map((img) => (
                            <div
                              key={img.id}
                              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                            >
                                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setPrimaryImage(img.url)}
                                    className={editing.image === img.url ? "bg-primary text-primary-foreground" : ""}
                                  >
                                    <Eye size={14} />
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => removeImage(img.id)}>
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                                {editing.image === img.url && (
                                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                    <Star size={12} fill="currentColor" />
                                  </div>
                                )}
                                <div className="absolute top-2 left-2 cursor-move bg-background/80 rounded p-1">
                                  <GripVertical size={14} className="text-muted-foreground" />
                                </div>
                              </div>
                            ))}
                        </Re.Item>
                      </div>
                    </Re.Group>
                  </div>
                )}
              </div>

              {/* Legacy Image URL (fallback) */}
              {(editing.images || []).length === 0 && (
                <div>
                  <Label>Image URL (Legacy)</Label>
                  <Input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="https://..." />
                </div>
              )}

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={editing.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: v })} />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editing.disabled} onCheckedChange={(v) => setEditing({ ...editing, disabled: v })} />
                  <Label>Disabled</Label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4 border-t border-border">
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

export default ProductManageTab;
