
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getFirestoreDb } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, increment } from 'firebase/firestore';
import { format, formatDistanceToNowStrict, isThisWeek, isThisYear } from 'date-fns';
import { X, MoreHorizontal, Edit, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

const mockCommentsData = [
    { id: '1', authorName: 'Alice', authorId: 'user1', authorAvatar: 'https://placehold.co/40x40.png?text=A', text: 'This is a great post! Thanks for sharing.', timestamp: new Date(Date.now() - 5 * 60 * 1000), isEdited: false },
    { id: '2', authorName: 'Bob', authorId: 'user2', authorAvatar: 'https://placehold.co/40x40.png?text=B', text: 'I agree with Alice. Super insightful!', timestamp: new Date(Date.now() - 3 * 60 * 1000), isEdited: true },
    { id: '3', authorName: 'Charlie', authorId: 'user3', authorAvatar: 'https://placehold.co/40x40.png?text=C', text: 'Does anyone know where to find more information on this topic?', timestamp: new Date(Date.now() - 1 * 60 * 1000), isEdited: false },
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
             return `${Math.floor(diffInSeconds / 60)}m`;
        }
        if (diffInSeconds < 60 * 60 * 24) {
             return `${Math.floor(diffInSeconds / 3600)}h`;
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


export function CommentColumn({ post, onClose }: { post: any, onClose: () => void }) {
    const { user, userData } = useAuth();
    const { toast } = useToast();
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState("");

    useEffect(() => {
        // Use mock data instead of Firestore
        setIsLoading(true);
        setTimeout(() => {
            setComments(mockCommentsData);
            setIsLoading(false);
        }, 500);
    }, [post?.id]);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !userData || !post?.id) return;
        
        const newCommentData = {
            id: Date.now().toString(),
            authorName: userData.displayName,
            authorId: user.uid,
            authorAvatar: userData.photoURL,
            text: newComment.trim(),
            timestamp: new Date(),
            isEdited: false,
        };

        setComments(prev => [...prev, newCommentData]);
        setNewComment("");
        toast({ title: "Comment Posted (Mock)" });
    };

    const handleSaveEdit = async () => {
        if (!editedContent.trim() || !editingCommentId || !post?.id) return;

        setComments(prev => prev.map(c => 
            c.id === editingCommentId 
            ? { ...c, text: editedContent, isEdited: true }
            : c
        ));
        
        toast({title: "Comment Updated (Mock)"});
        setEditingCommentId(null);
        setEditedContent("");
    };

    const handleEditComment = (comment: any) => {
        setEditingCommentId(comment.id);
        setEditedContent(comment.text);
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!post?.id) return;
        setComments(prev => prev.filter(c => c.id !== commentId));
        toast({title: "Comment Deleted (Mock)"});
    };

    return (
        <div className="flex flex-col h-full border-l bg-background">
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex-grow overflow-hidden">
                    <h3 className="font-semibold">Comments on</h3>
                    <p className="text-sm text-muted-foreground truncate max-w-xs">"{post.content.substring(0, 50)}..."</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 flex-shrink-0">
                    <X className="h-5 w-5"/>
                </Button>
            </div>
            <ScrollArea className="flex-1 px-4">
                {isLoading ? (
                    <div className="space-y-4 py-4">
                         <Skeleton className="h-10 w-full" />
                         <Skeleton className="h-10 w-full" />
                    </div>
                ) : comments.length > 0 ? (
                    <div className="space-y-4 py-4">
                        {comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-3 group">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.authorAvatar} />
                                    <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow bg-muted p-2 rounded-lg">
                                    <div className="flex justify-between items-center text-xs">
                                        <p className="font-semibold">{comment.authorName}</p>
                                         <div className="flex items-center gap-2">
                                            {comment.timestamp && <p className="text-muted-foreground"><RealtimeTimestamp date={comment.timestamp} isEdited={comment.isEdited} /></p>}
                                            {user?.uid === comment.authorId && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => handleEditComment(comment)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                 <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
                                                                    <AlertDialogDescription>This will permanently delete your comment.</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteComment(comment.id)}>Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </div>
                                    {editingCommentId === comment.id ? (
                                        <div className="mt-2 space-y-2">
                                            <Input value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="h-8 text-sm" />
                                            <div className="flex gap-2">
                                                <Button size="sm" className="h-6" onClick={handleSaveEdit}>Save</Button>
                                                <Button size="sm" variant="ghost" className="h-6" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm">{comment.text}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to reply!</p>
                )}
            </ScrollArea>
             <div className="p-4 border-t bg-background">
                <form onSubmit={handlePostComment} className="w-full flex items-center gap-2">
                    <Input 
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button type="submit" disabled={!newComment.trim()}><Send className="w-4 h-4" /></Button>
                </form>
            </div>
        </div>
    )
}
