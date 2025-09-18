
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getFirestoreDb } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, increment } from 'firebase/firestore';
import { format, formatDistanceToNowStrict, isThisWeek, isThisYear } from 'date-fns';
import { X, MoreHorizontal, Edit, Trash2, Send, MessageSquare, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CommentType {
    id: string;
    authorName: string;
    authorId: string;
    authorAvatar: string;
    text: string;
    timestamp: Date;
    isEdited: boolean;
    likes: number;
    replyingTo?: string; // e.g. "Heart_beat"
}


const mockCommentsData: CommentType[] = [
    {
        id: '1',
        authorName: 'Heart_beat',
        authorId: 'user1',
        authorAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop',
        text: 'An artist in every sense! Absolutely love his work.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        isEdited: false,
        likes: 255,
    },
    {
        id: '2',
        authorName: 'Olivia55_12',
        authorId: 'user2',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        text: 'He is a legend. One of my favorites!',
        timestamp: new Date(Date.now() - 21 * 60 * 1000),
        isEdited: false,
        likes: 63,
        replyingTo: 'Heart_beat',
    },
    {
        id: '3',
        authorName: 'Receptionist77',
        authorId: 'user3',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        text: 'Each song in this album is a hit',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        isEdited: false,
        likes: 102,
        replyingTo: 'Olivia55_12'
    },
];

export const RealtimeTimestamp = ({ date, isEdited }: { date: Date | string | Timestamp, isEdited?: boolean }) => {
    const [relativeTime, setRelativeTime] = useState('');

    const formatTimestamp = useCallback((d: Date | string | Timestamp): string => {
        let dateObj: Date;

        if (d instanceof Timestamp) {
            dateObj = d.toDate();
        } else if (d instanceof Date) {
            dateObj = d;
        } else {
            dateObj = new Date(d);
        }

        if (isNaN(dateObj.getTime())) return 'Invalid date';

        const now = new Date();
        const diffInSeconds = (now.getTime() - dateObj.getTime()) / 1000;
        if (diffInSeconds < 60) {
            return 'just now';
        }
        if (diffInSeconds < 60 * 60) {
             return `${Math.floor(diffInSeconds / 60)}m ago`;
        }
        if (diffInSeconds < 60 * 60 * 24) {
             return `${Math.floor(diffInSeconds / 3600)}h ago`;
        }
        if (isThisWeek(dateObj, { weekStartsOn: 1 })) {
            return format(dateObj, 'E'); // Mon, Tue
        }
        if (isThisYear(dateObj)) {
            return format(dateObj, 'MMM d'); // Sep 12
        }
        return format(dateObj, 'MMM d, yyyy'); // Sep 12, 2024
    }, []);

    useEffect(() => {
        setRelativeTime(formatTimestamp(date));
        
        const interval = setInterval(() => {
            setRelativeTime(formatTimestamp(date));
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [date, formatTimestamp]);

    return (
        <>
            {relativeTime}
            {isEdited && <span className="text-muted-foreground/80"> • Edited</span>}
        </>
    );
};


const Comment = ({ comment, onReply, onEdit, onDelete, onLike }: { comment: CommentType, onReply: (authorName: string) => void, onEdit: (id: string, text: string) => void, onDelete: (id: string) => void, onLike: (id: string) => void }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);

    const handleEditSubmit = () => {
        onEdit(comment.id, editedText);
        setIsEditing(false);
    };

    return (
        <div className="flex items-start gap-4 group">
            <Avatar className="h-10 w-10">
                <AvatarImage src={comment.authorAvatar} />
                <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
                <div className="flex items-center gap-2 text-sm">
                    <p className="font-semibold">{comment.authorName}</p>
                    <p className="text-muted-foreground"><RealtimeTimestamp date={comment.timestamp} isEdited={comment.isEdited} /></p>
                </div>
                 {isEditing ? (
                    <div className="mt-2 space-y-2">
                        <Textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} className="text-sm" rows={2}/>
                        <div className="flex gap-2">
                            <Button size="sm" className="h-7 px-2" onClick={handleEditSubmit}>Save</Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm mt-1">
                        {comment.replyingTo && <Button variant="link" className="text-primary p-0 h-auto mr-1">@{comment.replyingTo}</Button>}
                        {comment.text}
                    </p>
                )}
                 <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <button onClick={() => onLike(comment.id)} className="flex items-center gap-1.5 hover:text-primary">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{comment.likes}</span>
                    </button>
                    <button onClick={() => onReply(comment.authorName)} className="hover:text-primary">Reply</button>
                     {user?.uid === comment.authorId && (
                        <>
                            <button onClick={() => setIsEditing(true)} className="hover:text-primary">Edit</button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button className="text-destructive/80 hover:text-destructive">Delete</button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
                                        <AlertDialogDescription>This will permanently delete your comment.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDelete(comment.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};


export function CommentColumn({ post, onClose }: { post: any, onClose: () => void }) {
    const { user, userData } = useAuth();
    const { toast } = useToast();
    const [comments, setComments] = useState<CommentType[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

     useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setComments(mockCommentsData.sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime()));
            setIsLoading(false);
        }, 500);
    }, [post?.id]);

    const handlePostComment = () => {
        if (!newComment.trim() || !user || !userData) {
            toast({ variant: 'destructive', title: "Login Required", description: "You must be logged in to comment." });
            return;
        }
        
        let text = newComment.trim();
        if(replyingTo) {
            text = text.replace(`@${replyingTo} `, '');
        }

        const newCommentData: CommentType = {
            id: Date.now().toString(),
            authorName: userData.displayName,
            authorId: user.uid,
            authorAvatar: userData.photoURL,
            text: text,
            timestamp: new Date(),
            isEdited: false,
            likes: 0,
            replyingTo: replyingTo || undefined
        };
        
        setComments(prev => [...prev, newCommentData]);
        setNewComment("");
        setReplyingTo(null);
        toast({ title: "Comment Posted" });
    };

    const handleEditComment = (commentId: string, newText: string) => {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, text: newText, isEdited: true } : c));
        toast({ title: "Comment Updated" });
    };

    const handleDeleteComment = (commentId: string) => {
        setComments(prev => prev.filter(c => c.id !== commentId));
        toast({ title: "Comment Deleted" });
    };

    const handleLike = (commentId: string) => {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
    };

    const handleReplyClick = (authorName: string) => {
        setReplyingTo(authorName);
        setNewComment(`@${authorName} `);
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (replyingTo && !value.startsWith(`@${replyingTo} `)) {
            setReplyingTo(null);
        }
        setNewComment(value);
    }

    return (
        <div className="flex flex-col h-full border-l bg-background">
            <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-lg">Comments</h3>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 flex-shrink-0">
                    <X className="h-5 w-5"/>
                </Button>
            </div>
            <ScrollArea className="flex-1">
                 <div className="p-4">
                    {isLoading ? (
                        <div className="space-y-4">
                             <Skeleton className="h-16 w-full" />
                             <Skeleton className="h-16 w-full" />
                        </div>
                    ) : comments.length > 0 ? (
                        <div className="space-y-6">
                            {comments.map(comment => (
                               <Comment key={comment.id} comment={comment} onReply={handleReplyClick} onEdit={handleEditComment} onDelete={handleDeleteComment} onLike={handleLike} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
                            <MessageSquare className="w-10 h-10 mb-2" />
                            <h4 className="font-semibold">No comments yet</h4>
                            <p className="text-sm">Be the first one to comment.</p>
                        </div>
                    )}
                 </div>
            </ScrollArea>
             <div className="p-4 border-t bg-background">
                <form onSubmit={(e) => { e.preventDefault(); handlePostComment(); }} className="w-full flex items-center gap-2">
                    <Input 
                        placeholder={replyingTo ? `Replying to ${replyingTo}...` : "Add a comment..."}
                        value={newComment}
                        onChange={handleInputChange}
                    />
                    <Button type="submit" disabled={!newComment.trim()}><Send className="w-4 h-4" /></Button>
                </form>
            </div>
        </div>
    )
}
