
"use client";

import { Button } from "@/components/ui/button";
import { Video, MapPin, Smile, X, Image as ImageIcon, Loader2, Tag, FileEdit, ListPlus, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useAuth } from '@/hooks/use-auth';
import React, { useEffect, useState, forwardRef, useRef, useCallback } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "./ui/popover";
import { useToast } from "@/hooks/use-toast";
import { getFirestoreDb } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { UserData } from "@/lib/follow-data";
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


export interface PollOption {
  text: string;
}

export interface PostData {
    content: string;
    media: { type: 'video' | 'image', file?: File, url: string }[] | null;
    taggedProducts: any[] | null;
    pollOptions?: PollOption[] | null;
}
  
interface CreatePostFormProps {
  replyTo?: string | null;
  onClearReply?: () => void;
  postToEdit?: any | null;
  onFinishEditing: () => void;
  onPost: (data: PostData) => Promise<void>;
  isSubmitting: boolean;
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

export const CreatePostForm = forwardRef<HTMLDivElement, CreatePostFormProps>(({ replyTo, onClearReply, postToEdit, onFinishEditing, onPost, isSubmitting }, ref) => {
    const { user, userData } = useAuth();
    const { toast } = useToast();
    const [content, setContent] = useState("");
    const [media, setMedia] = useState<{type: 'video' | 'image', file?: File, url: string}[]>([]);
    const [sellerProducts, setSellerProducts] = useState<any[]>([]);
    const [taggedProducts, setTaggedProducts] = useState<any[]>([]);
    const [pollOptions, setPollOptions] = useState<PollOption[]>([]);
    const [showPollCreator, setShowPollCreator] = useState(false);
    
    // State for tagging suggestions
    const [tagging, setTagging] = useState<{type: '@' | '#', query: string, position: number} | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    const debouncedTagQuery = useDebounce(tagging?.query, 300);
    
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const resetForm = useCallback(() => {
        setContent("");
        setMedia([]);
        setTaggedProducts([]);
        setPollOptions([]);
        setShowPollCreator(false);
        if (onClearReply) onClearReply();
        if (onFinishEditing) onFinishEditing();
    }, [onClearReply, onFinishEditing]);
    
    useEffect(() => {
        if (postToEdit) {
            setContent(postToEdit.content || '');
            setMedia(postToEdit.images?.map((img: any) => ({ type: 'image', url: img.url })) || []);
            setTaggedProducts(postToEdit.taggedProducts || []);
            if (postToEdit.pollOptions && postToEdit.pollOptions.length > 0) {
                setPollOptions(postToEdit.pollOptions);
                setShowPollCreator(true);
            }
        } else {
             resetForm();
        }
    }, [postToEdit, resetForm]);
    
    useEffect(() => {
        if (userData?.role === 'seller' || userData?.role === 'admin') {
            const productsKey = `sellerProducts`;
            const storedProducts = localStorage.getItem(productsKey);
            if (storedProducts) {
                setSellerProducts(JSON.parse(storedProducts));
            }
        }
    }, [userData]);

    // ... (rest of the effects for tagging and textarea resize)

    const handlePollOptionChange = (index: number, text: string) => {
        setPollOptions(prev => {
            const newOptions = [...prev];
            newOptions[index] = { text };
            return newOptions;
        });
    };

    const addPollOption = () => {
        if (pollOptions.length < 4) {
            setPollOptions(prev => [...prev, { text: '' }]);
        }
    };

    const removePollOption = (index: number) => {
        setPollOptions(prev => prev.filter((_, i) => i !== index));
    };

    const togglePollCreator = () => {
        setShowPollCreator(prev => !prev);
        if (showPollCreator) {
            setPollOptions([]); // Clear options when hiding
        } else {
            setPollOptions([{ text: '' }, { text: '' }]); // Add two default options when showing
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const files = event.target.files;
        if (files) {
            if (media.length + files.length > 5) {
                toast({ variant: 'destructive', title: 'Upload Limit', description: 'You can only upload a maximum of 5 media files.' });
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
                    toast({ variant: 'destructive', title: 'Invalid File', description: `Please select ${'${type}'} files.` });
                }
            }
        }
    };

    const handleSubmit = async () => {
        const finalPollOptions = showPollCreator ? pollOptions.filter(o => o.text.trim()) : null;
        if (finalPollOptions && finalPollOptions.length < 2) {
            toast({ variant: 'destructive', title: 'Invalid Poll', description: 'A poll must have at least two options.' });
            return;
        }

        await onPost({ content, media, taggedProducts, pollOptions: finalPollOptions });
        resetForm();
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
            {/* ... (rest of the JSX for editing/replying state) */}
             <div className="p-3">
                 {/* ... (rest of the JSX for media previews) */}
                <div className="flex items-start sm:items-center gap-3 mb-3">
                    <Avatar className="h-9 w-9 hidden sm:flex">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                        <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    <Textarea 
                        ref={textareaRef}
                        placeholder="Share something..." 
                        className="bg-muted rounded-2xl pl-4 pr-10 min-h-[44px] max-h-48 resize-none"
                        value={content}
                        onChange={handleContentChange}
                        rows={1}
                        maxLength={600}
                    />
                </div>
                 {showPollCreator && (
                    <div className="space-y-2 mb-3">
                        {pollOptions.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input 
                                    placeholder={`Option ${index + 1}`} 
                                    value={option.text}
                                    onChange={(e) => handlePollOptionChange(index, e.target.value)}
                                    maxLength={50}
                                />
                                 {pollOptions.length > 2 && (
                                     <Button type="button" variant="ghost" size="icon" onClick={() => removePollOption(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                 )}
                            </div>
                        ))}
                         {pollOptions.length < 4 && (
                            <Button type="button" variant="outline" size="sm" onClick={addPollOption}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                            </Button>
                         )}
                    </div>
                )}
                <div className="flex items-center flex-wrap gap-x-1 gap-y-2">
                    <input type="file" multiple accept="image/*" ref={imageInputRef} onChange={(e) => handleFileUpload(e, 'image')} className="hidden" />
                    <input type="file" multiple accept="video/*" ref={videoInputRef} onChange={(e) => handleFileUpload(e, 'video')} className="hidden" />
                    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => imageInputRef.current?.click()} disabled={media.length >= 5}>
                        <ImageIcon className="mr-2 h-5 w-5" /> Image
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => videoInputRef.current?.click()} disabled={media.length >= 5}>
                        <Video className="mr-2 h-5 w-5" /> Video
                    </Button>
                     {(userData?.role === 'seller' || userData?.role === 'admin') && sellerProducts.length > 0 && (
                        <Select onValueChange={(productId) => {
                            const product = sellerProducts.find(p => p.id === productId);
                            if (product && !taggedProducts.some(p => p.id === productId)) {
                                setTaggedProducts(prev => [...prev, product]);
                            }
                        }}>
                             <SelectTrigger className="w-auto h-9 text-muted-foreground bg-transparent border-none focus:ring-0 text-sm">
                                <Tag className="mr-2 h-5 w-5" />
                                <SelectValue placeholder="Tag Product" />
                            </SelectTrigger>
                            <SelectContent>
                                {sellerProducts.filter(p => !taggedProducts.some(tp => tp.id === p.id)).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                     <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={togglePollCreator}>
                        <ListPlus className="mr-2 h-5 w-5" /> Poll
                    </Button>
                    <div className="flex items-center gap-2 flex-wrap">
                        {taggedProducts.map((p, index) => (
                             <Badge key={index} variant="secondary" className="gap-1.5">
                                {p.name}
                                <button onClick={() => setTaggedProducts(prev => prev.filter(tp => tp.id !== p.id))}>
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                    <Button 
                        className="rounded-full font-bold px-6 bg-foreground text-background hover:bg-foreground/80 ml-auto"
                        onClick={handleSubmit}
                        disabled={(!content.trim() && media.length === 0 && (!showPollCreator || pollOptions.filter(o => o.text.trim()).length < 2)) || (isSubmitting)}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {postToEdit && <FileEdit className="mr-2 h-4 w-4" />}
                        {postToEdit ? 'Save Changes' : 'Send'}
                    </Button>
                </div>
            </div>
        </div>
    );
});
CreatePostForm.displayName = 'CreatePostForm';
