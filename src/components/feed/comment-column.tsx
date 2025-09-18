
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
    replies?: CommentType[];
}

const mockCommentsData: CommentType[] = [
    {
        id: '1',
        authorName: 'Heart_beat',
        authorId: 'user1',
        authorAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop',
        text: 'Lol you forgot overpower pulverize. It\'s top 2 on your list',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1h ago
        isEdited: false,
        likes: 2,
        replies: [
            {
                id: '2',
                authorName: 'Motorro_',
                authorId: 'user2',
                authorAvatar: 'https://placehold.co/100x100/f44336/ffffff?text=M',
                text: 'In the druids favour is it was way more tanky',
                timestamp: new Date(Date.now() - 44 * 60 * 1000), // 44m ago
                isEdited: false,
                likes: 1,
                replies: [
                    {
                        id: '3',
                        authorName: 'Fluffyfox32',
                        authorId: 'user3',
                        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
                        text: "Don't see the barb build with link is where's the",
                        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10m ago
                        isEdited: false,
                        likes: 0,
                        replies: [],
                    }
                ],
            },
        ],
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

const Comment = ({ comment, onReply, onEdit, onDelete, onLike }: { comment: CommentType, onReply: (parentId: string, newReply: CommentType) => void, onEdit: (id: string, text: string) => void, onDelete: (id: string) => void, onLike: (id: string) => void }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const { userData } = useAuth();

    const handleEditSubmit = () => {
        onEdit(comment.id, editedText);
        setIsEditing(false);
    };

    const handleReplySubmit = () => {
        if (!replyText.trim() || !user || !userData) return;
        const newReply: CommentType = {
            id: Date.now().toString(),
            authorName: userData.displayName,
            authorId: user.uid,
            authorAvatar: userData.photoURL,
            text: replyText.trim(),
            timestamp: new Date(),
            isEdited: false,
            likes: 0,
            replies: [],
        };
        onReply(comment.id, newReply);
        setIsReplying(false);
        setReplyText("");
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
                    <p className="text-sm mt-1">{comment.text}</p>
                )}
                 <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <button onClick={() => onLike(comment.id)} className="flex items-center gap-1.5 hover:text-primary">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{comment.likes > 0 ? comment.likes : ''}</span>
                    </button>
                    <button onClick={() => setIsReplying(prev => !prev)} className="hover:text-primary">Reply</button>
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
                
                 {isReplying && (
                    <div className="mt-4 flex items-start gap-3">
                         <Avatar className="h-8 w-8">
                            <AvatarImage src={userData?.photoURL} />
                            <AvatarFallback>{userData?.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow space-y-2">
                            <Textarea
                                placeholder={`Replying to ${comment.authorName}...`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="text-sm"
                                rows={2}
                                autoFocus
                            />
                             <div className="flex gap-2">
                                <Button size="sm" className="h-7 px-2" onClick={handleReplySubmit} disabled={!replyText.trim()}>Post</Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setIsReplying(false)}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const CommentThread = ({ comment, onReply, onEdit, onDelete, onLike }: { comment: CommentType, onReply: (parentId: string, newReply: CommentType) => void, onEdit: (id: string, text: string) => void, onDelete: (id: string) => void, onLike: (id: string) => void }) => {
    return (
        <div>
            <Comment comment={comment} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onLike={onLike} />
            {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 pl-6 border-l border-muted-foreground/20 space-y-6 mt-6">
                    {comment.replies.map(reply => (
                        <CommentThread key={reply.id} comment={reply} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onLike={onLike} />
                    ))}
                </div>
            )}
        </div>
    )
}

export function CommentColumn({ post, onClose }: { post: any, onClose: () => void }) {
    const { user, userData } = useAuth();
    const { toast } = useToast();
    const [comments, setComments] = useState<CommentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setComments(mockCommentsData.sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime()));
            setIsLoading(false);
        }, 500);
    }, [post?.id]);

    const addReplyRecursive = (allComments: CommentType[], parentId: string, newReply: CommentType): CommentType[] => {
        return allComments.map(comment => {
            if (comment.id === parentId) {
                return { ...comment, replies: [...(comment.replies || []), newReply] };
            }
            if (comment.replies) {
                return { ...comment, replies: addReplyRecursive(comment.replies, parentId, newReply) };
            }
            return comment;
        });
    };

    const editCommentRecursive = (allComments: CommentType[], commentId: string, newText: string): CommentType[] => {
        return allComments.map(comment => {
            if (comment.id === commentId) {
                return { ...comment, text: newText, isEdited: true };
            }
            if (comment.replies) {
                return { ...comment, replies: editCommentRecursive(comment.replies, commentId, newText) };
            }
            return comment;
        });
    };

     const deleteCommentRecursive = (allComments: CommentType[], commentId: string): CommentType[] => {
        return allComments.filter(c => c.id !== commentId).map(comment => {
            if (comment.replies) {
                return { ...comment, replies: deleteCommentRecursive(comment.replies, commentId) };
            }
            return comment;
        });
    };

    const likeCommentRecursive = (allComments: CommentType[], commentId: string): CommentType[] => {
         return allComments.map(comment => {
            if (comment.id === commentId) {
                return { ...comment, likes: comment.likes + 1 };
            }
            if (comment.replies) {
                return { ...comment, replies: likeCommentRecursive(comment.replies, commentId) };
            }
            return comment;
        });
    }

    const handleReply = (parentId: string, newReply: CommentType) => {
        setComments(prev => addReplyRecursive(prev, parentId, newReply));
    };

    const handleEdit = (commentId: string, newText: string) => {
        setComments(prev => editCommentRecursive(prev, commentId, newText));
        toast({ title: "Comment Updated" });
    };

    const handleDelete = (commentId: string) => {
        setComments(prev => deleteCommentRecursive(prev, commentId));
        toast({ title: "Comment Deleted" });
    };
    
    const handleLike = (commentId: string) => {
        setComments(prev => likeCommentRecursive(prev, commentId));
    };

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
                               <CommentThread key={comment.id} comment={comment} onReply={handleReply} onEdit={handleEdit} onDelete={handleDelete} onLike={handleLike} />
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
        </div>
    )
}
