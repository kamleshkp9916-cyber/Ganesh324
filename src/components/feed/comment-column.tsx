
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
    replyingTo?: string; // Add this field to indicate a reply
    replies?: CommentType[];
}

const mockCommentsData: CommentType[] = [
    { id: '1', authorName: 'Heart_beat', authorId: 'user1', authorAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop', text: 'An artist in every sense! Absolutely love his work.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), isEdited: false, likes: 255, replies: [
        { id: '2', authorName: 'Olivia55_12', authorId: 'user2', authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', text: 'He is a legend. One of my favorites!', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), isEdited: false, likes: 63, replyingTo: 'Heart_beat' },
        { id: '3', authorName: 'Receptionist77', authorId: 'user3', authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', text: "Each song in this album is a hit", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), isEdited: false, likes: 18, replyingTo: 'Heart_beat', replies: [
             { id: '4', authorName: 'Andrew', authorId: 'user4', authorAvatar: 'https://placehold.co/100x100/4caf50/ffffff?text=A', text: 'Totally agree with @Receptionist77!', timestamp: new Date(Date.now() - 90 * 60 * 1000), isEdited: false, likes: 5, replyingTo: 'Receptionist77' },
        ]},
    ]},
    { id: '5', authorName: 'Veronica', authorId: 'user1', authorAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop', text: 'This is another top level comment.', timestamp: new Date(Date.now() - 120 * 60 * 1000), isEdited: false, likes: 42, replies: [] },
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

const CommentThread = ({ comments, onReply, onEdit, onDelete, onLike, onReport, level = 0 }: { comments: CommentType[], onReply: (authorName: string, text: string, parentId: string) => void, onEdit: (id: string, text: string) => void, onDelete: (id: string) => void, onLike: (id: string) => void, onReport: (commentId: string) => void, level?: number }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editedText, setEditedText] = useState("");
    const [isReplying, setIsReplying] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});

    const handleEditSubmit = (commentId: string) => {
        onEdit(commentId, editedText);
        setIsEditing(null);
        setEditedText("");
    };

    const handleCopyLink = (commentId: string) => {
        navigator.clipboard.writeText(`${window.location.href}#comment-${commentId}`);
        toast({ title: "Link Copied!", description: "A link to this comment has been copied." });
    };
    
    const handlePostReply = (parentId: string) => {
        if (!replyText.trim()) return;
        const parentComment = findComment(comments, parentId);
        if (parentComment) {
            onReply(parentComment.authorName, replyText, parentId);
            setReplyText("");
            setIsReplying(null);
        }
    };
    
    const findComment = (comments: CommentType[], id: string): CommentType | null => {
        for (const comment of comments) {
            if (comment.id === id) return comment;
            if (comment.replies) {
                const found = findComment(comment.replies, id);
                if (found) return found;
            }
        }
        return null;
    }

    if (!comments || comments.length === 0) return null;

    return (
        <div className={cn("space-y-4", level > 0 && "pl-6")}>
            {comments.map((comment) => {
                const hasReplies = comment.replies && comment.replies.length > 0;
                const isThreadExpanded = expandedThreads[comment.id] || false;

                return (
                    <div key={comment.id} className="flex items-start gap-3 group relative">
                         {level > 0 && (
                            <div className="absolute left-[-1.125rem] top-12 bottom-0 w-0.5 bg-border"></div>
                        )}
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={comment.authorAvatar} />
                            <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow space-y-2">
                             <div className="flex items-center gap-2 text-sm">
                                <p className="font-semibold">{comment.authorName}</p>
                                <p className="text-muted-foreground"><RealtimeTimestamp date={comment.timestamp} isEdited={comment.isEdited} /></p>
                            </div>
                            <p className="text-sm mt-1 whitespace-pre-wrap">{comment.text}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <button onClick={() => onLike(comment.id)} className="flex items-center gap-1.5 hover:text-primary">
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>{comment.likes > 0 ? comment.likes : ''}</span>
                                </button>
                                <button onClick={() => setIsReplying(comment.id)} className="hover:text-primary">Reply</button>
                            </div>

                             {isReplying === comment.id && (
                                <div className="flex justify-center pt-2">
                                    <div className="w-[70%] space-y-2">
                                        <Textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder={`Replying to @${comment.authorName}...`}
                                            className="text-sm"
                                            rows={2}
                                            autoFocus
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setIsReplying(null)}>Cancel</Button>
                                            <Button size="sm" className="h-7 px-2" onClick={() => handlePostReply(comment.id)}>Reply</Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                             {hasReplies && !isThreadExpanded && (
                                <div className="flex items-center">
                                    <div className="w-8 border-t border-border"></div>
                                    <Button variant="link" size="sm" className="text-muted-foreground" onClick={() => setExpandedThreads(prev => ({...prev, [comment.id]: true}))}>
                                        View all {comment.replies!.length} replies
                                    </Button>
                                </div>
                            )}

                            {isThreadExpanded && (
                                <CommentThread
                                    comments={comment.replies!}
                                    onReply={onReply}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onLike={onLike}
                                    onReport={onReport}
                                    level={level + 1}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


export function CommentColumn({ post, onClose }: { post: any, onClose: () => void }) {
    const { user, userData } = useAuth();
    const { toast } = useToast();
    const [comments, setComments] = useState<CommentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const mainInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setComments(mockCommentsData);
            setIsLoading(false);
        }, 500);
    }, [post?.id]);
    
    const handleNewCommentSubmit = () => {
        if (!newComment.trim() || !user || !userData) return;

        const newCommentData: CommentType = {
            id: Date.now().toString(),
            authorName: userData.displayName,
            authorId: user.uid,
            authorAvatar: userData.photoURL || '',
            text: newComment,
            timestamp: new Date(),
            isEdited: false,
            likes: 0,
            replies: [],
        };
        setComments(prev => [newCommentData, ...prev]);
        setNewComment("");
    };
    
    const handleReply = (parentAuthor: string, replyText: string, parentId: string) => {
        if (!replyText.trim() || !user || !userData) return;

        const newReply: CommentType = {
            id: Date.now().toString(),
            authorName: userData.displayName,
            authorId: user.uid,
            authorAvatar: userData.photoURL || '',
            text: replyText,
            timestamp: new Date(),
            isEdited: false,
            likes: 0,
            replyingTo: parentAuthor,
        };

        const addReplyToComment = (comments: CommentType[], pId: string): CommentType[] => {
            return comments.map(comment => {
                if (comment.id === pId) {
                    return { ...comment, replies: [...(comment.replies || []), newReply] };
                }
                if (comment.replies) {
                    return { ...comment, replies: addReplyToComment(comment.replies, pId) };
                }
                return comment;
            });
        };
        
        setComments(prev => addReplyToComment(prev, parentId));
    };

    const handleEdit = (commentId: string, newText: string) => {
        const editComment = (comments: CommentType[]): CommentType[] => {
            return comments.map(c => {
                if (c.id === commentId) {
                    return { ...c, text: newText, isEdited: true };
                }
                if (c.replies) {
                    return { ...c, replies: editComment(c.replies) };
                }
                return c;
            })
        }
        setComments(prev => editComment(prev));
        toast({ title: "Comment Updated" });
    };

    const handleDelete = (commentId: string) => {
         const deleteComment = (comments: CommentType[]): CommentType[] => {
            return comments.reduce((acc, c) => {
                if (c.id === commentId) {
                    return acc; // Skip this comment
                }
                if (c.replies) {
                    c.replies = deleteComment(c.replies);
                }
                acc.push(c);
                return acc;
            }, [] as CommentType[]);
        }
        setComments(prev => deleteComment(prev));
        toast({ title: "Comment Deleted" });
    };
    
    const handleLike = (commentId: string) => {
         const likeComment = (comments: CommentType[]): CommentType[] => {
            return comments.map(c => {
                if (c.id === commentId) {
                    return { ...c, likes: c.likes + 1 };
                }
                if (c.replies) {
                    return { ...c, replies: likeComment(c.replies) };
                }
                return c;
            })
        }
        setComments(prev => likeComment(prev));
    };

    const handleReport = (commentId: string) => {
        toast({
            title: "Comment Reported",
            description: "Thank you for your feedback. Our moderators will review this comment.",
        });
    };

    return (
        <div className="flex flex-col h-full border-l bg-background">
            <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
                <h3 className="font-semibold text-lg">Comments ({post.replies || mockCommentsData.length})</h3>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <X className="h-5 w-5"/>
                </Button>
            </div>
            <ScrollArea className="flex-grow">
                 <div className="p-4">
                    {isLoading ? (
                        <div className="space-y-4">
                             <Skeleton className="h-16 w-full" />
                             <Skeleton className="h-16 w-full" />
                        </div>
                    ) : comments.length > 0 ? (
                        <CommentThread comments={comments} onReply={handleReply} onEdit={handleEdit} onDelete={handleDelete} onLike={handleLike} onReport={handleReport} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4 min-h-48">
                            <MessageSquare className="w-10 h-10 mb-2" />
                            <h4 className="font-semibold">No comments yet</h4>
                            <p className="text-sm">Be the first one to comment.</p>
                        </div>
                    )}
                 </div>
            </ScrollArea>
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
