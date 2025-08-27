
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DialogFooter, DialogClose } from "../ui/dialog"
import { Loader2, UploadCloud, X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const productFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Product name must be at least 3 characters."),
  brand: z.string().min(2, "Brand name must be at least 2 characters."),
  category: z.string().min(1, "Please select a category."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(1000),
  highlights: z.string().optional(),
  price: z.coerce.number().positive("Price must be a positive number."),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  images: z.array(z.object({
      file: z.any().refine(file => file, "Image is required."),
      preview: z.string()
  })).min(1, "Please upload at least one image."),
  status: z.enum(["draft", "active", "archived"]),
  // Category specific fields
  size: z.string().optional(),
  color: z.string().optional(),
  modelNumber: z.string().optional(),
  origin: z.string().optional(),
})

export type Product = z.infer<typeof productFormSchema>;

const categories = ["Fashion", "Electronics", "Home Goods", "Beauty", "Kitchenware", "Fitness", "Handmade", "Pet Supplies", "Books", "Gaming"];

interface ProductFormProps {
  onSave: (product: Product) => void;
  productToEdit?: Product & {image?: any};
}

const CategorySpecificFields = ({ control }: { control: any }) => {
    const category = useWatch({ control, name: 'category' });

    if (!category) return null;

    return (
        <>
            {category === 'Fashion' && (
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name="size"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Size</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a size" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="XS">XS</SelectItem>
                                        <SelectItem value="S">S</SelectItem>
                                        <SelectItem value="M">M</SelectItem>
                                        <SelectItem value="L">L</SelectItem>
                                        <SelectItem value="XL">XL</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="color"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Color</FormLabel>
                                <FormControl><Input placeholder="e.g., Blue" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}
             {category === 'Electronics' && (
                <FormField
                    control={control}
                    name="modelNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Model Number</FormLabel>
                            <FormControl><Input placeholder="e.g., A2651" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
             {['Home Goods', 'Kitchenware', 'Handmade'].includes(category) && (
                 <FormField
                    control={control}
                    name="origin"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Country of Origin</FormLabel>
                            <FormControl><Input placeholder="e.g., India" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </>
    );
};

export function ProductForm({ onSave, productToEdit }: ProductFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const defaultValues = useMemo(() => {
    if (productToEdit) {
        let images = productToEdit.images;
        // Legacy support for single image
        if (productToEdit.image && !productToEdit.images) {
            images = [{ file: null, preview: productToEdit.image.preview }];
        }
        return { ...productToEdit, images: images || [] };
    }
    return {
      name: "",
      brand: "",
      category: "",
      description: "",
      highlights: "",
      price: 0,
      stock: 0,
      images: [],
      status: "draft",
      size: "",
      color: "",
      modelNumber: "",
      origin: "",
    };
  }, [productToEdit]);

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images"
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [productToEdit, form, defaultValues]);

  function onSubmit(values: z.infer<typeof productFormSchema>) {
    setIsSaving(true);
    setTimeout(() => {
        onSave(values);
        setIsSaving(false);
    }, 1000);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (event) => {
                append({ file: file, preview: event.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <ScrollArea className="flex-grow pr-6 -mr-6">
            <div className="space-y-6 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Vintage Leather Jacket" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Brand Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. Sony, Apple, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <CategorySpecificFields control={form.control} />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your product in detail..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="highlights"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Highlights</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter each highlight on a new line..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>
                        List the key features of your product. Each line will be shown as a bullet point.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Price</FormLabel>
                         <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                            <FormControl>
                                <Input type="number" placeholder="0.00" className="pl-6" {...field} />
                            </FormControl>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                    control={form.control}
                    name="images"
                    render={() => (
                        <FormItem>
                            <FormLabel>Product Images</FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-4 flex-wrap">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="relative w-24 h-24">
                                            <Image
                                                src={field.preview}
                                                alt={`Preview ${index}`}
                                                width={96}
                                                height={96}
                                                className="object-cover rounded-md w-full h-full"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                onClick={() => remove(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    <label htmlFor="image-upload" className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted text-muted-foreground cursor-pointer hover:border-primary hover:text-primary">
                                        <div className="text-center">
                                            <UploadCloud className="h-8 w-8 mx-auto" />
                                            <span className="text-xs">Add Images</span>
                                        </div>
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            multiple
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                            </FormControl>
                             <FormDescription>Max 5MB per image. JPG, PNG, WEBP.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

               <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select product status" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
        </ScrollArea>
        <DialogFooter className="pt-6 border-t mt-auto">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {productToEdit ? "Save Changes" : "Create Product"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
