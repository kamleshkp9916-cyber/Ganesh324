
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
import { useLocalStorage } from '@/hooks/use-local-storage';

interface CommentType {
    id: string;
    authorName: string;
    authorId: string;
    authorAvatar: string;
    text: string;
    timestamp: string; // Use ISO string for consistency with localStorage
    isEdited: boolean;
    likes: number;
    replyingTo?: string | null;
    parentId?: string | null;
}

const mockCommentsData: CommentType[] = [
    { id: '1', authorName: 'Heart_beat', authorId: 'user1', authorAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop', text: 'An artist in every sense! Absolutely love his work.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), isEdited: false, likes: 255, parentId: null, replyingTo: null },
    { id: '2', authorName: 'Olivia55_12', authorId: 'user2', authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', text: 'He is a legend. One of my favorites!', timestamp: new Date(Date.now() - 2.9 * 60 * 60 * 1000).toISOString(), isEdited: false, likes: 63, parentId: '1', replyingTo: 'Heart_beat' },
    { id: '3', authorName: 'Receptionist77', authorId: 'user3', authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', text: "Each song in this album is a hit", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isEdited: false, likes: 18, parentId: '1', replyingTo: 'Heart_beat' },
    { id: '4', authorName: 'Andrew', authorId: 'user4', authorAvatar: 'https://placehold.co/100x100/4caf50/ffffff?text=A', text: 'Totally agree!', timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), isEdited: false, likes: 5, parentId: '3', replyingTo: 'Receptionist77' },
    { id: '5', authorName: 'Veronica', authorId: 'user1', authorAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop', text: 'This is another top level comment.', timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), isEdited: false, likes: 42, parentId: null, replyingTo: null },
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

const Comment = ({ comment, allComments, onReply, onLike, onReport, onCopyLink, onEdit, onDelete }: {
    comment: CommentType,
    allComments: CommentType[],
    onReply: (parentId: string | null, text: string, replyingTo: string | null) => void,
    onLike: (id: string) => void,
    onReport: (id: string) => void,
    onCopyLink: (id: string) => void,
    onEdit: (id: string, text: string) => void,
    onDelete: (id: string) => void,
}) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');

    const replies = allComments.filter(c => c.parentId === comment.id);

    const handleEditSubmit = () => {
        onEdit(comment.id, editedText);
        setIsEditing(false);
    }

    const handleReplySubmit = () => {
        if (!replyText.trim()) return;
        onReply(comment.id, replyText, comment.authorName);
        setReplyText('');
        setIsReplying(false);
    };
    
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.authorAvatar} />
                    <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow space-y-1">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                        <p className="font-semibold break-all">{comment.authorName}</p>
                        <p className="text-muted-foreground flex-shrink-0"><RealtimeTimestamp date={comment.timestamp} isEdited={comment.isEdited} /></p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button><MoreHorizontal className="w-4 h-4" /></button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {user?.uid === comment.authorId ? (
                                    <>
                                        <DropdownMenuItem onSelect={() => { setIsEditing(true); setEditedText(comment.text); }}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem></AlertDialogTrigger>
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
                    {isEditing ? (
                        <div className="space-y-2">
                            <Textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} autoFocus rows={2} />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleEditSubmit}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm whitespace-pre-wrap break-words">
                            {comment.replyingTo && <span className="text-primary font-medium mr-1">@{comment.replyingTo}</span>}
                            {comment.text}
                        </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <button onClick={() => onLike(comment.id)} className="flex items-center gap-1.5 hover:text-primary">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{comment.likes > 0 ? comment.likes : ''}</span>
                        </button>
                        <button onClick={() => setIsReplying(prev => !prev)} className="hover:text-primary">Reply</button>
                    </div>
                </div>
            </div>
            
            {isReplying && (
                <div className="pl-12 w-[70%] mx-auto">
                    <div className="flex items-start gap-2">
                         <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.photoURL || undefined} />
                            <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="w-full space-y-2">
                            <Textarea 
                                placeholder={`Replying to @${comment.authorName}...`} 
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                autoFocus
                                rows={2}
                            />
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleReplySubmit} disabled={!replyText.trim()}>Reply</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {replies.length > 0 && (
                <div className="pl-12 w-[70%] mx-auto space-y-4">
                    {replies.map(reply => (
                        <Comment
                            key={reply.id}
                            comment={reply}
                            allComments={allComments}
                            onReply={onReply}
                            onLike={onLike}
                            onReport={onReport}
                            onCopyLink={onCopyLink}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export function CommentColumn({ post, onClose }: { post: any, onClose: () => void }) {
    const { user, userData } = useAuth();
    const { toast } = useToast();
    const [comments, setComments] = useLocalStorage<CommentType[]>(`comments_${post?.id}`, mockCommentsData);
    const [isLoading, setIsLoading] = useState(false);
    const [newCommentText, setNewCommentText] = useState("");

    const handleNewCommentSubmit = (text: string, parentId: string | null = null, replyingTo: string | null = null) => {
        if (!text.trim() || !user || !userData) return;

        const newCommentData: CommentType = {
            id: Date.now().toString(),
            authorName: userData.displayName,
            authorId: user.uid,
            authorAvatar: userData.photoURL || '',
            text: text,
            timestamp: new Date().toISOString(),
            isEdited: false,
            likes: 0,
            parentId: parentId,
            replyingTo: replyingTo,
        };
        setComments(prev => [...prev, newCommentData].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
        if (!parentId) {
            setNewCommentText("");
        }
    };
    
    const handleEdit = (commentId: string, newText: string) => {
        setComments(prev => prev.map(c => c.id === commentId ? {...c, text: newText, isEdited: true} : c));
        toast({ title: "Comment Updated" });
    };

    const handleDelete = (commentId: string) => {
        const commentIdsToDelete = new Set<string>();
        const queue = [commentId];
        commentIdsToDelete.add(commentId);
        
        while(queue.length > 0) {
            const currentId = queue.shift();
            comments.forEach(comment => {
                if (comment.parentId === currentId) {
                    commentIdsToDelete.add(comment.id);
                    queue.push(comment.id);
                }
            });
        }

        setComments(prev => prev.filter(c => !commentIdsToDelete.has(c.id)));
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

    const topLevelComments = comments.filter(comment => !comment.parentId);

    return (
        <div className="h-full flex flex-col bg-background/80 backdrop-blur-sm animate-in slide-in-from-bottom-full lg:slide-in-from-bottom-0 duration-500">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Comments ({post.replies || comments.length})</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                    <X />
                </Button>
            </div>
            <ScrollArea className="flex-grow">
                <div className="p-4 space-y-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : topLevelComments.length > 0 ? (
                        topLevelComments.map(comment => (
                            <Comment
                                key={comment.id}
                                comment={comment}
                                allComments={comments}
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
            <div className="p-4 border-t flex-shrink-0 bg-background">
                <form onSubmit={(e) => { e.preventDefault(); handleNewCommentSubmit(newCommentText); }} className="flex items-start gap-2">
                    <Avatar>
                        <AvatarImage src={user?.photoURL || undefined} />
                        <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Textarea 
                        placeholder="Add a comment..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        rows={1}
                        className="flex-grow resize-none"
                    />
                    <Button type="submit" disabled={!newCommentText.trim()}><Send className="w-4 h-4" /></Button>
                </form>
            </div>
        </div>
    )
}
