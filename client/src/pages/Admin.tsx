import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    available: "1",
  });

  const { data: products, isLoading: productsLoading } = trpc.admin.products.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: orders, isLoading: ordersLoading } = trpc.admin.orders.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const createProductMutation = trpc.admin.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully");
      utils.admin.products.list.invalidate();
      setProductDialogOpen(false);
      resetProductForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  const updateProductMutation = trpc.admin.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      utils.admin.products.list.invalidate();
      utils.products.list.invalidate();
      setProductDialogOpen(false);
      resetProductForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  const deleteProductMutation = trpc.admin.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully");
      utils.admin.products.list.invalidate();
      utils.products.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const updateOrderStatusMutation = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      utils.admin.orders.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update order status");
    },
  });

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
      available: "1",
    });
    setEditingProduct(null);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceInCents = Math.round(parseFloat(productForm.price) * 100);

    if (editingProduct) {
      updateProductMutation.mutate({
        id: editingProduct,
        name: productForm.name,
        description: productForm.description,
        price: priceInCents,
        category: productForm.category,
        imageUrl: productForm.imageUrl || undefined,
        available: parseInt(productForm.available),
      });
    } else {
      createProductMutation.mutate({
        name: productForm.name,
        description: productForm.description,
        price: priceInCents,
        category: productForm.category,
        imageUrl: productForm.imageUrl || undefined,
        available: parseInt(productForm.available),
      });
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product.id);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: (product.price / 100).toFixed(2),
      category: product.category,
      imageUrl: product.imageUrl || "",
      available: product.available.toString(),
    });
    setProductDialogOpen(true);
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate({ id });
    }
  };

  const handleStatusChange = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({
      id: orderId,
      status: status as "pending" | "confirmed" | "ready" | "completed" | "cancelled",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="bg-primary text-primary-foreground shadow-md">
          <div className="container py-4">
            <Link href="/">
              <h1 className="text-2xl font-bold cursor-pointer">Boulangerie Saint Marc</h1>
            </Link>
          </div>
        </nav>
        <main className="flex-1 flex items-center justify-center bg-background">
          <Card className="max-w-md bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Admin Access Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Please log in to access the admin panel.</p>
              <a href={getLoginUrl()}>
                <Button className="w-full bg-primary text-primary-foreground">Log In</Button>
              </a>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="bg-primary text-primary-foreground shadow-md">
          <div className="container py-4">
            <Link href="/">
              <h1 className="text-2xl font-bold cursor-pointer">Boulangerie Saint Marc</h1>
            </Link>
          </div>
        </nav>
        <main className="flex-1 flex items-center justify-center bg-background">
          <Card className="max-w-md bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">You do not have permission to access this page.</p>
              <Link href="/">
                <Button className="w-full bg-primary text-primary-foreground">Return to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-primary text-primary-foreground shadow-md">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold cursor-pointer">Boulangerie Saint Marc</h1>
            </Link>
            <div className="flex gap-4">
              <Link href="/">
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
                  Home
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
                  Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-12 bg-background">
        <div className="container">
          <h2 className="text-4xl font-bold mb-8 text-foreground">Admin Dashboard</h2>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products">
              <Card className="bg-card text-card-foreground">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Manage Products</CardTitle>
                  <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetProductForm} className="bg-primary text-primary-foreground">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card text-card-foreground">
                      <DialogHeader>
                        <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                        <DialogDescription>
                          {editingProduct ? "Update product information" : "Create a new product listing"}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleProductSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Product Name *</Label>
                          <Input
                            id="name"
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            required
                            className="bg-background text-foreground"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            className="bg-background text-foreground"
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Price ($) *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            required
                            className="bg-background text-foreground"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category *</Label>
                          <Input
                            id="category"
                            value={productForm.category}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                            placeholder="e.g., Bread, Pastries, Cakes"
                            required
                            className="bg-background text-foreground"
                          />
                        </div>
                        <div>
                          <Label htmlFor="imageUrl">Image URL</Label>
                          <Input
                            id="imageUrl"
                            value={productForm.imageUrl}
                            onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                            placeholder="https://..."
                            className="bg-background text-foreground"
                          />
                        </div>
                        <div>
                          <Label htmlFor="available">Availability</Label>
                          <Select
                            value={productForm.available}
                            onValueChange={(value) => setProductForm({ ...productForm, available: value })}
                          >
                            <SelectTrigger className="bg-background text-foreground">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Available</SelectItem>
                              <SelectItem value="0">Out of Stock</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-primary text-primary-foreground"
                          disabled={createProductMutation.isPending || updateProductMutation.isPending}
                        >
                          {editingProduct ? "Update Product" : "Create Product"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products?.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>${(product.price / 100).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={product.available ? "default" : "secondary"}>
                                {product.available ? "Available" : "Out of Stock"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>Manage Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Pickup Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.id}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.customerName}</p>
                                <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell>{order.customerPhone}</TableCell>
                            <TableCell>${(order.totalAmount / 100).toFixed(2)}</TableCell>
                            <TableCell>
                              {order.pickupDate
                                ? new Date(order.pickupDate).toLocaleDateString()
                                : "Not specified"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  order.status === "completed"
                                    ? "default"
                                    : order.status === "cancelled"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleStatusChange(order.id, value)}
                              >
                                <SelectTrigger className="w-32 bg-background text-foreground">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="ready">Ready</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">No orders yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="container text-center">
          <p className="text-sm">
            © 2024 Boulangerie Saint Marc. Authentic Haitian Bakery in Brockton, MA.
          </p>
        </div>
      </footer>
    </div>
  );
}
