
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, MapPin, Smile, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useAuth } from "@/hooks/use-auth.tsx";
import React, { useEffect, useState, forwardRef, useRef } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseStorage, getFirestoreDb } from "@/lib/firebase";
import { ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";


export interface PostData {
    content: string;
    media: { type: 'video' | 'image', url: string } | null;
    location: string | null;
}
  
interface CreatePostFormProps {
  replyTo?: string | null;
  onClearReply?: () => void;
  onCreatePost?: (data: PostData) => void; // Make optional, as we'll handle creation internally
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

export const CreatePostForm = forwardRef<HTMLDivElement, CreatePostFormProps>(({ replyTo, onClearReply, onCreatePost }, ref) => {
    const { user, userData } = useAuth();
    const { toast } = useToast();
    const [content, setContent] = useState("");
    const [media, setMedia] = useState<{type: 'video' | 'image', file: File, url: string} | null>(null);
    const [location, setLocation] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const videoInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (replyTo) {
            setContent(`@${replyTo} `);
        } else {
            setContent("");
        }
    }, [replyTo]);
  
    const handlePost = async () => {
        if (!content.trim() || !user || !userData) return;

        setIsSubmitting(true);
        try {
            let mediaUrl: string | null = null;
            let mediaType: 'image' | 'video' | null = null;
            
            if (media) {
                const storage = getFirebaseStorage();
                const filePath = `posts/${user.uid}/${Date.now()}_${media.file.name}`;
                const fileRef = storageRef(storage, filePath);
                const uploadTask = await uploadString(fileRef, media.url, 'data_url');
                mediaUrl = await getDownloadURL(uploadTask.ref);
                mediaType = media.type;
            }

            const db = getFirestoreDb();
            await addDoc(collection(db, "posts"), {
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
            });

            setContent("");
            setMedia(null);
            setLocation(null);
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
        // Simulate getting location
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
                <div className="flex items-start sm:items-center gap-3 mb-3">
                    <Avatar className="h-9 w-9 hidden sm:flex">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                        <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="relative flex-grow">
                        <Input 
                            placeholder="Share something..." 
                            className="bg-muted rounded-full pl-4 pr-10 h-11"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
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
