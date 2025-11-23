
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Loader2, Upload, Trash2, Camera, FileEdit, Video, ImageIcon, PlusCircle, CheckCircle, AlertTriangle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { collection, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { defaultCategories } from "@/lib/categories";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { getFirestoreDb } from "@/lib/firebase-db";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

const variantSchema = z.object({
    id: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be positive."),
    stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
    image: z.any().optional(),
});

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
    price: number;
    discountPercentage?: number;
    stock: number;
    availableSizes?: string;
    availableColors?: string;
    variants: z.infer<typeof variantSchema>[];
    media: { type: 'video' | 'image', file?: File, url: string }[];
    status: 'active' | 'draft' | 'archived';
    listingType: 'general' | 'live-only';
    keyDetails?: string;
    keywords?: string;
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
  keywords: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  discountPercentage: z.coerce.number().optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  availableSizes: z.string().optional(),
  availableColors: z.string().optional(),
  media: z.array(z.any()).min(1, "At least one image or video is required."),
  variants: z.array(variantSchema).optional().default([]),
  listingType: z.enum(['general', 'live-only']),
  status: z.enum(['active', 'draft', 'archived']),
  keyDetails: z.string().optional().default(''),
  weight: z.coerce.number().optional(),
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
});


interface ProductFormProps {
    productToEdit?: Product | null;
    onSave: (product: Product) => void;
    onCancel: () => void;
}

const initialFormValues = {
  name: "", description: "", highlights: "", category: "", subcategory: "", brand: "", modelNumber: "", keywords: "",
  price: 0, stock: 0, media: [], variants: [],
  listingType: 'general' as 'general' | 'live-only', 
  status: 'active' as 'active' | 'draft' | 'archived', 
  keyDetails: "", discountPercentage: undefined,
  weight: undefined, length: undefined, width: undefined, height: undefined,
  availableSizes: "", availableColors: "",
};


export function ProductForm({ productToEdit, onSave, onCancel }: ProductFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [media, setMedia] = useState<{type: 'video' | 'image', file?: File, url: string}[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const highlightsImageInputRef = useRef<HTMLInputElement>(null);
  const [highlightsImagePreview, setHighlightsImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialFormValues,
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "variants",
  });
  
  useEffect(() => {
    if (productToEdit) {
      const productMedia = productToEdit.media || [];
      form.reset({
        ...initialFormValues, // Start with a clean slate
        ...productToEdit,
        media: productMedia,
        price: productToEdit.price || 0,
        stock: productToEdit.stock || 0,
        listingType: productToEdit.listingType || 'general',
        status: productToEdit.status || 'active',
        discountPercentage: productToEdit.discountPercentage ?? undefined,
        weight: productToEdit.weight ?? undefined,
        length: productToEdit.length ?? undefined,
        width: productToEdit.width ?? undefined,
        height: productToEdit.height ?? undefined,
        variants: productToEdit.variants || [],
        availableSizes: productToEdit.availableSizes || "",
        availableColors: productToEdit.availableColors || "",
        keywords: productToEdit.keywords || "",
      });
      setMedia(productMedia);
      if(typeof productToEdit.highlightsImage === 'string') {
        setHighlightsImagePreview(productToEdit.highlightsImage);
      } else {
        setHighlightsImagePreview(productToEdit.highlightsImage?.preview || null);
      }
    } else {
      form.reset(initialFormValues);
      setMedia([]);
      setHighlightsImagePreview(null);
    }
  }, [productToEdit, form]);

  const selectedCategory = form.watch("category");
  const subcategories = useMemo(() => {
      const category = defaultCategories.find(c => c.name === selectedCategory);
      return category?.subcategories || [];
  }, [selectedCategory]);

  const processSubmit = async (data: z.infer<typeof productFormSchema>) => {
    if (!user) {
      toast({ variant: 'destructive', title: "Not Authenticated", description: "You must be logged in to save a product." });
      return;
    }

    setIsSaving(true);
    setSaveProgress(10);
    
    try {
        const db = getFirestoreDb();
        const colRef = collection(db, 'users', user.uid, 'products');
        const docRef = productToEdit?.id ? doc(colRef, productToEdit.id) : doc(colRef);
        const productId = docRef.id;

        setSaveProgress(20);
        const storage = getStorage();

        const uploadedMediaUrls = await Promise.all(
            media.map(async (item) => {
                if (item.file && item.url.startsWith('data:')) {
                    const filePath = `products/${user.uid}/${productId}/${item.file.name}`;
                    const storageRef = ref(storage, filePath);
                    const uploadTask = uploadBytesResumable(storageRef, item.file);

                    return new Promise<string>((resolve, reject) => {
                        uploadTask.on('state_changed',
                            (snapshot) => {
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                // You might want a more granular progress update logic here
                            },
                            (error) => {
                                console.error("Upload failed:", error);
                                reject(error);
                            },
                            async () => {
                                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                                resolve(downloadURL);
                            }
                        );
                    });
                }
                return item.url;
            })
        );
        
        setSaveProgress(75);

        const finalMedia = media.map((item, index) => ({
            type: item.type,
            url: uploadedMediaUrls[index]
        }));
        
        const dataToSave: Omit<Product, 'id'> = {
            ...data,
            key: productId,
            media: finalMedia,
        };

        if (productToEdit) {
            await setDoc(docRef, { ...dataToSave, updatedAt: serverTimestamp() }, { merge: true });
        } else {
            await setDoc(docRef, { ...dataToSave, createdAt: serverTimestamp(), sold: 0 });
        }

        setSaveProgress(100);
        toast({
            title: productToEdit ? "Product Updated!" : "Product Created!",
            description: `${data.name} has been saved successfully.`
        });
        onSave(dataToSave as Product);

    } catch(e: any) {
        console.error("Save error:", e);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: e.message || "There was an error saving your product. Please check your connection and try again.",
        });
    } finally {
        setIsSaving(false);
        setSaveProgress(0);
    }
  };
  
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;
      
      const videoCount = media.filter(m => m.type === 'video').length;
      if (type === 'video' && (videoCount > 0 || files.length > 1)) {
           toast({ variant: 'destructive', title: 'Upload Limit', description: 'You can only upload one video.' });
          return;
      }
      
      if (media.length + files.length > 5) {
        toast({ variant: 'destructive', title: 'Upload Limit', description: 'You can only upload a maximum of 5 files (images/videos).' });
        return;
      }
      
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
          const updatedMedia = [...media, ...items];
          setMedia(updatedMedia);
          form.setValue('media', updatedMedia);
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
  
  const handleSaveAsDraft = () => {
    form.setValue('status', 'draft');
    form.handleSubmit(processSubmit)();
  };
    
    const handleReset = () => {
    form.reset(initialFormValues);
    setMedia([]);
    setHighlightsImagePreview(null);
    toast({ title: "Form Cleared", description: "You can start over." });
  };
    
    const handleNextStep = async () => {
        form.setValue('media', media);
        const fieldsToValidate: (keyof z.infer<typeof productFormSchema>)[] =
          step === 1 ? ['name', 'description', 'category', 'media'] : ['price', 'stock'];

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) {
            setStep(s => s + 1);
        } else {
             toast({
                variant: "destructive",
                title: "Incomplete Information",
                description: "Please fill out all required fields before proceeding.",
            });
        }
    }
  
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
                  <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem><FormLabel>Brand</FormLabel><FormControl><Input {...field} placeholder="e.g., Nike, Apple" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="modelNumber" render={({ field }) => (
                    <FormItem><FormLabel>Model Number / SKU</FormLabel><FormControl><Input {...field} placeholder="e.g., A2650" /></FormControl><FormMessage /></FormItem>
                  )} />
              </div>
               <FormField control={form.control} name="highlights" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Highlights</FormLabel>
                        <FormControl><Textarea placeholder="Feature 1\nFeature 2\nFeature 3" {...field} /></FormControl>
                        <FormDescription>Enter each highlight on a new line.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="highlightsImage" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Highlights Image (Optional)</FormLabel>
                        <FormControl>
                                <div className="w-full h-40 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted text-muted-foreground hover:border-primary hover:text-primary cursor-pointer relative" onClick={() => highlightsImageInputRef.current?.click()}>
                                {highlightsImagePreview ? (
                                    <Image src={highlightsImagePreview} alt="Highlights Preview" fill sizes="100vw" className="object-contain" />
                                ) : (
                                    <div className="text-center"><Camera className="h-8 w-8 mx-auto" /><p className="text-xs mt-1">Click to Upload (e.g., a size chart)</p></div>
                                )}
                                <input id="highlights-image-upload" type="file" ref={highlightsImageInputRef} className="hidden" accept="image/*" onChange={handleHighlightsImageUpload}/>
                            </div>
                        </FormControl>
                        <FormDescription>This image will be shown alongside product highlights.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
              <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                              <SelectContent>{defaultCategories.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                  )} />
                   <FormField control={form.control} name="subcategory" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Sub-category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategory}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select a sub-category" /></SelectTrigger></FormControl>
                              <SelectContent>{subcategories.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                          </Select>
                           <FormMessage />
                      </FormItem>
                  )} />
              </div>
               <FormField control={form.control} name="keywords" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Keywords</FormLabel>
                        <FormControl><Input placeholder="e.g., shirt, casual, blue" {...field} /></FormControl>
                        <FormDescription>Comma-separated keywords to improve searchability.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
              <FormField control={form.control} name="media" render={() => (
                <FormItem>
                  <FormLabel>Product Media</FormLabel>
                  <FormDescription>Add up to 5 files (1 video max). The first item is the main display media. Recommended: 800x800px.</FormDescription>
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
                      <Button type="button" variant="outline" onClick={() => videoInputRef.current?.click()} disabled={media.some(m => m.type === 'video')}><Video className="mr-2 h-4 w-4" /> Add Video</Button>
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Selling Price</FormLabel>
                        <FormControl><Input type="number" {...field} disabled={fields.length > 0} /></FormControl>
                         <FormDescription className="text-xs">Used if no variants are specified. Disabled when variants exist.</FormDescription>
                        <FormMessage />
                      </FormItem>
                  )}/>
                  <FormField control={form.control} name="stock" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Stock</FormLabel>
                        <FormControl><Input type="number" {...field} disabled={fields.length > 0} /></FormControl>
                         <FormDescription className="text-xs">Total stock if no variants exist. Disabled when variants exist.</FormDescription>
                        <FormMessage />
                      </FormItem>
                  )}/>
                </div>
                <FormField control={form.control} name="discountPercentage" render={({ field }) => (
                    <FormItem><FormLabel>Discount Percentage (Optional)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Creates a "sale" effect by showing a higher original price.</FormDescription><FormMessage /></FormItem>
                )}/>
                <Separator />
                 <h3 className="font-semibold text-lg">Simple Options</h3>
                 <FormDescription>For products where price and stock are the same for all options (e.g., different colors of the same bag). Use variants for more complex products.</FormDescription>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="availableSizes" render={({ field }) => (
                        <FormItem><FormLabel>Available Sizes</FormLabel><FormControl><Input placeholder="S, M, L, XL" {...field} /></FormControl><FormDescription className="text-xs">Comma-separated.</FormDescription><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="availableColors" render={({ field }) => (
                        <FormItem><FormLabel>Available Colors</FormLabel><FormControl><Input placeholder="Red, Blue, Green" {...field} /></FormControl><FormDescription className="text-xs">Comma-separated.</FormDescription><FormMessage /></FormItem>
                    )}/>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg">Product Variants</h3>
                  <FormDescription>
                    Use variants when different options (e.g., a Large, Red T-shirt) have a unique price, stock level, or image. This will override the simple options and default price/stock.
                  </FormDescription>
                </div>
                 <div className="space-y-4">
                    {fields.map((field, index) => (
                         <Card key={field.id} className="p-4 bg-muted/30">
                            <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-4 items-start">
                                 <div className="space-y-1">
                                    <Label>Variant Image</Label>
                                    <div className="relative w-20 h-20 rounded-md border-2 border-dashed bg-background flex items-center justify-center text-muted-foreground overflow-hidden">
                                        {fields[index]?.image?.preview ? (
                                            <Image src={fields[index].image.preview} alt="Variant preview" layout="fill" className="object-cover" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6"/>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = () => update(index, { ...fields[index], image: { file, preview: reader.result as string }});
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 flex-grow">
                                    <FormField control={form.control} name={`variants.${index}.size`} render={({ field: f }) => (
                                        <FormItem><FormLabel className="text-xs">Size</FormLabel><FormControl><Input placeholder="e.g., L" {...f} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`variants.${index}.color`} render={({ field: f }) => (
                                        <FormItem><FormLabel className="text-xs">Color</FormLabel><FormControl><Input placeholder="e.g., Blue" {...f} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`variants.${index}.price`} render={({ field: f }) => (
                                        <FormItem><FormLabel className="text-xs">Price (₹)</FormLabel><FormControl><Input type="number" {...f} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`variants.${index}.stock`} render={({ field: f }) => (
                                        <FormItem><FormLabel className="text-xs">Stock</FormLabel><FormControl><Input type="number" {...f} /></FormControl></FormItem>
                                    )} />
                                </div>
                            </div>
                             <div className="col-span-full flex justify-end mt-2">
                                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4 mr-2 text-destructive" />Remove Variant
                                </Button>
                            </div>
                        </Card>
                    ))}
                    <Button type="button" variant="outline" onClick={() => append({ size: "", color: "", price: 0, stock: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Add Variant
                    </Button>
                </div>
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
                            <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="length" render={({ field }) => (
                            <FormItem><FormLabel>Length (cm)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="width" render={({ field }) => (
                            <FormItem><FormLabel>Width (cm)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="height" render={({ field }) => (
                            <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
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
                        <FormLabel>Initial Status</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={(value) => field.onChange(value as 'active' | 'draft' | 'archived')} defaultValue={field.value} className="flex flex-col space-y-1">
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
        <input type="file" accept="video/*" ref={videoInputRef} onChange={(e) => handleFileUpload(e, 'video')} className="hidden" />
        <div className="p-6 pt-4 border-t flex justify-between items-center mt-auto">
          <div>
              {step === 1 && (
                  <Button type="button" variant="outline" onClick={handleReset} disabled={isSaving}>
                      <RotateCcw className="mr-2 h-4 w-4" /> Reset
                  </Button>
              )}
              {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)} disabled={isSaving}>Back</Button>
              )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Step {step} of 3</span>
            {step < 3 ? (
                <Button type="button" onClick={handleNextStep}>Next</Button>
            ) : (
                 <div className="flex items-center gap-2">
                    <Button type="button" variant="secondary" onClick={handleSaveAsDraft} disabled={isSaving}>Save as Draft</Button>
                    <div className="w-48">
                        {isSaving ? (
                            <div className="relative h-9 w-full">
                                <Progress value={saveProgress} className="h-full rounded-md" />
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-primary-foreground">
                                    {saveProgress < 100 ? `Saving... ${saveProgress}%` : <div className="flex items-center gap-1"><CheckCircle className="h-4 w-4"/> Saved!</div>}
                                </div>
                            </div>
                        ) : (
                            <Button type="submit" className="w-full">
                                {productToEdit ? "Update Product" : "Create Product"}
                            </Button>
                        )}
                    </div>
                </div>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}

    