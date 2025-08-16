
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus, Video, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useAuth } from "@/hooks/use-auth.tsx";
import React, { useEffect, useRef, useState } from "react";

interface CreatePostFormProps {
  formRef?: React.RefObject<HTMLDivElement>;
  replyTo?: string | null;
  onClearReply?: () => void;
}

export function CreatePostForm({ formRef, replyTo, onClearReply }: CreatePostFormProps) {
    const { user } = useAuth();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [content, setContent] = useState("");

    useEffect(() => {
        if (replyTo && textareaRef.current) {
            setContent(`Replying to @${replyTo} `);
            textareaRef.current.focus();
        }
    }, [replyTo]);
  
    const handlePost = () => {
        // Handle post submission logic
        console.log("Posting content:", content);
        setContent("");
        onClearReply?.();
    };

    return (
    <Card ref={formRef}>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            {user && (
                <Avatar>
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
            )}
            <CardTitle>{replyTo ? `Reply to @${replyTo}` : "Create a post"}</CardTitle>
            </div>
            {replyTo && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClearReply}>
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
      </CardHeader>
      <CardContent>
        <Textarea 
            ref={textareaRef}
            placeholder="What's on your mind?" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
        />
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2">
        <div className="flex justify-around">
            <Button variant="ghost" size="sm">
                <ImagePlus className="mr-2 h-4 w-4" /> Photo
            </Button>
            <Button variant="ghost" size="sm">
                <Video className="mr-2 h-4 w-4" /> Video
            </Button>
        </div>
        <Button className="w-full" onClick={handlePost} disabled={!content.trim()}>Post</Button>
      </CardFooter>
    </Card>
  );
}
