
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
    parentId: string | null;
    replies?: CommentType[];
}

const mockCommentsData: Omit<CommentType, 'replies'>[] = [
    { id: '1', authorName: 'Heart_beat', authorId: 'user1', authorAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop', text: 'An artist in every sense! Absolutely love his work.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), isEdited: false, likes: 255, parentId: null },
    { id: '2', authorName: 'Olivia55_12', authorId: 'user2', authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', text: 'He is a legend. One of my favorites!', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), isEdited: false, likes: 63, parentId: '1' },
    { id: '3', authorName: 'Receptionist77', authorId: 'user3', authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', text: "Each song in this album is a hit", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), isEdited: false, likes: 18, parentId: '1' },
    { id: '4', authorName: 'Andrew', authorId: 'user4', authorAvatar: 'https://placehold.co/100x100/4caf50/ffffff?text=A', text: 'Totally agree with @Receptionist77!', timestamp: new Date(Date.now() - 90 * 60 * 1000), isEdited: false, likes: 5, parentId: '3' },
    { id: '5', authorName: 'Veronica', authorId: 'user1', authorAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop', text: 'This is another top level comment.', timestamp: new Date(Date.now() - 120 * 60 * 1000), isEdited: false, likes: 42, parentId: null },
];

// Function to build the comment tree from a flat list
const buildCommentTree = (comments: Omit<CommentType, 'replies'>[]): CommentType[] => {
    const commentMap: { [key: string]: CommentType } = {};
    const rootComments: CommentType[] = [];

    comments.forEach(comment => {
        commentMap[comment.id] = { ...comment, replies: [] };
    });

    Object.values(commentMap).forEach(comment => {
        if (comment.parentId && commentMap[comment.parentId]) {
            commentMap[comment.parentId].replies!.push(comment);
        } else {
            rootComments.push(comment);
        }
    });

    return rootComments;
};


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

const CommentThread = ({ comment, onReply, onEdit, onDelete, onLike, onReport, level = 0 }: { comment: CommentType, onReply: (comment: CommentType) => void, onEdit: (id: string, text: string, parentId: string | null) => void, onDelete: (id: string) => void, onLike: (id: string) => void, onReport: (commentId: string) => void, level?: number }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState("");

    const handleEditSubmit = () => {
        onEdit(comment.id, editedText, comment.parentId);
        setIsEditing(false);
    };

    const handleReplySubmit = () => {
        onEdit(Date.now().toString(), replyText, comment.id); // This is a bit of a hack, we should have a proper addReply function
        setShowReplyBox(false);
        setReplyText("");
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.href}#comment-${comment.id}`);
        toast({ title: "Link Copied!", description: "A link to this comment has been copied." });
    }

    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
        <div className="flex items-start gap-3">
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
                    <p className="text-sm mt-1">{comment.text}</p>
                )}
                 <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <button onClick={() => onLike(comment.id)} className="flex items-center gap-1.5 hover:text-primary">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{comment.likes > 0 ? comment.likes : ''}</span>
                    </button>
                    <button onClick={() => setShowReplyBox(!showReplyBox)} className="hover:text-primary">Reply</button>
                </div>

                {showReplyBox && (
                     <div className="mt-3 flex items-start gap-2">
                        <Avatar className="h-8 w-8">
                           <AvatarImage src={user?.photoURL || ''} />
                           <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow space-y-2">
                            <Textarea 
                                placeholder={`Replying to ${comment.authorName}...`} 
                                className="text-sm" 
                                value={replyText} 
                                onChange={(e) => setReplyText(e.target.value)} 
                                rows={2}
                                autoFocus
                            />
                             <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setShowReplyBox(false)}>Cancel</Button>
                                <Button size="sm" className="h-7 px-2" onClick={handleReplySubmit} disabled={!replyText.trim()}>Reply</Button>
                            </div>
                        </div>
                    </div>
                )}
                
                {hasReplies && (
                    <div className="mt-3">
                         {isExpanded ? (
                             <div className="space-y-4 border-l-2 pl-4">
                                {comment.replies?.map(reply => (
                                    <CommentThread key={reply.id} comment={reply} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onLike={onLike} onReport={onReport} level={level + 1}/>
                                ))}
                            </div>
                         ) : (
                             <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setIsExpanded(true)}>
                                View all {comment.replies?.length} replies
                            </Button>
                         )}
                    </div>
                )}

            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {user?.uid === comment.authorId ? (
                        <>
                            <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                 <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
                                        <AlertDialogDescription>This will permanently delete your comment and all its replies.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDelete(comment.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <DropdownMenuSeparator />
                        </>
                    ) : null}
                     <DropdownMenuItem onSelect={handleCopyLink}>
                        <Link2 className="mr-2 h-4 w-4" />
                        Copy link
                    </DropdownMenuItem>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                <Flag className="mr-2 h-4 w-4" /> Report
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Report Comment?</AlertDialogTitle>
                                <AlertDialogDescription>This comment will be reported for review. This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onReport(comment.id)}>Report</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
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
            const commentTree = buildCommentTree(mockCommentsData);
            setComments(commentTree.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
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
            parentId: null,
        };
        setComments(prev => [newCommentData, ...prev]);
        setNewComment("");
    };

    const handleReplyClick = (commentToReply: CommentType) => {
        setNewComment(`@${commentToReply.authorName} `);
        mainInputRef.current?.focus();
    };
    
    const handleEdit = (commentId: string, newText: string) => {
        // Recursive function to find and update the comment
        const updateComment = (items: CommentType[]): CommentType[] => {
            return items.map(item => {
                if (item.id === commentId) {
                    return { ...item, text: newText, isEdited: true };
                }
                if (item.replies) {
                    return { ...item, replies: updateComment(item.replies) };
                }
                return item;
            });
        };
        setComments(prev => updateComment(prev));
        toast({ title: "Comment Updated" });
    };

    const handleDelete = (commentId: string) => {
        // Recursive function to find and remove the comment
         const removeComment = (items: CommentType[]): CommentType[] => {
            return items.filter(item => {
                if (item.id === commentId) return false;
                if (item.replies) {
                    item.replies = removeComment(item.replies);
                }
                return true;
            });
        };
        setComments(prev => removeComment(prev));
        toast({ title: "Comment Deleted" });
    };
    
    const handleLike = (commentId: string) => {
        const likeComment = (items: CommentType[]): CommentType[] => {
            return items.map(item => {
                if (item.id === commentId) {
                    return { ...item, likes: item.likes + 1 };
                }
                if (item.replies) {
                    return { ...item, replies: likeComment(item.replies) };
                }
                return item;
            });
        };
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
                        <div className="space-y-4">
                            {comments.map(comment => (
                               <CommentThread key={comment.id} comment={comment} onReply={handleReplyClick} onEdit={handleEdit} onDelete={handleDelete} onLike={handleLike} onReport={handleReport} />
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
