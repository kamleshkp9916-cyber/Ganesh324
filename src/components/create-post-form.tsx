
"use client";

import { Button } from "@/components/ui/button";
import { Video, MapPin, Smile, X, Image as ImageIcon, Loader2, Tag, FileEdit } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useAuth } from "@/hooks/use-auth.tsx";
import React, { useEffect, useState, forwardRef, useRef } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "./ui/popover";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseStorage, getFirestoreDb } from "@/lib/firebase";
import { ref as storageRef, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, doc, updateDoc } from "firebase/firestore";
import { getUserByDisplayName, UserData } from "@/lib/follow-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebounce } from "@/hooks/use-debounce";
import Image from "next/image";
import { Textarea } from "./ui/textarea";


export interface PostData {
    content: string;
    media: { type: 'video' | 'image', url: string }[] | null;
    location: string | null;
}
  
interface CreatePostFormProps {
  replyTo?: string | null;
  onClearReply?: () => void;
  postToEdit?: any | null;
  onFinishEditing?: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const emojis = [
    '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚',
    '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴',
    '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤',
    '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬',
    '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🤠', '🤡', '🥳', '🥴', '🥺', '🤥', '🤫', '🤭', '🧐', '🤓', '😈',
    '👿', '👹', '👺', '💀', '👻', '👽', '🤖', '💩', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👋', '🤚',
    '🖐️', '✋', '🖖', '👏', '🙌', '🙏', '🤝', '💪', '🦾', '🦵', '🦿', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴',
    '👀', '👁️', '👅', '👄', '❤️', '💔', '💕', '💖', '💗', '💓', '💞', '💝', '💟', '✨', '⭐', '🌟', '💫', '💥',
    '💯', '🔥', '🎉', '🎊', '🎁', '🎈',
];

export const CreatePostForm = forwardRef<HTMLDivElement, CreatePostFormProps>(({ replyTo, onClearReply, postToEdit, onFinishEditing, isSubmitting, setIsSubmitting }, ref) => {
    const { user, userData } = useAuth();
    const { toast } = useToast();
    const [content, setContent] = useState("");
    const [media, setMedia] = useState<{type: 'video' | 'image', file?: File, url: string}[]>([]);
    const [location, setLocation] = useState<string | null>(null);
    const [sellerProducts, setSellerProducts] = useState<any[]>([]);
    const [taggedProduct, setTaggedProduct] = useState<any | null>(null);
    
    // State for tagging suggestions
    const [tagging, setTagging] = useState<{type: '@' | '#', query: string, position: number} | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    const debouncedTagQuery = useDebounce(tagging?.query, 300);
    
    const imageInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const resetForm = () => {
        setContent("");
        setMedia([]);
        setLocation(null);
        setTaggedProduct(null);
        if (onClearReply) onClearReply();
        if (onFinishEditing) onFinishEditing();
        setIsSubmitting(false); 
    };
    
    useEffect(() => {
        if (postToEdit) {
            setContent(postToEdit.content || '');
            setMedia(postToEdit.images?.map((img: any) => ({ type: 'image', url: img.url })) || []);
            setLocation(postToEdit.location || null);
            setTaggedProduct(postToEdit.taggedProduct || null);
        } else if (replyTo) {
            setContent(`@${replyTo} `);
        } else {
             setContent("");
             setMedia([]);
             setLocation(null);
             setTaggedProduct(null);
        }
    }, [postToEdit, replyTo]);
    
    useEffect(() => {
        if (userData?.role === 'seller' || userData?.role === 'admin') {
            const productsKey = `sellerProducts_${userData.displayName}`;
            const storedProducts = localStorage.getItem(productsKey);
            if (storedProducts) {
                setSellerProducts(JSON.parse(storedProducts));
            }
        }
    }, [userData]);

    // Effect to fetch suggestions when tagging
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedTagQuery) {
                setSuggestions([]);
                return;
            }
            setIsSuggestionLoading(true);
            const db = getFirestoreDb();
            if (tagging?.type === '@') {
                const usersRef = collection(db, "users");
                const q = query(usersRef, 
                    where("displayName", ">=", debouncedTagQuery), 
                    where("displayName", "<=", debouncedTagQuery + '\uf8ff'),
                    limit(5)
                );
                const querySnapshot = await getDocs(q);
                setSuggestions(querySnapshot.docs.map(doc => doc.data() as UserData));
            } else if (tagging?.type === '#') {
                const existingHashtags = Array.from(content.matchAll(/#(\w+)/g)).map(match => match[1]);
                const uniqueHashtags = [...new Set(existingHashtags)];
                const filtered = uniqueHashtags.filter(tag => tag.toLowerCase().startsWith(debouncedTagQuery.toLowerCase()));
                setSuggestions(filtered.map(tag => ({name: tag})));
            }
            setIsSuggestionLoading(false);
        };
        
        if (tagging && tagging.query.length > 0) {
            fetchSuggestions();
        } else {
            setSuggestions([]);
        }
    }, [debouncedTagQuery, tagging, content]);

    // Effect for auto-resizing textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);
  
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setContent(value);
        
        const cursorPos = e.target.selectionStart || 0;
        const textBeforeCursor = value.substring(0, cursorPos);
        
        const atMatch = textBeforeCursor.match(/@(\w+)$/);
        const hashMatch = textBeforeCursor.match(/#(\w+)$/);

        if (atMatch) {
            setTagging({ type: '@', query: atMatch[1], position: cursorPos });
        } else if (hashMatch) {
            setTagging({ type: '#', query: hashMatch[1], position: cursorPos });
        } else {
            setTagging(null);
        }
    };
    
    const handleSuggestionClick = (suggestion: any) => {
        if (!tagging) return;
        const textBefore = content.substring(0, tagging.position - tagging.query.length - 1);
        const textAfter = content.substring(tagging.position);
        
        const tagName = tagging.type === '@' ? suggestion.displayName : suggestion.name;
        
        setContent(`${textBefore}${tagging.type}${tagName} ${textAfter}`);
        setTagging(null);
        setSuggestions([]);
    };

    const handlePost = async () => {
        if (!content.trim() || !user || !userData) return;

        setIsSubmitting(true);
        try {
            const db = getFirestoreDb();
            const tags = Array.from(content.matchAll(/#(\w+)/g)).map(match => match[1]);
            
            const postData: any = {
                content: content,
                location: location,
                tags: tags,
                taggedProduct: taggedProduct ? {
                    id: taggedProduct.id,
                    name: taggedProduct.name,
                    price: taggedProduct.price,
                    image: taggedProduct.images[0]?.preview,
                } : null,
            };

            const mediaUploads = await Promise.all(
                media.filter(m => m.file).map(async (mediaFile) => {
                    if (!mediaFile.file) return null;
                    const storage = getFirebaseStorage();
                    const filePath = `posts/${user.uid}/${Date.now()}_${mediaFile.file!.name}`;
                    const fileRef = storageRef(storage, filePath);
                    const uploadResult = await uploadString(fileRef, mediaFile.url, 'data_url');
                    const downloadURL = await getDownloadURL(uploadResult.ref);
                    return { type: mediaFile.type, url: downloadURL };
                })
            );
            
            const existingMedia = media.filter(m => !m.file).map(m => ({type: m.type, url: m.url}));
            const allMedia = [...existingMedia, ...mediaUploads.filter((m): m is { type: 'video' | 'image', url: string } => m !== null)];

            postData.images = allMedia.filter(m => m.type === 'image').map(m => ({ url: m.url, id: Date.now() + Math.random() }));

            if (postToEdit) {
                const postRef = doc(db, 'posts', postToEdit.id);
                postData.lastEditedAt = serverTimestamp();
                await updateDoc(postRef, postData);
                toast({ title: "Post Updated!", description: "Your changes have been saved." });
            } else {
                await addDoc(collection(db, "posts"), {
                    ...postData,
                    sellerId: user.uid,
                    sellerName: userData.displayName,
                    avatarUrl: userData.photoURL,
                    timestamp: serverTimestamp(),
                    likes: 0,
                    replies: 0,
                });
                
                toast({ title: "Post Created!", description: "Your post has been successfully shared." });
            }
            resetForm(); 

        } catch (error) {
            console.error("Error creating/updating post:", error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to save your post. Please try again."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image') => {
        const files = event.target.files;
        if (files) {
            if (media.length + files.length > 5) {
                toast({ variant: 'destructive', title: 'Upload Limit', description: 'You can only upload a maximum of 5 images.' });
                return;
            }

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.type.startsWith(type + '/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setMedia(prev => [...prev, { type, file, url: e.target?.result as string }]);
                    };
                    reader.readAsDataURL(file);
                } else {
                    toast({ variant: 'destructive', title: 'Invalid File', description: `Please select ${type} files.` });
                }
            }
        }
    };


    const handleGetLocation = () => {
        setLocation("New York, USA");
        toast({ title: 'Location added!' });
    };

    const addEmoji = (emoji: string) => {
        setContent(prev => prev + emoji);
    };

    const removeMedia = (index: number) => {
        setMedia(prev => prev.filter((_, i) => i !== index));
    }

    if (!user) {
        return null;
    }
    
    return (
        <div className="w-full bg-background/80 backdrop-blur-sm rounded-lg" ref={ref}>
            {postToEdit && (
                <div className="p-3">
                    <Alert variant="default">
                        <div className="flex items-start justify-between">
                             <div className="flex items-start gap-3">
                                 <FileEdit className="h-5 w-5 text-primary flex-shrink-0 mt-1"/>
                                <div>
                                    <AlertDescription>
                                        Editing post: <span className="italic text-foreground">"{postToEdit.content.substring(0, 50)}..."</span>
                                    </AlertDescription>
                                    {postToEdit.images && postToEdit.images.length > 0 && (
                                        <Image src={postToEdit.images[0].url} alt="Post preview" width={40} height={40} className="rounded-md mt-2" />
                                    )}
                                </div>
                             </div>
                             <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2 -mt-2 flex-shrink-0" onClick={onFinishEditing}>
                                 <X className="h-4 w-4"/>
                             </Button>
                        </div>
                    </Alert>
                </div>
            )}
             <div className="p-3">
                {replyTo && (
                    <Alert variant="default" className="mb-2">
                        <AlertDescription className="flex items-center justify-between">
                            Replying to @{replyTo}
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClearReply}>
                                <X className="h-4 w-4"/>
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
                {media.length > 0 && (
                     <div className="flex items-center gap-2 mb-2 overflow-x-auto no-scrollbar">
                        {media.map((item, index) => (
                             <div key={index} className="relative w-20 h-20 flex-shrink-0">
                                <Image
                                    src={item.url}
                                    alt="Preview"
                                    width={80}
                                    height={80}
                                    className="rounded-lg object-cover w-full h-full"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={() => removeMedia(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex items-start sm:items-center gap-3 mb-3">
                    <Avatar className="h-9 w-9 hidden sm:flex">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                        <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                     <Popover open={!!(tagging && tagging.query.length > 0)} onOpenChange={(open) => !open && setTagging(null)}>
                        <PopoverAnchor asChild>
                            <div className="relative flex-grow">
                                <Textarea 
                                    ref={textareaRef}
                                    placeholder="Share something..." 
                                    className="bg-muted rounded-2xl pl-4 pr-10 min-h-[44px] max-h-48 resize-none"
                                    value={content}
                                    onChange={handleContentChange}
                                    rows={1}
                                    maxLength={600}
                                />
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="absolute right-1 top-1.5 h-8 w-8 rounded-full">
                                            <Smile className="h-5 w-5 text-muted-foreground" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 h-64">
                                       <div className="grid grid-cols-8 gap-1 h-full overflow-y-auto no-scrollbar">
                                            {emojis.map((emoji, index) => (
                                                <Button key={index} variant="ghost" size="icon" onClick={() => addEmoji(emoji)}>
                                                    {emoji}
                                                </Button>
                                            ))}
                                       </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </PopoverAnchor>
                        <PopoverContent className="w-72 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                            {isSuggestionLoading ? (
                                <div className="p-4 text-center">Loading...</div>
                            ) : suggestions.length > 0 ? (
                                <ul className="space-y-1 p-2">
                                    {suggestions.map((item, index) => (
                                        <li key={item.uid || item.id || index} onClick={() => handleSuggestionClick(item)} className="p-2 hover:bg-accent rounded-md cursor-pointer text-sm">
                                            {tagging?.type === '@' ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6"><AvatarImage src={item.photoURL} /><AvatarFallback>{item.displayName.charAt(0)}</AvatarFallback></Avatar>
                                                    <span>{item.displayName}</span>
                                                </div>
                                            ) : (
                                                <span>#{item.name}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">No results found.</div>
                            )}
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex items-center flex-wrap gap-x-1 gap-y-2">
                    <input type="file" multiple accept="image/*" ref={imageInputRef} onChange={(e) => handleFileUpload(e, 'image')} className="hidden" />
                    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => imageInputRef.current?.click()} disabled={media.length >= 5}>
                        <ImageIcon className="mr-2 h-5 w-5" /> Image
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleGetLocation}>
                        <MapPin className="mr-2 h-5 w-5" /> Location
                    </Button>
                     {(userData?.role === 'seller' || userData?.role === 'admin') && sellerProducts.length > 0 && (
                        <Select onValueChange={(productId) => setTaggedProduct(sellerProducts.find(p => p.id === productId))} value={taggedProduct?.id}>
                             <SelectTrigger className="w-auto h-9 text-muted-foreground bg-transparent border-none focus:ring-0 text-sm">
                                <Tag className="mr-2 h-5 w-5" />
                                <SelectValue placeholder="Tag Product" />
                            </SelectTrigger>
                            <SelectContent>
                                {sellerProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                    <Button 
                        className="rounded-full font-bold px-6 bg-foreground text-background hover:bg-foreground/80 ml-auto"
                        onClick={handlePost} 
                        disabled={!content.trim() || isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        ) : postToEdit ? (
                            <FileEdit className="mr-2 h-4 w-4" />
                        ) : null}
                        {postToEdit ? 'Save Changes' : 'Send'}
                    </Button>
                </div>
            </div>
        </div>
    );
});
CreatePostForm.displayName = 'CreatePostForm';

    