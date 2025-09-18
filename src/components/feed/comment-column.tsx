
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getFirestoreDb } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, increment } from 'firebase/firestore';
import { formatDistanceToNowStrict } from 'date-fns';
import { X, MoreHorizontal, Edit, Trash2, Send, MessageSquare, ThumbsUp, ChevronDown, Flag, Link as Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface CommentType {
    id: string;
    authorName: string;
    authorId: string;
    authorAvatar: string;
    text: string;
    timestamp: Date;
    isEdited: boolean;
    likes: number;
    replyingTo?: string; // Author name of the parent comment
}

// Flattened data structure
const mockCommentsData: CommentType[] = [
    { id: '1', authorName: 'Heart_beat', authorId: 'user1', authorAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop', text: 'An artist in every sense! Absolutely love his work.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), isEdited: false, likes: 255 },
    { id: '2', authorName: 'Olivia55_12', authorId: 'user2', authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', text: 'He is a legend. One of my favorites!', timestamp: new Date(Date.now() - 2.9 * 60 * 60 * 1000), isEdited: false, likes: 63, replyingTo: 'Heart_beat' },
    { id: '3', authorName: 'Receptionist77', authorId: 'user3', authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', text: "Each song in this album is a hit", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), isEdited: false, likes: 18, replyingTo: 'Heart_beat'},
    { id: '4', authorName: 'Andrew', authorId: 'user4', authorAvatar: 'https://placehold.co/100x100/4caf50/ffffff?text=A', text: 'Totally agree!', timestamp: new Date(Date.now() - 90 * 60 * 1000), isEdited: false, likes: 5, replyingTo: 'Receptionist77' },
    { id: '5', authorName: 'Veronica', authorId: 'user1', authorAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop', text: 'This is another top level comment.', timestamp: new Date(Date.now() - 120 * 60 * 1000), isEdited: false, likes: 42 },
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
        
        return formatDistanceToNowStrict(dateObj, { addSuffix: true });
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

const Comment = ({ comment, onReply, onLike, onReport, onCopyLink, onEdit, onDelete }: { comment: CommentType, onReply: (authorName: string, replyText: string) => void, onLike: (id: string) => void, onReport: (id: string) => void, onCopyLink: (id: string) => void, onEdit: (id: string, text: string) => void, onDelete: (id: string) => void }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState('');

    const handleEditSubmit = () => {
        onEdit(comment.id, editedText);
        setIsEditing(false);
    }

    const handleReplySubmit = () => {
        if (!replyText.trim()) return;
        onReply(comment.authorName, replyText);
        setReplyText('');
        setShowReply(false);
    };
    
    return (
        <div className="flex items-start gap-3 group relative">
            <Avatar className="h-10 w-10">
                <AvatarImage src={comment.authorAvatar} />
                <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow space-y-2">
                <div className="flex items-center gap-2 text-sm">
                    <p className="font-semibold">{comment.authorName}</p>
                    <p className="text-muted-foreground"><RealtimeTimestamp date={comment.timestamp} isEdited={comment.isEdited} /></p>
                </div>
                 {isEditing ? (
                    <div className="space-y-2">
                        <Textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} autoFocus rows={2} />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleEditSubmit}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                        {comment.replyingTo && <strong className="text-primary mr-1">@{comment.replyingTo}</strong>}
                        {comment.text}
                    </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <button onClick={() => onLike(comment.id)} className="flex items-center gap-1.5 hover:text-primary">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{comment.likes > 0 ? comment.likes : ''}</span>
                    </button>
                    <button onClick={() => setShowReply(prev => !prev)} className="hover:text-primary">Reply</button>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {user?.uid === comment.authorId ? (
                                <>
                                    <DropdownMenuItem onSelect={() => { setIsEditing(true); setEditedText(comment.text); }}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Delete Comment?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(comment.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <DropdownMenuSeparator />
                                </>
                            ) : null}
                            <DropdownMenuItem onSelect={() => onCopyLink(comment.id)}><Link2 className="mr-2 h-4 w-4" />Copy link</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onReport(comment.id)}><Flag className="mr-2 h-4 w-4" />Report</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                 {showReply && (
                    <div className="flex justify-center pt-2">
                        <div className="w-[70%] space-y-2">
                            <Textarea 
                                placeholder={`Replying to @${comment.authorName}...`} 
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                autoFocus
                                rows={2}
                            />
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setShowReply(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleReplySubmit} disabled={!replyText.trim()}>Reply</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export function CommentColumn({ post, onClose }: { post: any, onClose: () => void }) {
    const { user, userData } = useAuth();
    const { toast } = useToast();
    const [comments, setComments] = useState<CommentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            // Sort by timestamp for chronological order
            const sortedComments = mockCommentsData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            setComments(sortedComments);
            setIsLoading(false);
        }, 500);
    }, [post?.id]);
    
    const handleNewCommentSubmit = (authorName: string, text: string) => {
        if (!text.trim() || !user || !userData) return;

        const newCommentData: CommentType = {
            id: Date.now().toString(),
            authorName: userData.displayName,
            authorId: user.uid,
            authorAvatar: userData.photoURL || '',
            text: text,
            timestamp: new Date(),
            isEdited: false,
            likes: 0,
            replyingTo: authorName,
        };
        setComments(prev => [...prev, newCommentData]);
    };
    
    const handleEdit = (commentId: string, newText: string) => {
        setComments(prev => prev.map(c => c.id === commentId ? {...c, text: newText, isEdited: true} : c));
        toast({ title: "Comment Updated" });
    };

    const handleDelete = (commentId: string) => {
        setComments(prev => prev.filter(c => c.id !== commentId));
        toast({ title: "Comment Deleted" });
    };
    
    const handleLike = (commentId: string) => {
        setComments(prev => prev.map(c => c.id === commentId ? {...c, likes: c.likes + 1} : c));
    };

    const handleReport = (commentId: string) => {
        toast({
            title: "Comment Reported",
            description: "Thank you for your feedback. Our moderators will review this comment.",
        });
    };
    
     const handleCopyLink = (commentId: string) => {
        navigator.clipboard.writeText(`${window.location.href}#comment-${commentId}`);
        toast({ title: "Link Copied!", description: "A link to this comment has been copied." });
    };

    return (
        <div className="flex flex-col h-full border-l bg-background">
            <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
                <h3 className="font-semibold text-lg">Comments ({post.replies || comments.length})</h3>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <X className="h-5 w-5"/>
                </Button>
            </div>
            <ScrollArea className="flex-grow">
                 <div className="p-4 space-y-6">
                    {isLoading ? (
                        <div className="space-y-4">
                             <Skeleton className="h-16 w-full" />
                             <Skeleton className="h-16 w-full" />
                        </div>
                    ) : comments.length > 0 ? (
                        comments.map(comment => (
                           <Comment
                                key={comment.id}
                                comment={comment}
                                onReply={handleNewCommentSubmit}
                                onLike={handleLike}
                                onReport={handleReport}
                                onCopyLink={handleCopyLink}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                           />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4 min-h-48">
                            <MessageSquare className="w-10 h-10 mb-2" />
                            <h4 className="font-semibold">No comments yet</h4>
                            <p className="text-sm">Be the first one to comment.</p>
                        </div>
                    )}
                 </div>
            </ScrollArea>
        </div>
    )
}
