import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Layout from "@/components/Layout";
import { useProducts, StoredProduct } from "@/lib/store";
import { ProductCategory, ProductImage } from "@/data/products";

const categories: { label: string; value: ProductCategory }[] = [
  { label: "All", value: "all" },
  { label: "Ebooks", value: "ebook" },
  { label: "SaaS", value: "saas" },
  { label: "Courses", value: "course" },
  { label: "Templates", value: "template" },
];

// Get dimensions based on preview size
const getPreviewDimensions = (previewSize?: "small" | "medium" | "large") => {
  switch (previewSize) {
    case "small":
      return { width: 300, height: 200 };
    case "large":
      return { width: 800, height: 600 };
    default:
      return { width: 600, height: 400 };
  }
};

// Get display price
const getDisplayPrice = (product: StoredProduct) => {
  if (product.priceType === "range" && product.priceMin && product.priceMax) {
    return `$${product.priceMin} - $${product.priceMax}`;
  }
  return `$${product.price}`;
};

// Product image carousel component
const ProductImageCarousel = ({ images, primaryImage, title, previewSize }: { images?: ProductImage[], primaryImage: string, title: string, previewSize?: "small" | "medium" | "large" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const allImages = images && images.length > 0 ? images : [{ id: "primary", url: primaryImage, alt: title, order: 0 }];

  // Find index of primary image
  const primaryIndex = allImages.findIndex((img) => img.url === primaryImage);
  const displayIndex = primaryIndex >= 0 ? primaryIndex : 0;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (allImages.length === 1) {
    return (
      <div className="aspect-[3/2] overflow-hidden">
        <img src={allImages[0].url} alt={allImages[0].alt} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="aspect-[3/2] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={allImages[currentIndex].url}
            alt={allImages[currentIndex].alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={prevImage}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight size={20} />
      </button>

      {/* Image counter */}
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
        {currentIndex + 1} / {allImages.length}
      </div>

      {/* Thumbnails */}
      <div className="absolute bottom-2 left-2 flex gap-1">
        {allImages.map((img, index) => (
          <button
            key={img.id}
            onClick={() => setCurrentIndex(index)}
            className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
              index === currentIndex ? "border-white scale-110" : "border-white/50"
            }`}
          >
            <img src={img.url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

const Products = () => {
  const [products] = useProducts();
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("all");
  const [selectedProduct, setSelectedProduct] = useState<StoredProduct | null>(null);

  const activeProducts = products.filter((p) => !p.disabled);
  const filtered = activeCategory === "all" ? activeProducts : activeProducts.filter((p) => p.category === activeCategory);

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="font-serif text-4xl text-foreground md:text-5xl">Digital Products</h1>
            <p className="mt-3 text-lg text-muted-foreground">Tools, resources, and knowledge to fuel your creative journey</p>
          </div>

          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="group cursor-pointer overflow-hidden border-border transition-shadow hover:shadow-lg" onClick={() => setSelectedProduct(product)}>
                    <ProductImageCarousel
                      images={product.images}
                      primaryImage={product.image}
                      title={product.title}
                      previewSize={product.previewSize}
                    />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="secondary" className="mb-2 capitalize">
                          {product.category}
                        </Badge>
                        {product.previewSize && product.previewSize !== "medium" && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {product.previewSize}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-serif text-xl text-foreground">{product.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">{getDisplayPrice(product)}</span>
                        <Button size="sm" className="rounded-full">
                          <ShoppingCart size={14} className="mr-1" /> Buy Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        {selectedProduct && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="font-serif text-2xl">{selectedProduct.title}</DialogTitle>
                  <DialogDescription className="mt-2">
                    <Badge variant="secondary" className="capitalize">{selectedProduct.category}</Badge>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Image Gallery */}
            <div className="mt-2">
              <ProductImageCarousel
                images={selectedProduct.images}
                primaryImage={selectedProduct.image}
                title={selectedProduct.title}
                previewSize={selectedProduct.previewSize}
              />
            </div>

            <div className="mt-6">
              <h3 className="font-medium text-foreground mb-2">Description</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{selectedProduct.longDescription}</p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <span className="text-sm text-muted-foreground">Price</span>
                <p className="text-3xl font-bold text-primary">{getDisplayPrice(selectedProduct)}</p>
                {selectedProduct.priceType === "range" && (
                  <p className="text-xs text-muted-foreground">Price range based on options</p>
                )}
              </div>
              <Button size="lg" className="rounded-full px-8">
                <ShoppingCart size={16} className="mr-2" /> Purchase Now
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </Layout>
  );
};

export default Products;
