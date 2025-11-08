
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Upload, Trash2, Camera, FileEdit, Video, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getFirestoreDb, getFirebaseStorage } from "@/lib/firebase";
import { collection, doc, setDoc, addDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { defaultCategories } from "@/lib/categories";
import Image from "next/image";

export interface Product {
    id?: string;
    key?: string;
    name: string;
    description: string;
    highlights?: string;
    highlightsImage?: { file?: File, preview: string };
    category: string;
    subcategory?: string;
    brand?: string;
    modelNumber?: string;
    availableSizes?: string;
    availableColors?: string;
    countryOfOrigin?: string;
    price: number;
    discountPercentage?: number;
    stock: number;
    variants?: any[];
    media: { type: 'video' | 'image', file?: File, url: string }[];
    status: 'active' | 'draft' | 'archived';
    listingType: 'general' | 'live-only';
    keyDetails?: string;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
}

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required."),
  description: z.string().min(1, "Description is required."),
  highlights: z.string().optional().default(''),
  highlightsImage: z.any().optional(),
  category: z.string().min(1, "Please select a category."),
  subcategory: z.string().optional().default(''),
  brand: z.string().optional().default(''),
  modelNumber: z.string().optional().default(''),
  availableSizes: z.string().optional().default(''),
  availableColors: z.string().optional().default(''),
  countryOfOrigin: z.string().optional().default(''),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  discountPercentage: z.coerce.number().optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  media: z.array(z.any()).min(1, "At least one image or video is required."),
  listingType: z.enum(['general', 'live-only']),
  status: z.enum(['active', 'draft', 'archived']),
  keyDetails: z.string().optional().default(''),
  weight: z.coerce.number().optional(),
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
});


interface ProductFormProps {
    onSave: (product: Product) => void;
    productToEdit?: Product;
}

export function ProductForm({ onSave, productToEdit }: ProductFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [media, setMedia] = useState<{type: 'video' | 'image', file?: File, url: string}[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const highlightsImageInputRef = useRef<HTMLInputElement>(null);
  const [highlightsImagePreview, setHighlightsImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "", description: "", highlights: "", category: "", subcategory: "", brand: "", modelNumber: "",
      availableSizes: "", availableColors: "", countryOfOrigin: "", price: 0, stock: 0, media: [],
      listingType: 'general', status: 'active', keyDetails: "", discountPercentage: undefined,
      weight: undefined, length: undefined, width: undefined, height: undefined,
    },
  });
  
  const setInitialValues = useCallback((product: Product | undefined) => {
    if (product) {
      form.reset({
        ...product,
        price: product.price || 0,
        stock: product.stock || 0,
        listingType: product.listingType || 'general',
        status: product.status || 'active',
        discountPercentage: product.discountPercentage ?? undefined,
        weight: product.weight ?? undefined,
        length: product.length ?? undefined,
        width: product.width ?? undefined,
        height: product.height ?? undefined,
      });
      setMedia(product.media || []);
      if(typeof product.highlightsImage === 'string') {
        setHighlightsImagePreview(product.highlightsImage);
      } else {
        setHighlightsImagePreview(product.highlightsImage?.preview || null);
      }
    } else {
      form.reset({
        name: "", description: "", highlights: "", category: "", subcategory: "", brand: "", modelNumber: "",
        availableSizes: "", availableColors: "", countryOfOrigin: "", price: 0, stock: 0, media: [],
        listingType: 'general', status: 'active', keyDetails: "", discountPercentage: undefined,
        weight: undefined, length: undefined, width: undefined, height: undefined,
      });
      setMedia([]);
      setHighlightsImagePreview(null);
    }
  }, [form]);

  useEffect(() => {
    setInitialValues(productToEdit);
  }, [productToEdit, setInitialValues]);

  const selectedCategory = form.watch("category");
  const subcategories = useMemo(() => {
      const category = defaultCategories.find(c => c.name === selectedCategory);
      return category?.subcategories || [];
  }, [selectedCategory]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;
      
      const newMediaItems = files.map(file => {
          return new Promise<{type: 'video' | 'image', file: File, url: string}>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                  resolve({ type, file, url: e.target?.result as string });
              };
              reader.readAsDataURL(file);
          });
      });

      Promise.all(newMediaItems).then(items => {
          setMedia(prev => [...prev, ...items]);
          form.setValue('media', [...media, ...items]);
      });
  };
  
  const handleHighlightsImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const result = reader.result as string;
              setHighlightsImagePreview(result);
              form.setValue('highlightsImage', { file, preview: result });
          };
          reader.readAsDataURL(file);
      }
  };

  const removeMedia = (index: number) => {
    const newMedia = media.filter((_, i) => i !== index);
    setMedia(newMedia);
    form.setValue('media', newMedia);
  };
  
  const processSubmit = async (data: z.infer<typeof productFormSchema>) => {
    if (!user) {
        toast({ variant: 'destructive', title: "Authentication Error", description: "You must be logged in to create a product." });
        return;
    }
    setIsLoading(true);

    try {
        const db = getFirestoreDb();
        const storage = getFirebaseStorage();

        const productData: any = { ...data, sellerId: user.uid, media: [] };
        
        const mediaUrls = await Promise.all(
            media.map(async (mediaFile) => {
                if (mediaFile.file) {
                    const filePath = `products/${user.uid}/${Date.now()}_${mediaFile.file.name}`;
                    const storageRef = ref(storage, filePath);
                    await uploadString(storageRef, mediaFile.url, 'data_url');
                    const downloadURL = await getDownloadURL(storageRef);
                    return { type: mediaFile.type, url: downloadURL };
                }
                return { type: mediaFile.type, url: mediaFile.url };
            })
        );
        productData.media = mediaUrls;
        
        if (data.highlightsImage && data.highlightsImage.file) {
             const highlightsImagePath = `products/${user.uid}/highlights_${Date.now()}_${data.highlightsImage.file.name}`;
             const storageRef = ref(storage, highlightsImagePath);
             await uploadString(storageRef, data.highlightsImage.preview, 'data_url');
             productData.highlightsImage = await getDownloadURL(storageRef);
        } else if (productToEdit?.highlightsImage) {
            productData.highlightsImage = productToEdit.highlightsImage;
        }

        if (productToEdit?.id) {
            const productRef = doc(db, "users", user.uid, "products", productToEdit.id);
            await setDoc(productRef, productData, { merge: true });
        } else {
            await addDoc(collection(db, "users", user.uid, "products"), productData);
        }

        onSave(productData as Product);
        toast({ title: productToEdit ? "Product Updated" : "Product Created", description: "Your product has been saved successfully." });
    } catch (error) {
        console.error("Error saving product: ", error);
        toast({ variant: 'destructive', title: "Save Failed", description: "There was an error saving your product." });
    } finally {
        setIsLoading(false);
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <ScrollArea className="h-[60vh]">
            <div className="space-y-6 py-4 px-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                              <SelectContent>{defaultCategories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                  )} />
                   <FormField control={form.control} name="subcategory" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Sub-category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedCategory}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select a sub-category" /></SelectTrigger></FormControl>
                              <SelectContent>{subcategories.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                          </Select>
                           <FormMessage />
                      </FormItem>
                  )} />
              </div>
              <FormField control={form.control} name="media" render={() => (
                <FormItem>
                  <FormLabel>Product Media</FormLabel>
                  <FormDescription>Add images or a video. The first item will be the main display media. Recommended size: 800x800 pixels. Max 5MB per file.</FormDescription>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {media.map((m, i) => (
                      <div key={i} className="relative aspect-square w-full rounded-md overflow-hidden group">
                        {m.type === 'image' ? <Image src={m.url} alt={`media ${i}`} fill sizes="100px" className="object-cover" /> : <video src={m.url} className="object-cover w-full h-full" />}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeMedia(i)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => imageInputRef.current?.click()}><ImageIcon className="mr-2 h-4 w-4" /> Add Images</Button>
                      <Button type="button" variant="outline" onClick={() => videoInputRef.current?.click()}><Video className="mr-2 h-4 w-4" /> Add Video</Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </ScrollArea>
        );
      case 2:
        return (
           <ScrollArea className="h-[60vh]">
            <div className="space-y-6 py-4 px-6">
                <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Selling Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="discountPercentage" render={({ field }) => (
                    <FormItem><FormLabel>Discount Percentage (Optional)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Creates a "sale" effect by showing a higher original price.</FormDescription><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="stock" render={({ field }) => (
                    <FormItem><FormLabel>Total Stock</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="availableSizes" render={({ field }) => (
                    <FormItem><FormLabel>Available Sizes (comma-separated)</FormLabel><FormControl><Input placeholder="e.g., S, M, L, XL" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="availableColors" render={({ field }) => (
                    <FormItem><FormLabel>Available Colors (comma-separated)</FormLabel><FormControl><Input placeholder="e.g., Red, Blue, Green" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
           </ScrollArea>
        );
       case 3:
        return (
           <ScrollArea className="h-[60vh]">
             <div className="space-y-6 py-4 px-6">
                   <h3 className="font-semibold text-lg border-b pb-2 pt-4">Shipping Details</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField control={form.control} name="weight" render={({ field }) => (
                            <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="length" render={({ field }) => (
                            <FormItem><FormLabel>Length (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="width" render={({ field }) => (
                            <FormItem><FormLabel>Width (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="height" render={({ field }) => (
                            <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                   </div>
                    <FormField control={form.control} name="keyDetails" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Internal Notes / Key Details</FormLabel>
                          <FormDescription>Private notes for delivery or invoice purposes. Not shown to customers.</FormDescription>
                          <FormControl><Textarea {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )} />
                   <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl><RadioGroupItem value="active" /></FormControl>
                                    <FormLabel className="font-normal">Active</FormLabel>
                                </FormItem>
                                 <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl><RadioGroupItem value="draft" /></FormControl>
                                    <FormLabel className="font-normal">Draft</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>
            </div>
           </ScrollArea>
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="flex flex-col h-full">
        {renderStepContent()}
        <input type="file" multiple accept="image/*" ref={imageInputRef} onChange={(e) => handleFileUpload(e, 'image')} className="hidden" />
        <input type="file" multiple accept="video/*" ref={videoInputRef} onChange={(e) => handleFileUpload(e, 'video')} className="hidden" />
        <div className="p-6 pt-4 border-t flex justify-between items-center mt-auto">
          <div>
              {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
              )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Step {step} of 3</span>
            {step < 3 ? (
                <Button type="button" onClick={() => setStep(step + 1)}>Next</Button>
            ) : (
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : productToEdit ? "Update Product" : "Create Product"}
                </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
