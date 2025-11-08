import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, X, Check, ArrowLeft } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  _count?: {
    items: number;
  };
}

interface CategoryManagementProps {
  onClose: () => void;
}

export default function CategoryManagement({ onClose }: CategoryManagementProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
      setError('');
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create category');
      }

      const newCategory = await response.json();
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setIsAdding(false);
      setSuccess('Category created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
      console.error(err);
    }
  };

  const handleUpdateCategory = async (id: number) => {
    if (!editingName.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }

      const updatedCategory = await response.json();
      setCategories(categories.map(cat => cat.id === id ? updatedCategory : cat));
      setEditingId(null);
      setEditingName('');
      setSuccess('Category updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      setCategories(categories.filter(cat => cat.id !== id));
      setSuccess('Category deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
      console.error(err);
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
    setError('');
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewCategoryName('');
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="py-12 text-center">
              <p className="text-lg">Loading categories...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Category Management</CardTitle>
            {!isAdding && (
              <Button
                onClick={() => setIsAdding(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Add New Category Form */}
          {isAdding && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleCreateCategory();
                      if (e.key === 'Escape') cancelAdding();
                    }}
                    autoFocus
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCreateCategory}
                    size="sm"
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    onClick={cancelAdding}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Categories List */}
          <div className="space-y-3">
            {categories.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No categories found. Create your first category to get started!</p>
                </CardContent>
              </Card>
            ) : (
              categories.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="py-4">
                    {editingId === category.id ? (
                      // Edit Mode
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleUpdateCategory(category.id);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                          autoFocus
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleUpdateCategory(category.id)}
                          size="sm"
                          className="gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Save
                        </Button>
                        <Button
                          onClick={cancelEditing}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{category.name}</h3>
                          {category._count && (
                            <Badge variant="secondary">
                              {category._count.items} {category._count.items === 1 ? 'item' : 'items'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => startEditing(category)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            disabled={category._count && category._count.items > 0}
                            title={
                              category._count && category._count.items > 0
                                ? 'Cannot delete category with menu items'
                                : 'Delete category'
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Info Message */}
          {categories.length > 0 && (
            <Alert>
              <AlertDescription className="text-sm text-muted-foreground">
                💡 Tip: You cannot delete categories that have menu items. Move or delete the items first.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
