
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { useState, useMemo, useEffect, useRef } from 'react';
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
import { Loader2, UploadCloud, X, PlusCircle, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { categories } from "@/lib/categories";
import { Separator } from "../ui/separator";

const variantSchema = z.object({
    size: z.string().optional(),
    color: z.string().optional(),
    stock: z.coerce.number().int().min(0, "Stock must be a non-negative number."),
    price: z.coerce.number().positive("Price must be a positive number.").optional(),
    image: z.any().optional(),
    highlights: z.string().optional(),
});

const productFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(1000),
  price: z.coerce.number().positive("Price must be a positive number."),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  images: z.array(z.object({
      file: z.any().optional(),
      preview: z.string()
  })).min(1, "Please upload at least one image."),
  listingType: z.enum(['live-stream', 'general']).default('general'),
  status: z.enum(["draft", "active", "archived"]),
  category: z.string().min(1, "Category is required."),
  subcategory: z.string().min(1, "Sub-category is required."),
  variants: z.array(variantSchema).optional(),
  highlights: z.string().optional(),
})

export type Product = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  onSave: (product: Product) => void;
  productToEdit?: Product;
}

const VariantImageInput = ({ control, index }: { control: any, index: number }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { field } = useForm({ control }).register(`variants.${index}.image`);

    const [preview, setPreview] = useState(control.getValues(`variants.${index}.image`)?.preview || null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                control.setValue(`variants.${index}.image`, { file, preview: result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <FormItem className="flex flex-col items-center">
            <FormLabel className="text-xs">Image</FormLabel>
            <FormControl>
                <div 
                    className="w-16 h-16 rounded-md border-2 border-dashed flex items-center justify-center bg-muted text-muted-foreground hover:border-primary hover:text-primary cursor-pointer relative"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {preview ? (
                        <Image src={preview} alt="Variant Preview" fill className="object-cover rounded-md" />
                    ) : (
                        <ImageIcon className="h-6 w-6" />
                    )}
                </div>
            </FormControl>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
            />
        </FormItem>
    );
};


export function ProductForm({ onSave, productToEdit }: ProductFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const defaultValues = useMemo(() => {
    if (productToEdit) {
      return {
        ...productToEdit,
        price: parseFloat(String(productToEdit.price).replace(/[^0-9.-]+/g, '')) || 0,
        images: productToEdit.images?.map(img => ({...img, file: undefined })) || [],
        variants: productToEdit.variants?.map(v => ({
            ...v,
            price: v.price ? parseFloat(String(v.price).replace(/[^0-9.-]+/g, '')) : undefined
        })) || [],
      };
    }
    return {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      images: [],
      listingType: "general",
      status: "draft",
      category: "",
      subcategory: "",
      variants: [],
      highlights: "",
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

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  const selectedCategory = form.watch("category");
  const subcategories = useMemo(() => {
      const category = categories.find(c => c.name === selectedCategory);
      return category?.subcategories || [];
  }, [selectedCategory]);
  
  useEffect(() => {
    if (form.formState.isDirty) {
        form.resetField('subcategory');
    }
  }, [selectedCategory, form]);

  useEffect(() => {
    form.reset(defaultValues);
  }, [productToEdit, form, defaultValues]);

  function onSubmit(values: z.infer<typeof productFormSchema>) {
    setIsSaving(true);
    
    // Calculate total stock from variants if they exist
    if (values.variants && values.variants.length > 0) {
        values.stock = values.variants.reduce((acc, variant) => acc + (variant.stock || 0), 0);
    }

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

  const watchVariants = form.watch("variants");
  const totalVariantStock = useMemo(() => {
      return watchVariants?.reduce((acc, variant) => acc + (variant?.stock || 0), 0) || 0;
  }, [watchVariants]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <ScrollArea className="flex-grow pr-6 -mr-6">
            <div className="space-y-6 py-4">
              <FormField name="name" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g. Vintage Leather Jacket" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField name="description" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your product in detail..." className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField name="highlights" control={form.control} render={({ field }) => (
                  <FormItem>
                      <FormLabel>Product Highlights</FormLabel>
                      <FormControl><Textarea placeholder="Enter key features, one per line." {...field} /></FormControl>
                      <FormDescription>Each line will be shown as a separate highlight point.</FormDescription>
                      <FormMessage />
                  </FormItem>
              )}/>

              <div className="grid grid-cols-2 gap-4">
                 <FormField name="category" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>{categories.map(cat => <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  )}/>
                 <FormField name="subcategory" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Sub-category</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={!selectedCategory}><FormControl><SelectTrigger><SelectValue placeholder="Select a sub-category" /></SelectTrigger></FormControl><SelectContent>{subcategories.map(sub => <SelectItem key={sub.name} value={sub.name}>{sub.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  )}/>
              </div>

               <FormField name="price" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Base Price</FormLabel><div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span><FormControl><Input type="number" placeholder="0.00" className="pl-6" {...field} /></FormControl></div><FormDescription>This will be used if a variant has no specific price.</FormDescription><FormMessage /></FormItem>
                )}/>

                <Separator />

                <div>
                    <h3 className="text-base font-semibold mb-2">Inventory & Variants</h3>
                    {variantFields.length > 0 ? (
                        <div className="space-y-2">
                             {variantFields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 items-center p-3 border rounded-lg">
                                    <VariantImageInput control={form.control} index={index} />
                                    <FormField control={form.control} name={`variants.${index}.color`} render={({ field }) => (
                                        <FormItem><FormLabel className="text-xs">Color</FormLabel><FormControl><Input placeholder="e.g., Red" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`variants.${index}.size`} render={({ field }) => (
                                        <FormItem><FormLabel className="text-xs">Size</FormLabel><FormControl><Input placeholder="e.g., M" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                     <FormField control={form.control} name={`variants.${index}.stock`} render={({ field }) => (
                                        <FormItem><FormLabel className="text-xs">Stock</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                     <FormField control={form.control} name={`variants.${index}.price`} render={({ field }) => (
                                        <FormItem><FormLabel className="text-xs">Price (Opt.)</FormLabel><FormControl><Input type="number" placeholder="Default" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <Textarea placeholder="Variant Highlights (one per line)" {...form.register(`variants.${index}.highlights`)} className="col-span-full mt-2" />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(index)} className="text-destructive"><X className="h-4 w-4" /></Button>
                                </div>
                            ))}
                            <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                                <span className="font-semibold text-sm">Total Variant Stock:</span>
                                <span className="font-bold">{totalVariantStock}</span>
                            </div>
                        </div>
                    ) : (
                         <FormField name="stock" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Total Stock</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    )}

                     <Button type="button" variant="outline" size="sm" onClick={() => appendVariant({ color: '', size: '', stock: 0 })} className="mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Variant
                    </Button>
                </div>

                <Separator />

               <FormField name="images" control={form.control} render={() => (
                    <FormItem>
                        <FormLabel>Product Images</FormLabel>
                        <FormControl>
                            <div className="flex items-center gap-4 flex-wrap">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="relative w-24 h-24">
                                        <Image src={field.preview} alt={`Preview ${index}`} width={96} height={96} className="object-cover rounded-md w-full h-full"/>
                                        <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => remove(index)}><X className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                                <label htmlFor="image-upload" className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted text-muted-foreground cursor-pointer hover:border-primary hover:text-primary">
                                    <div className="text-center"><UploadCloud className="h-8 w-8 mx-auto" /><span className="text-xs">Add Images</span></div>
                                    <Input id="image-upload" type="file" multiple className="hidden" accept="image/*" onChange={handleImageChange}/>
                                </label>
                            </div>
                        </FormControl>
                         <FormDescription>The first image will be the main display image. Max 5MB per image.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <FormField name="listingType" control={form.control} render={({ field }) => (
                    <FormItem className="space-y-3">
                    <FormLabel>Listing Type</FormLabel>
                    <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="general" /></FormControl><FormLabel className="font-normal">General Listing <span className="text-xs text-muted-foreground">- Available for everyone to purchase anytime.</span></FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="live-stream" /></FormControl><FormLabel className="font-normal">Live Stream Only <span className="text-xs text-muted-foreground">- Product is only available for purchase during a live stream.</span></FormLabel></FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}/>
               <FormField name="status" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select product status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )}/>
            </div>
        </ScrollArea>
        <DialogFooter className="pt-6 border-t mt-auto">
          <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {productToEdit ? "Save Changes" : "Create Product"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
