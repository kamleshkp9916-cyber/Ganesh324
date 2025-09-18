
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getFirestoreDb } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, increment } from 'firebase/firestore';
import { format, formatDistanceToNowStrict, isThisWeek, isThisYear } from 'date-fns';
import { X, MoreHorizontal, Edit, Trash2, Send, MessageSquare } from 'lucide-react';
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
    replies: CommentType[];
}


const mockCommentsData: CommentType[] = [
    { 
        id: '1', 
        authorName: 'Alice', 
        authorId: 'user1', 
        authorAvatar: 'https://placehold.co/40x40.png?text=A', 
        text: 'This is a great post! Thanks for sharing.', 
        timestamp: new Date(Date.now() - 5 * 60 * 1000), 
        isEdited: false,
        replies: [
            {
                id: '1-1',
                authorName: 'Bob',
                authorId: 'user2',
                authorAvatar: 'https://placehold.co/40x40.png?text=B',
                text: 'I totally agree! Very insightful.',
                timestamp: new Date(Date.now() - 4 * 60 * 1000),
                isEdited: false,
                replies: []
            }
        ]
    },
    { 
        id: '2', 
        authorName: 'Charlie', 
        authorId: 'user3', 
        authorAvatar: 'https://placehold.co/40x40.png?text=C', 
        text: 'Does anyone know where to find more information on this topic?', 
        timestamp: new Date(Date.now() - 1 * 60 * 1000), 
        isEdited: false,
        replies: []
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

const findCommentAndExec = (comments: CommentType[], commentId: string, action: (comment: CommentType, parent: CommentType[] | null, index: number) => void, parent: CommentType[] | null = null, index: number = -1): boolean => {
    for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        if (comment.id === commentId) {
            action(comment, comments, i);
            return true;
        }
        if (comment.replies && comment.replies.length > 0) {
            if (findCommentAndExec(comment.replies, commentId, action, comments, i)) {
                return true;
            }
        }
    }
    return false;
};

const Comment = ({ comment, onReply, onEdit, onDelete, level }: { comment: CommentType, onReply: (text: string, parentId: string) => void, onEdit: (id: string, text: string) => void, onDelete: (id: string) => void, level: number }) => {
    const { user } = useAuth();
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);
    const [showReplies, setShowReplies] = useState(true);

    const handleReplySubmit = () => {
        onReply(replyText, comment.id);
        setIsReplying(false);
        setReplyText("");
    };
    
    const handleEditSubmit = () => {
        onEdit(comment.id, editedText);
        setIsEditing(false);
    };

    return (
        <div className="flex items-start gap-3 group">
            <Avatar className="h-8 w-8">
                <AvatarImage src={comment.authorAvatar} />
                <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
                <div className="bg-muted p-2 rounded-lg">
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
                                        <DropdownMenuItem onSelect={() => { setIsEditing(true); setEditedText(comment.text); }}>
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
                                                    <AlertDialogAction onClick={() => onDelete(comment.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
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
                        <p className="text-sm">{comment.text}</p>
                    )}
                </div>
                 <div className="flex items-center gap-2 mt-1">
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => setIsReplying(!isReplying)}>
                        Reply
                    </Button>
                    {comment.replies.length > 0 && (
                        <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => setShowReplies(!showReplies)}>
                           {showReplies ? 'Hide' : 'View'} {comment.replies.length} replies
                        </Button>
                    )}
                </div>
                 {isReplying && (
                    <div className="mt-2 p-2 border rounded-lg bg-background">
                         <p className="text-xs text-muted-foreground mb-1">Replying to <span className="font-semibold">{comment.authorName}</span></p>
                        <Textarea 
                            placeholder="Write a reply..."
                            className="text-sm bg-transparent border-0 focus-visible:ring-0 p-0"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={2}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                             <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setIsReplying(false)}>Cancel</Button>
                            <Button size="sm" className="h-7 px-2" onClick={handleReplySubmit} disabled={!replyText.trim()}>Send</Button>
                        </div>
                    </div>
                )}
                {showReplies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4 pl-4 border-l-2">
                        {comment.replies.map(reply => (
                            <Comment key={reply.id} comment={reply} onReply={onReply} onEdit={onEdit} onDelete={onDelete} level={level + 1} />
                        ))}
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
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setComments(mockCommentsData);
            setIsLoading(false);
        }, 500);
    }, [post?.id]);

    const handlePostComment = (text: string, parentId: string | null = null) => {
        if (!text.trim() || !user || !userData) {
            toast({ variant: 'destructive', title: "Login Required", description: "You must be logged in to comment." });
            return;
        }

        const newCommentData: CommentType = {
            id: Date.now().toString(),
            authorName: userData.displayName,
            authorId: user.uid,
            authorAvatar: userData.photoURL,
            text: text.trim(),
            timestamp: new Date(),
            isEdited: false,
            replies: []
        };
        
        const newComments = structuredClone(comments);

        if (parentId) {
            let found = false;
            findCommentAndExec(newComments, parentId, (comment) => {
                comment.replies.unshift(newCommentData);
                found = true;
            });
             if (!found) {
                 toast({ variant: 'destructive', title: 'Error', description: 'Could not find parent comment to reply to.' });
                 return;
            }
        } else {
            newComments.unshift(newCommentData);
            setNewComment("");
        }
        
        setComments(newComments);
        toast({ title: "Comment Posted (Mock)" });
    };

    const handleEditComment = (commentId: string, newText: string) => {
        const newComments = structuredClone(comments);
        let found = false;
        findCommentAndExec(newComments, commentId, (comment) => {
             comment.text = newText;
             comment.isEdited = true;
             found = true;
        });

        if (found) {
            setComments(newComments);
            toast({ title: "Comment Updated (Mock)" });
        }
    };

    const handleDeleteComment = (commentId: string) => {
        const newComments = structuredClone(comments);
        let found = false;
        findCommentAndExec(newComments, commentId, (comment, parent, index) => {
            if (parent && index > -1) {
                parent.splice(index, 1);
                found = true;
            }
        });
        if(found){
             setComments(newComments);
             toast({ title: "Comment Deleted (Mock)" });
        }
    };

    return (
        <div className="flex flex-col h-full border-l bg-background">
            <div className="p-3 border-b flex items-center justify-between">
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
                           <Comment key={comment.id} comment={comment} onReply={handlePostComment} onEdit={handleEditComment} onDelete={handleDeleteComment} level={0} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
                        <MessageSquare className="w-10 h-10 mb-2" />
                        <h4 className="font-semibold">No comments yet</h4>
                        <p className="text-sm">Be the first one to comment.</p>
                    </div>
                )}
            </ScrollArea>
             <div className="p-4 border-t bg-background">
                <form onSubmit={(e) => { e.preventDefault(); handlePostComment(newComment); }} className="w-full flex items-center gap-2">
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
