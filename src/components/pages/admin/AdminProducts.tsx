'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Search, Pencil, Trash2, Star, TrendingUp, ImagePlus, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useAuthStore } from '@/lib/store';
import type { Product } from '@/lib/types';

const categories = [
  'Zodiac Sign Chain',
  'Custom Chain',
  'Stylish Chain',
];

const fallbackProducts: Product[] = [
  {
    id: '1', name: 'Aries Zodiac Chain', slug: 'aries-zodiac-chain', description: 'Bold Aries zodiac sign pendant chain in gold finish.',
    price: 2499, comparePrice: 3999, category: 'Zodiac Sign Chain', images: ['/products/zodiac-aries.png'],
    stock: 25, featured: true, trending: true, rating: 4.5, reviewCount: 12, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2', name: 'Cancer Zodiac Chain', slug: 'cancer-zodiac-chain', description: 'Elegant Cancer zodiac sign pendant chain.',
    price: 2499, comparePrice: null, category: 'Zodiac Sign Chain', images: ['/products/zodiac-cancer.png'],
    stock: 18, featured: true, trending: false, rating: 4.2, reviewCount: 8, createdAt: '2025-01-02T00:00:00Z', updatedAt: '2025-01-02T00:00:00Z',
  },
  {
    id: '3', name: 'Custom Name Chain', slug: 'custom-name-chain', description: 'Personalized name pendant chain with custom engraving.',
    price: 3499, comparePrice: 4999, category: 'Custom Chain', images: ['/products/custom-name.png'],
    stock: 30, featured: false, trending: true, rating: 4.8, reviewCount: 20, createdAt: '2025-01-03T00:00:00Z', updatedAt: '2025-01-03T00:00:00Z',
  },
  {
    id: '4', name: 'Layered Gold Chain', slug: 'layered-gold-chain', description: 'Multi-layered gold finish chain for a trendy look.',
    price: 4999, comparePrice: 6999, category: 'Stylish Chain', images: ['/products/stylish-layered.png'],
    stock: 15, featured: true, trending: true, rating: 4.7, reviewCount: 15, createdAt: '2025-01-04T00:00:00Z', updatedAt: '2025-01-04T00:00:00Z',
  },
  {
    id: '5', name: 'Leo Zodiac Chain', slug: 'leo-zodiac-chain', description: 'Majestic Leo zodiac sign pendant chain.',
    price: 2499, comparePrice: null, category: 'Zodiac Sign Chain', images: ['/products/zodiac-leo.png'],
    stock: 22, featured: false, trending: false, rating: 4.3, reviewCount: 6, createdAt: '2025-01-05T00:00:00Z', updatedAt: '2025-01-05T00:00:00Z',
  },
];

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  comparePrice: number;
  stock: number;
  featured: boolean;
  trending: boolean;
  images: string[];
}

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  category: 'Zodiac Sign Chain',
  price: 0,
  comparePrice: 0,
  stock: 0,
  featured: false,
  trending: false,
  images: [],
};

function SortableImageItem({
  url,
  index,
  onRemove,
}: {
  url: string;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: url,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex h-20 w-20 items-center justify-center rounded-lg border bg-muted overflow-hidden"
    >
      <img
        src={url}
        alt=""
        className="h-full w-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '';
          (e.target as HTMLImageElement).className = 'h-full w-full bg-muted flex items-center justify-center';
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1"
        >
          <GripVertical className="h-4 w-4 text-white" />
        </button>
        <button
          onClick={onRemove}
          className="ml-1 rounded-full bg-red-500 p-1 hover:bg-red-600"
        >
          <X className="h-3 w-3 text-white" />
        </button>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useAuthStore((s) => s.token);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : (search ? [] : fallbackProducts);

  const openCreateDialog = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      comparePrice: product.comparePrice || 0,
      stock: product.stock,
      featured: product.featured,
      trending: product.trending,
      images: [...product.images],
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (files: FileList) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers,
          body: fd,
        });
        if (res.ok) {
          const data = await res.json();
          return data.url;
        }
      } catch {
        // fallback: use object URL
      }
      return URL.createObjectURL(file);
    });

    const urls = await Promise.all(uploadPromises);
    setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setForm((prev) => {
        const oldIndex = prev.images.indexOf(active.id);
        const newIndex = prev.images.indexOf(over.id);
        return {
          ...prev,
          images: arrayMove(prev.images, oldIndex, newIndex),
        };
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        ...form,
        comparePrice: form.comparePrice || null,
      };
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      if (editingProduct) {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
      }
      fetchProducts();
      setDialogOpen(false);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers,
      });
      fetchProducts();
    } catch {
      // silently fail
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-charcoal hover:bg-charcoal/90 text-white"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="hidden sm:table-cell">Stock</TableHead>
                <TableHead className="hidden lg:table-cell">Featured</TableHead>
                <TableHead className="hidden lg:table-cell">Trending</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : displayProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                displayProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="pl-4">
                      <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                        {product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-charcoal">
                      {product.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {product.category}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-medium">₹{product.price.toLocaleString()}</span>
                        {product.comparePrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{product.comparePrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={product.stock > 10 ? 'secondary' : 'destructive'}
                        className="border-0"
                      >
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {product.featured && (
                        <Star className="h-4 w-4 fill-gold text-gold" />
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {product.trending && (
                        <TrendingUp className="h-4 w-4 fill-purple-500 text-purple-500" />
                      )}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-charcoal">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="prod-name">Name</Label>
              <Input
                id="prod-name"
                placeholder="Product name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prod-desc">Description</Label>
              <Textarea
                id="prod-desc"
                placeholder="Product description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prod-price">Price (₹)</Label>
                <Input
                  id="prod-price"
                  type="number"
                  placeholder="0"
                  value={form.price || ''}
                  onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prod-compare">Compare Price (₹)</Label>
                <Input
                  id="prod-compare"
                  type="number"
                  placeholder="Optional"
                  value={form.comparePrice || ''}
                  onChange={(e) => setForm((p) => ({ ...p, comparePrice: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prod-stock">Stock</Label>
              <Input
                id="prod-stock"
                type="number"
                placeholder="0"
                value={form.stock || ''}
                onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))}
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="prod-featured"
                  checked={form.featured}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, featured: !!v }))}
                />
                <Label htmlFor="prod-featured" className="cursor-pointer">
                  Featured
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="prod-trending"
                  checked={form.trending}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, trending: !!v }))}
                />
                <Label htmlFor="prod-trending" className="cursor-pointer">
                  Trending
                </Label>
              </div>
            </div>

            {/* Image Management */}
            <div className="grid gap-2">
              <Label>Images</Label>
              <div className="flex flex-wrap gap-2">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={form.images}
                    strategy={verticalListSortingStrategy}
                  >
                    {form.images.map((url, idx) => (
                      <SortableImageItem
                        key={url}
                        url={url}
                        index={idx}
                        onRemove={() => handleRemoveImage(idx)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleImageUpload(e.target.files);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-gold hover:bg-gold/5 transition-colors"
                >
                  <ImagePlus className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name || !form.price}
              className="bg-charcoal hover:bg-charcoal/90 text-white"
            >
              {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
