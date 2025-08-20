
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { Loader2, UploadCloud } from "lucide-react"
import Image from "next/image"

const productFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(1000),
  price: z.coerce.number().positive("Price must be a positive number."),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  image: z.any().refine(file => file, "Image is required.").refine(file => file?.size <= 5000000, `Max image size is 5MB.`),
  status: z.enum(["draft", "active", "archived"]),
})

export type Product = z.infer<typeof productFormSchema> & { image: { file?: File, preview: string } };

interface ProductFormProps {
  onSave: (product: Product) => void;
  productToEdit?: Product;
}

export function ProductForm({ onSave, productToEdit }: ProductFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(productToEdit?.image?.preview || null);

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productToEdit || {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      image: undefined,
      status: "draft",
    },
  })

  useEffect(() => {
    if (productToEdit) {
      form.reset(productToEdit);
      setImagePreview(productToEdit.image?.preview || null);
    }
  }, [productToEdit, form]);

  function onSubmit(values: z.infer<typeof productFormSchema>) {
    setIsSaving(true);
    // Simulate async operation
    setTimeout(() => {
        const finalProduct = {
            ...values,
            id: productToEdit?.id,
            image: {
                file: values.image as File,
                preview: imagePreview || ""
            }
        };
        onSave(finalProduct);
        setIsSaving(false);
    }, 1000);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('image', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 py-4">
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
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Image</FormLabel>
                <FormControl>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted text-muted-foreground">
                            {imagePreview ? (
                                <Image src={imagePreview} alt="Preview" width={96} height={96} className="object-cover rounded-md" />
                            ) : (
                                <UploadCloud className="h-8 w-8" />
                            )}
                        </div>
                        <div className="grid gap-1.5">
                            <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                                Upload Image
                            </Button>
                            <Input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            <FormDescription>Max 5MB, JPG, PNG, WEBP.</FormDescription>
                        </div>
                    </div>
                </FormControl>
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
        <DialogFooter>
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
