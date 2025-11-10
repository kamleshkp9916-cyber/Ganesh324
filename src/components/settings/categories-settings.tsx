
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { defaultCategories, Category, Subcategory, CATEGORIES_KEY } from "@/lib/categories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function CategoriesSettings() {
  const [categories, setCategories] = useLocalStorage<Category[]>(CATEGORIES_KEY, defaultCategories);
  const [isMounted, setIsMounted] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState<{ parent: string; name: string }>({ parent: "", name: "" });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addCategory = () => {
    if (newCategory.trim() && !categories.find(c => c.name.toLowerCase() === newCategory.toLowerCase())) {
      setCategories([...categories, { id: newCategory.toLowerCase().replace(/\s+/g, '-'), name: newCategory, subcategories: [] }]);
      setNewCategory("");
    }
  };
  
  const addSubcategory = (categoryName: string) => {
    if (newSubcategory.name.trim()) {
        setCategories(categories.map(c => 
            c.name === categoryName 
            ? { ...c, subcategories: [...c.subcategories, { name: newSubcategory.name, description: '' }] } 
            : c
        ));
        setNewSubcategory({ parent: "", name: "" });
    }
  };

  const removeCategory = (categoryName: string) => {
    setCategories(categories.filter(c => c.name !== categoryName));
  };
  
  const removeSubcategory = (categoryName: string, subcategoryName: string) => {
    setCategories(categories.map(c => 
        c.name === categoryName 
        ? { ...c, subcategories: c.subcategories.filter(s => s.name !== subcategoryName) } 
        : c
    ));
  };

  if (!isMounted) {
    return <div>Loading categories...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Management</CardTitle>
        <CardDescription>Add, edit, or delete product categories and subcategories.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
            <Input 
                placeholder="New category name..." 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)}
            />
            <Button onClick={addCategory}><PlusCircle className="mr-2 h-4 w-4"/> Add Category</Button>
        </div>
        <div className="space-y-4">
            {categories.map((category) => (
                <Card key={category.name} className="bg-muted/40">
                    <CardHeader className="flex flex-row items-center justify-between py-3">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeCategory(category.name)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-2 pb-4">
                        {category.subcategories.map((sub) => (
                             <div key={sub.name} className="flex items-center justify-between p-2 rounded-md bg-background border">
                                <span className="text-sm">{sub.name}</span>
                                <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => removeSubcategory(category.name, sub.name)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                         <div className="flex items-center gap-2 pt-2">
                            <Input 
                                placeholder="New subcategory..." 
                                value={newSubcategory.parent === category.name ? newSubcategory.name : ""}
                                onFocus={() => setNewSubcategory({ parent: category.name, name: "" })}
                                onChange={(e) => setNewSubcategory({ parent: category.name, name: e.target.value })}
                            />
                            <Button size="sm" variant="outline" onClick={() => addSubcategory(category.name)}>Add</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
