
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, MapPin, Smile, X, Image as ImageIcon, Loader2, Tag } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useAuth } from "@/hooks/use-auth.tsx";
import React, { useEffect, useState, forwardRef, useRef } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "./ui/popover";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseStorage, getFirestoreDb } from "@/lib/firebase";
import { ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";
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


export interface PostData {
    content: string;
    media: { type: 'video' | 'image', url: string } | null;
    location: string | null;
}
  
interface CreatePostFormProps {
  replyTo?: string | null;
  onClearReply?: () => void;
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

export const CreatePostForm = forwardRef<HTMLDivElement, CreatePostFormProps>(({ replyTo, onClearReply }, ref) => {
    const { user, userData } = useAuth();
    const { toast } = useToast();
    const [content, setContent] = useState("");
    const [media, setMedia] = useState<{type: 'video' | 'image', file: File, url: string} | null>(null);
    const [location, setLocation] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sellerProducts, setSellerProducts] = useState<any[]>([]);
    const [taggedProduct, setTaggedProduct] = useState<any | null>(null);
    
    // State for tagging suggestions
    const [tagging, setTagging] = useState<{type: '@' | '#', query: string, position: number} | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    const debouncedTagQuery = useDebounce(tagging?.query, 300);
    
    const videoInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (replyTo) {
            setContent(`@${replyTo} `);
        } else {
            setContent("");
        }
    }, [replyTo]);
    
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
                const filteredProducts = sellerProducts.filter(p => p.name.toLowerCase().includes(debouncedTagQuery.toLowerCase()));
                setSuggestions(filteredProducts.slice(0, 5));
            }
            setIsSuggestionLoading(false);
        };
        
        if (tagging && tagging.query.length > 0) {
            fetchSuggestions();
        } else {
            setSuggestions([]);
        }
    }, [debouncedTagQuery, tagging, sellerProducts]);
  
    const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            let mediaUrl: string | null = null;
            let mediaType: 'image' | 'video' | null = null;
            
            if (media) {
                const storage = getFirebaseStorage();
                const filePath = `posts/${user.uid}/${Date.now()}_${media.file.name}`;
                const fileRef = storageRef(storage, filePath);
                const uploadResult = await uploadString(fileRef, media.url, 'data_url');
                mediaUrl = await getDownloadURL(uploadResult.ref);
                mediaType = media.type;
            }

            const tags = content.match(/@\w+/g)?.map(tag => tag.substring(1)) || [];
            
            const postDocRef = await addDoc(collection(db, "posts"), {
                sellerId: user.uid,
                sellerName: userData.displayName,
                avatarUrl: userData.photoURL,
                timestamp: serverTimestamp(),
                content: content,
                mediaUrl: mediaUrl,
                mediaType: mediaType,
                location: location,
                likes: 0,
                replies: 0,
                tags: tags,
                taggedProduct: taggedProduct ? {
                    id: taggedProduct.id,
                    name: taggedProduct.name,
                    price: taggedProduct.price,
                    image: taggedProduct.images[0]?.preview,
                } : null,
            });

            for (const tagName of tags) {
                const taggedUser = await getUserByDisplayName(tagName);
                if (taggedUser && taggedUser.uid !== user.uid) {
                    await addDoc(collection(db, `users/${taggedUser.uid}/notifications`), {
                        type: 'tag',
                        message: `${userData.displayName} tagged you in a post.`,
                        postId: postDocRef.id,
                        read: false,
                        timestamp: serverTimestamp(),
                        fromUser: {
                            uid: user.uid,
                            displayName: userData.displayName,
                            photoURL: userData.photoURL
                        }
                    });
                }
            }


            setContent("");
            setMedia(null);
            setLocation(null);
            setTaggedProduct(null);
            onClearReply?.();
            toast({
                title: "Post Created!",
                description: "Your post has been successfully shared.",
            });

        } catch (error) {
            console.error("Error creating post:", error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to create your post. Please try again."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type.startsWith(type + '/')) {
                 const reader = new FileReader();
                 reader.onload = (e) => {
                     setMedia({ type, file, url: e.target?.result as string });
                     toast({ title: `${type === 'image' ? 'Image' : 'Video'} attached!` });
                 };
                 reader.readAsDataURL(file);
            } else {
                toast({ variant: 'destructive', title: 'Invalid File', description: `Please select a ${type} file.` });
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

    if (!user) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-4 z-50" ref={ref}>
            <Card className="max-w-3xl mx-auto p-3 shadow-2xl rounded-2xl bg-background/80 backdrop-blur-sm border-border/50">
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
                {media && (
                    <div className="relative mb-2 w-fit">
                        <Image
                            src={media.url}
                            alt="Preview"
                            width={100}
                            height={100}
                            className="rounded-lg object-contain max-h-28 w-auto"
                        />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={() => setMedia(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
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
                                <Input 
                                    placeholder="Share something..." 
                                    className="bg-muted rounded-full pl-4 pr-10 h-11"
                                    value={content}
                                    onChange={handleContentChange}
                                />
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full">
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
                                    {suggestions.map((item) => (
                                        <li key={item.uid || item.id} onClick={() => handleSuggestionClick(item)} className="p-2 hover:bg-accent rounded-md cursor-pointer text-sm">
                                            {tagging?.type === '@' ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6"><AvatarImage src={item.photoURL} /><AvatarFallback>{item.displayName.charAt(0)}</AvatarFallback></Avatar>
                                                    <span>{item.displayName}</span>
                                                </div>
                                            ) : (
                                                <span>{item.name}</span>
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
                    <input type="file" accept="video/*" ref={videoInputRef} onChange={(e) => handleFileUpload(e, 'video')} className="hidden" />
                    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => videoInputRef.current?.click()}>
                        <Video className="mr-2 h-5 w-5" /> Video
                    </Button>
                    <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => handleFileUpload(e, 'image')} className="hidden" />
                    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => imageInputRef.current?.click()}>
                        <ImageIcon className="mr-2 h-5 w-5" /> Image
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleGetLocation}>
                        <MapPin className="mr-2 h-5 w-5" /> Location
                    </Button>
                     {(userData?.role === 'seller' || userData?.role === 'admin') && sellerProducts.length > 0 && (
                        <Select onValueChange={(productId) => setTaggedProduct(sellerProducts.find(p => p.id === productId))}>
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
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Send
                    </Button>
                </div>
            </Card>
        </div>
    );
});
CreatePostForm.displayName = 'CreatePostForm';
