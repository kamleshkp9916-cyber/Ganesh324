
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, MapPin, Folder, Globe, Smile } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useAuth } from "@/hooks/use-auth.tsx";
import React, { useEffect, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";

interface CreatePostFormProps {
  replyTo?: string | null;
  onClearReply?: () => void;
}

export function CreatePostForm({ replyTo, onClearReply }: CreatePostFormProps) {
    const { user } = useAuth();
    const [content, setContent] = useState("");

    useEffect(() => {
        if (replyTo) {
            setContent(`@${replyTo} `);
        }
    }, [replyTo]);
  
    const handlePost = () => {
        // Handle post submission logic
        console.log("Posting content:", content);
        setContent("");
        onClearReply?.();
    };

    if (!user) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
            <Card className="max-w-3xl mx-auto p-3 shadow-2xl rounded-2xl bg-background/80 backdrop-blur-sm border-border/50">
                <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-9 w-9">
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
                         <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full">
                            <Smile className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <Folder className="mr-2 h-5 w-5" /> File
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <ImageIcon className="mr-2 h-5 w-5" /> Image
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <MapPin className="mr-2 h-5 w-5" /> Location
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                    <Globe className="mr-2 h-5 w-5" /> Public
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Public</DropdownMenuItem>
                                <DropdownMenuItem>Friends</DropdownMenuItem>
                                <DropdownMenuItem>Only Me</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                     <Button 
                        className="rounded-full font-bold px-6 bg-foreground text-background hover:bg-foreground/80"
                        onClick={handlePost} 
                        disabled={!content.trim()}
                    >
                        Send
                    </Button>
                </div>
            </Card>
        </div>
    );
}
