
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getFirestoreDb } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, increment } from 'firebase/firestore';
import { formatDistanceToNowStrict } from 'date-fns';
import { X, MoreHorizontal, Edit, Trash2, Send, MessageSquare, ThumbsUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
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
    replies?: CommentType[];
    replyingTo?: string;
}

const mockCommentsData: CommentType[] = [
    {
        id: '1',
        authorName: 'Veronica',
        authorId: 'user1',
        authorAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop',
        text: 'Lol you forgot overpower pulverize. It\'s top 2 on your list',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
        isEdited: false,
        likes: 255,
        replies: [
            {
                id: '2',
                authorName: 'Andrew',
                authorId: 'user2',
                authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
                text: 'In the druids favour is it was way more tanky',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
                isEdited: false,
                likes: 18,
                replyingTo: 'Veronica',
                replies: [
                    {
                        id: '3',
                        authorName: 'Halina B.',
                        authorId: 'user3',
                        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
                        text: "Don't see the barb build with link is where's the",
                        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h ago
                        isEdited: false,
                        likes: 0,
                        replyingTo: 'Andrew',
                        replies: [],
                    },
                     { id: '5', authorName: 'SoloLeveling', authorId: 'user4', authorAvatar: 'https://placehold.co/100x100/4caf50/ffffff?text=S', text: 'Another reply in the thread.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), isEdited: false, likes: 5, replies: [] },
                     { id: '6', authorName: 'Heart_beat', authorId: 'user1', authorAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop', text: 'Testing another reply.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), isEdited: false, likes: 2, replies: [] },
                     { id: '7', authorName: 'Motorro_', authorId: 'user2', authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', text: 'More discussion.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), isEdited: false, likes: 1, replyingTo: 'Heart_beat', replies: [] },
                     { id: '8', authorName: 'Fluffyfox32', authorId: 'user3', authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', text: 'Final thoughts.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), isEdited: false, likes: 0, replyingTo: 'Motorro_', replies: [] },
                ],
            },
        ],
    },
    {
        id: '4',
        authorName: 'Halina B.',
        authorId: 'user3',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        text: 'This is another top-level comment to demonstrate the structure. How is everyone doing?',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h ago
        isEdited: false,
        likes: 5,
        replies: [],
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
    const { user, userData } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isReplying && replyTextareaRef.current) {
            replyTextareaRef.current.focus();
        }
    }, [isReplying]);

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
            authorAvatar: userData.photoURL || '',
            text: replyText.trim(),
            timestamp: new Date(),
            isEdited: false,
            likes: 0,
            replyingTo: comment.authorName,
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
                        <Textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} className="text-sm" rows={2} autoFocus/>
                        <div className="flex gap-2">
                            <Button size="sm" className="h-7 px-2" onClick={handleEditSubmit}>Save</Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm mt-1">
                        {comment.replyingTo && <span className="text-primary font-medium mr-1">@{comment.replyingTo}</span>}
                        {comment.text}
                    </p>
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
                            <AvatarImage src={userData?.photoURL || ''} />
                            <AvatarFallback>{userData?.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow space-y-2">
                            <div className="relative">
                                <Textarea
                                    ref={replyTextareaRef}
                                    placeholder={`Replying to ${comment.authorName}...`}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="text-sm pr-12 min-h-[40px]"
                                    rows={1}
                                />
                                <Button size="icon" className="h-7 w-7 absolute right-2 bottom-2" onClick={handleReplySubmit} disabled={!replyText.trim()}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const CommentThread = ({ comment, onReply, onEdit, onDelete, onLike }: { comment: CommentType, onReply: (parentId: string, newReply: CommentType) => void, onEdit: (id: string, text: string) => void, onDelete: (id: string) => void, onLike: (id: string) => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasReplies = comment.replies && comment.replies.length > 0;
    
    // Show the first reply by default if it exists
    const firstReply = hasReplies ? comment.replies![0] : null;
    const remainingReplies = hasReplies ? comment.replies!.slice(1) : [];

    return (
        <div className="relative transition-opacity duration-300 ease-out">
             <Comment comment={comment} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onLike={onLike} />
             {hasReplies && (
                <div className="relative mt-4 pl-8">
                    <span className="absolute left-[26px] top-0 h-full w-px bg-muted-foreground/20" aria-hidden="true" />
                     <div className="space-y-4">
                        {firstReply && (
                            <CommentThread key={firstReply.id} comment={firstReply} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onLike={onLike} />
                        )}
                        
                        {remainingReplies.length > 0 && (
                            isExpanded ? (
                                remainingReplies.map(reply => (
                                    <CommentThread key={reply.id} comment={reply} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onLike={onLike} />
                                ))
                            ) : (
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs flex items-center gap-2" onClick={() => setIsExpanded(true)}>
                                    <ChevronDown className="w-3 h-3" />
                                    View all {comment.replies?.length} replies
                                </Button>
                            )
                        )}
                    </div>
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
    const [newComment, setNewComment] = useState("");
    const mainInputRef = useRef<HTMLTextAreaElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);


     useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setComments(mockCommentsData.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()));
            setIsLoading(false);
        }, 500);
    }, [post?.id]);

    useEffect(() => {
      const viewport = scrollAreaRef.current;
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    }, [comments]);
    
     const handleNewCommentSubmit = () => {
        if (!newComment.trim() || !user || !userData) return;
        const newTopLevelComment: CommentType = {
            id: Date.now().toString(),
            authorName: userData.displayName,
            authorId: user.uid,
            authorAvatar: userData.photoURL || '',
            text: newComment.trim(),
            timestamp: new Date(),
            isEdited: false,
            likes: 0,
            replies: [],
        };
        setComments(prev => [newTopLevelComment, ...prev]);
        setNewComment("");
    };

    const addReplyRecursive = (allComments: CommentType[], parentId: string, newReply: CommentType): CommentType[] => {
        return allComments.map(comment => {
            if (comment.id === parentId) {
                return { ...comment, replies: [...(comment.replies || []), newReply].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()) };
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
            <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
                <h3 className="font-semibold text-lg">Comments ({post.replies || 0})</h3>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <X className="h-5 w-5"/>
                </Button>
            </div>
            <div className="flex-grow relative overflow-hidden">
                <ScrollArea className="absolute inset-0" ref={scrollAreaRef}>
                     <div className="p-4">
                        {isLoading ? (
                            <div className="space-y-4">
                                 <Skeleton className="h-16 w-full" />
                                 <Skeleton className="h-16 w-full" />
                            </div>
                        ) : comments.length > 0 ? (
                            <div className="space-y-4">
                                {comments.map(comment => (
                                   <CommentThread key={comment.id} comment={comment} onReply={handleReply} onEdit={handleEdit} onDelete={handleDelete} onLike={handleLike} />
                                ))}
                            </div>
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
             <div className="p-4 border-t bg-background flex-shrink-0">
                <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={userData?.photoURL || ''} />
                        <AvatarFallback>{userData?.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                     <div className="flex-grow flex items-center gap-2">
                        <Textarea
                            ref={mainInputRef}
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="text-sm min-h-10"
                            rows={1}
                        />
                        <Button size="icon" className="h-10 w-10 flex-shrink-0" onClick={handleNewCommentSubmit} disabled={!newComment.trim()}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
