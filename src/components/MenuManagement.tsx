import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Edit, Plus, Upload, X } from "lucide-react";
import { API_BASE_URL, SERVER_BASE_URL } from "@/lib/apiConfig";

interface MenuCategory {
  id: number;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  dietary: string[];
  spiceLevel?: number;
  categoryId: number;
  category: string;
  imageUrl?: string;
}

interface MenuManagementProps {
  onClose?: () => void;
}

export default function MenuManagement({ onClose }: MenuManagementProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    dietary: [] as string[],
    spiceLevel: "",
    categoryId: "",
    imageUrl: "",
    // New fields for database image storage
    imageData: "",
    imageMimeType: "",
    imageSize: 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Spicy", "Mild"];

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, [currentPage, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (selectedCategory && selectedCategory !== "all") {
        params.append('category', selectedCategory);
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/menu-items?${params}`);
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const data = await response.json();
      
      setMenuItems(data.items);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) {
      setError('Failed to load menu items');
      setLoading(false);
      console.error(err);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<{imageData: string, imageMimeType: string, imageSize: number} | null> => {
    if (!imageFile) return null;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/upload-image`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to process image');
      const data = await response.json();
      setUploading(false);
      return {
        imageData: data.imageData,
        imageMimeType: data.imageMimeType,
        imageSize: data.imageSize
      };
    } catch (err) {
      setUploading(false);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let submitData = {
        ...formData,
        price: parseFloat(formData.price),
        spiceLevel: formData.spiceLevel ? parseInt(formData.spiceLevel) : null,
        categoryId: parseInt(formData.categoryId)
      };
      
      // Process new image if selected
      if (imageFile) {
        const imageData = await uploadImage();
        if (imageData) {
          submitData = {
            ...submitData,
            imageData: imageData.imageData,
            imageMimeType: imageData.imageMimeType,
            imageSize: imageData.imageSize,
            imageUrl: null // Clear external URL when using database storage
          };
        }
      } else {
        // If no new image, only send imageUrl if it exists and is not empty
        if (formData.imageUrl && formData.imageUrl.trim() !== '') {
          submitData.imageUrl = formData.imageUrl;
        }
        // Don't send empty imageData fields
        delete submitData.imageData;
        delete submitData.imageMimeType;
        delete submitData.imageSize;
      }

      const url = editingItem 
        ? `${API_BASE_URL}/admin/menu-items/${editingItem.id}`
        : `${API_BASE_URL}/admin/menu-items`;
        
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) throw new Error('Failed to save menu item');

      fetchMenuItems();
      resetForm();
      setIsDialogOpen(false);
    } catch (err) {
      setError('Failed to save menu item');
      console.error(err);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      dietary: item.dietary,
      spiceLevel: item.spiceLevel?.toString() || "",
      categoryId: item.categoryId.toString(),
      imageUrl: item.imageUrl || "",
      imageData: "",
      imageMimeType: "",
      imageSize: 0
    });
    setImagePreview(item.imageUrl || "");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/menu-items/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete menu item');
      fetchMenuItems();
    } catch (err) {
      setError('Failed to delete menu item');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      dietary: [],
      spiceLevel: "",
      categoryId: "",
      imageUrl: "",
      imageData: "",
      imageMimeType: "",
      imageSize: 0
    });
    setEditingItem(null);
    setImageFile(null);
    setImagePreview("");
  };

  const toggleDietary = (option: string) => {
    setFormData(prev => ({
      ...prev,
      dietary: prev.dietary.includes(option)
        ? prev.dietary.filter(d => d !== option)
        : [...prev.dietary, option]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Menu Management</h2>
          <p className="text-foreground/70">Manage your restaurant's menu items and images</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Update the details of this menu item.' : 'Create a new menu item for your restaurant.'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label>Item Image</Label>
                  <div className="flex flex-col space-y-4">
                    {imagePreview && (
                      <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview("");
                            setImageFile(null);
                            setFormData(prev => ({ 
                              ...prev, 
                              imageUrl: "",
                              imageData: "",
                              imageMimeType: "",
                              imageSize: 0
                            }));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="flex-1"
                      />
                      <Upload className="w-4 h-4 text-foreground/50" />
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (€) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.categoryId} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spiceLevel">Spice Level (1-5)</Label>
                    <Input
                      id="spiceLevel"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.spiceLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, spiceLevel: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Dietary Options */}
                <div className="space-y-2">
                  <Label>Dietary Options</Label>
                  <div className="flex flex-wrap gap-2">
                    {dietaryOptions.map((option) => (
                      <Badge
                        key={option}
                        variant={formData.dietary.includes(option) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleDietary(option)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? "Uploading..." : editingItem ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading menu items...</div>
      ) : (
        <>
          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <Card key={item.id} className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow overflow-hidden">
                {item.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={`${SERVER_BASE_URL}${item.imageUrl}`} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <span className="text-lg font-bold text-accent">€{item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-foreground/70 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                    {item.spiceLevel && (
                      <Badge variant="outline" className="text-xs">
                        {'🌶️'.repeat(item.spiceLevel)}
                      </Badge>
                    )}
                    {item.dietary.map((diet, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {diet}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button 
                variant="outline" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}