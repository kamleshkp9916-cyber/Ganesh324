
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
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
import { Loader2, UploadCloud, X, PlusCircle, Image as ImageIcon, Video } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { defaultCategories } from "@/lib/categories";
import { Separator } from "../ui/separator";
import { generateKeywords } from "@/lib/generateKeywords";
import { FormDescription } from "../ui/form"

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
  discountPercentage: z.coerce.number().optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  media: z.array(z.object({
      type: z.enum(['image', 'video']),
      file: z.any().optional(),
      preview: z.string()
  })).min(1, "Please upload at least one image or video."),
  listingType: z.enum(['live-stream', 'general']).default('general'),
  status: z.enum(["draft", "active", "archived"]),
  category: z.string().min(1, "Category is required."),
  subcategory: z.string().min(1, "Sub-category is required."),
  brand: z.string().optional(),
  modelNumber: z.string().optional(),
  availableSizes: z.string().optional(),
  availableColors: z.string().optional(),
  origin: z.string().optional(),
  variants: z.array(variantSchema).optional(),
  highlights: z.string().optional(),
  highlightsImage: z.any().optional(),
  keywords: z.array(z.string()).optional(),
  deliveryInfo: z.string().optional(),
  weight: z.coerce.number().positive("Weight must be a positive number.").optional(),
  length: z.coerce.number().positive("Length must be a positive number.").optional(),
  width: z.coerce.number().positive("Width must be a positive number.").optional(),
  height: z.coerce.number().positive("Height must be a positive number.").optional(),
}).refine(data => !data.discountPercentage || (data.discountPercentage > 0 && data.discountPercentage < 100), {
    message: "Discount must be between 1 and 99.",
    path: ["discountPercentage"],
});


export type Product = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  onSave: (product: Product) => void;
  productToEdit?: Product;
}

const VariantImageInput = ({ control, index, getValues }: { control: any, index: number, getValues: any }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const initialPreview = getValues(`variants.${index}.image`)?.preview || null;
    const [preview, setPreview] = useState(initialPreview);

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
  const [step, setStep] = useState(1);
  
  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productToEdit ? {
        ...productToEdit,
        price: parseFloat(String(productToEdit.price).replace(/[^0-9.-]+/g, '')) || 0,
        discountPercentage: productToEdit.discountPercentage ? parseFloat(String(productToEdit.discountPercentage)) : undefined,
        media: productToEdit.media?.map(item => ({...item, file: undefined })) || [],
        variants: productToEdit.variants?.map(v => ({
            ...v,
            price: v.price ? parseFloat(String(v.price).replace(/[^0-9.-]+/g, '')) : undefined
        })) || [],
    } : {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      media: [],
      listingType: "general",
      status: "draft",
      category: "",
      subcategory: "",
      brand: "",
      modelNumber: "",
      availableSizes: "",
      availableColors: "",
      origin: "",
      variants: [],
      highlights: "",
    },
  });

  const { fields: mediaFields, append: appendMedia, remove: removeMedia } = useFieldArray({
    control: form.control,
    name: "media"
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  const selectedCategory = form.watch("category");
  const subcategories = useMemo(() => {
      const category = defaultCategories.find(c => c.name === selectedCategory);
      return category?.subcategories || [];
  }, [selectedCategory]);
  
  useEffect(() => {
    form.resetField('subcategory');
  }, [selectedCategory, form]);

  useEffect(() => {
    if (productToEdit) {
      form.reset({
        ...productToEdit,
        price: parseFloat(String(productToEdit.price).replace(/[^0-9.-]+/g, '')) || 0,
        discountPercentage: productToEdit.discountPercentage ? parseFloat(String(productToEdit.discountPercentage)) : undefined,
        media: productToEdit.media?.map(item => ({...item, file: undefined })) || [],
        variants: productToEdit.variants?.map(v => ({
            ...v,
            price: v.price ? parseFloat(String(v.price).replace(/[^0-9.-]+/g, '')) : undefined
        })) || [],
      });
    }
  }, [productToEdit, form]);

  function handleFinalSave(values: z.infer<typeof productFormSchema>) {
    setIsSaving(true);
    let finalValues: Product = { ...values };

    if (finalValues.variants && finalValues.variants.length > 0) {
        finalValues.stock = finalValues.variants.reduce((acc, variant) => acc + (variant.stock || 0), 0);
    }

    const keywords = generateKeywords(finalValues);
    finalValues = { ...finalValues, keywords };

    setTimeout(() => {
        onSave(finalValues);
        setIsSaving(false);
        setStep(1);
    }, 1000);
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files;
    if (files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (event) => {
                appendMedia({ type, file: file, preview: event.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    }
  };

  const watchVariants = form.watch("variants");
  const totalVariantStock = useMemo(() => {
      return watchVariants?.reduce((acc, variant) => acc + (variant?.stock || 0), 0) || 0;
  }, [watchVariants]);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
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
                        <FormControl>
                            <Textarea placeholder="Feature 1&#x0a;Feature 2&#x0a;Feature 3" {...field} />
                        </FormControl>
                         <FormDescription>Each line will be shown as a separate bullet point.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField name="highlightsImage" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Highlights Image (Optional)</FormLabel>
                        <FormControl>
                            {/* This is a simplified version. A real one might need useState. */}
                            <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} />
                        </FormControl>
                        <FormDescription>An image to display prominently in the highlights section. Recommended size: 800x800 pixels.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>

              <div className="grid grid-cols-2 gap-4">
                  <FormField name="category" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>{defaultCategories.map(cat => <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  )}/>
                  <FormField name="subcategory" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Sub-category</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={!selectedCategory}><FormControl><SelectTrigger><SelectValue placeholder="Select a sub-category" /></SelectTrigger></FormControl><SelectContent>{subcategories.map(sub => <SelectItem key={sub.name} value={sub.name}>{sub.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  )}/>
              </div>
               <div className="grid grid-cols-2 gap-4">
                   <FormField name="brand" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Brand (Optional)</FormLabel><FormControl><Input placeholder="e.g., RetroCam" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField name="modelNumber" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Model Number (Optional)</FormLabel><FormControl><Input placeholder="e.g., RC-1975" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
               </div>
                <FormField name="origin" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Country of Origin (Optional)</FormLabel><FormControl><Input placeholder="e.g., Japan" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              <FormField name="media" control={form.control} render={({ field }) => (
                  <FormItem>
                      <FormLabel>Product Media</FormLabel>
                      <FormControl>
                          <div className="flex items-center gap-4 flex-wrap">
                              {mediaFields.map((field, index) => (
                                  <div key={field.id} className="relative w-24 h-24">
                                      {field.type === 'image' ? (
                                          <Image src={field.preview} alt={`Preview ${index}`} width={96} height={96} className="object-cover rounded-md w-full h-full"/>
                                      ) : (
                                          <video src={field.preview} className="object-cover rounded-md w-full h-full" />
                                      )}
                                      <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeMedia(index)}><X className="h-4 w-4" /></Button>
                                  </div>
                              ))}
                              <div className="flex gap-2">
                                  <label htmlFor="image-upload" className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted text-muted-foreground cursor-pointer hover:border-primary hover:text-primary">
                                      <div className="text-center"><ImageIcon className="h-8 w-8 mx-auto" /><span className="text-xs">Add Images</span></div>
                                      <Input id="image-upload" type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleMediaChange(e, 'image')}/>
                                  </label>
                                  <label htmlFor="video-upload" className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted text-muted-foreground cursor-pointer hover:border-primary hover:text-primary">
                                      <div className="text-center"><Video className="h-8 w-8 mx-auto" /><span className="text-xs">Add Video</span></div>
                                      <Input id="video-upload" type="file" className="hidden" accept="video/*" onChange={(e) => handleMediaChange(e, 'video')}/>
                                  </label>
                              </div>
                          </div>
                      </FormControl>
                      <FormDescription>The first item will be the main display media. Recommended size: 800x800 pixels. Max 5MB per file.</FormDescription>
                      <FormMessage />
                  </FormItem>
              )}/>
               <FormField name="listingType" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Listing Type</FormLabel>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="general" id="general"/></FormControl>
                        <FormLabel htmlFor="general" className="font-normal">General Listing - Available for everyone to purchase anytime.</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="live-stream" id="live-stream"/></FormControl>
                        <FormLabel htmlFor="live-stream" className="font-normal">Live Stream Only - Product is only available for purchase during a live stream.</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  <FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="active" id="active"/></FormControl>
                        <FormLabel htmlFor="active" className="font-normal">Active</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="draft" id="draft"/></FormControl>
                        <FormLabel htmlFor="draft" className="font-normal">Draft</FormLabel>
                      </FormItem>
                       <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="archived" id="archived"/></FormControl>
                        <FormLabel htmlFor="archived" className="font-normal">Archived</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}/>
            </div>
          </ScrollArea>
        );
      case 2:
        return (
          <ScrollArea className="flex-grow pr-6 -mr-6">
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 items-end">
                  <FormField name="price" control={form.control} render={({ field }) => (
                      <FormItem>
                          <FormLabel>Selling Price</FormLabel>
                          <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                              <FormControl><Input type="number" placeholder="999.00" className="pl-6" {...field} /></FormControl>
                          </div>
                          <FormMessage />
                      </FormItem>
                  )}/>
                  <FormField name="discountPercentage" control={form.control} render={({ field }) => (
                      <FormItem>
                          <FormLabel>Discount Percentage (Optional)</FormLabel>
                          <div className="relative">
                              <FormControl><Input type="number" placeholder="e.g., 10" className="pr-6" {...field} /></FormControl>
                              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">%</span>
                          </div>
                          <FormMessage />
                      </FormItem>
                  )}/>
              </div>
              <FormDescription className="text-xs -mt-2">The discount creates a "sale" effect by showing a higher original price.</FormDescription>
              
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  <FormField name="availableSizes" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Available Sizes (comma-separated)</FormLabel><FormControl><Input placeholder="e.g., S, M, L, XL" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField name="availableColors" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Available Colors (comma-separated)</FormLabel><FormControl><Input placeholder="e.g., Red, Blue, Green" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
              </div>

              <Separator />

              <div>
                  <h3 className="text-base font-semibold mb-2">Inventory &amp; Variants</h3>
                  {variantFields.length > 0 ? (
                      <div className="space-y-2">
                          {variantFields.map((field, index) => (
                              <div key={field.id} className="grid grid-cols-[auto,1fr,1fr,1fr,1fr,auto] gap-2 items-end p-3 border rounded-lg">
                                  <VariantImageInput control={form.control} index={index} getValues={form.getValues} />
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
            </div>
          </ScrollArea>
        );
      case 3:
        return (
            <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Shipping Details</h3>
                <p className="text-sm text-muted-foreground">Add private notes and package dimensions for delivery. This will not be visible to the customer on the product page, but will be available for invoicing.</p>
                <FormField name="deliveryInfo" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Internal Notes / Key Details</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g., Fragile item, handle with care. Contains glassware. Box #A-123." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                   <FormField name="weight" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl><Input type="number" placeholder="0.5" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField name="length" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Length (cm)</FormLabel>
                            <FormControl><Input type="number" placeholder="20" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField name="width" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Width (cm)</FormLabel>
                            <FormControl><Input type="number" placeholder="15" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField name="height" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl><Input type="number" placeholder="10" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
            </div>
        )
      default:
        return null;
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(step === 3 ? handleFinalSave : () => setStep(s => s + 1))} className="flex flex-col h-full">
        {renderStepContent()}
        <DialogFooter className="pt-6 border-t mt-auto p-6">
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          {step > 1 && (
            <Button type="button" variant="ghost" onClick={() => setStep(s => s - 1)}>Back</Button>
          )}
          <Button type="submit" disabled={isSaving}>
            {step === 3 ? (
              <>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {productToEdit ? "Save Changes" : "Create Product"}
              </>
            ) : "Next"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

    