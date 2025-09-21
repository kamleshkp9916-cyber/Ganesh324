
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getFirestoreDb } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  increment,
  runTransaction,
} from 'firebase/firestore';
import { X, MoreHorizontal, Edit, Trash2, Send, MessageSquare, ThumbsUp, ChevronDown, Flag, Link as Link2, Loader2, Smile, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { RealtimeTimestamp } from '@/components/feed/realtime-timestamp';


interface CommentType {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: Timestamp;
  isEdited?: boolean;
  likes?: number;
  likedBy?: string[];
  parentId?: string | null;
  replyCount?: number;
}

const CommentSkeleton = () => (
    <div className="flex items-start gap-3 w-full">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-grow space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    </div>
);

const Comment = ({ comment, replies, onReply, onLike, onReport, onCopyLink, onEdit, onDelete, postId }: {
    comment: CommentType,
    replies: CommentType[],
    onReply: (text: string, parentId: string | null, replyingTo: string) => void,
    onLike: (id: string) => void,
    onReport: (id: string) => void,
    onCopyLink: (id: string) => void,
    onEdit: (id: string, text: string) => void,
    onDelete: (id: string, parentId: string | null) => void,
    postId: string;
}) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [showReplies, setShowReplies] = useState(false);
    const hasLiked = user && comment.likedBy ? comment.likedBy.includes(user.uid) : false;

    const handleEditSubmit = () => {
        if (!editedText.trim() || editedText === comment.text) {
            setIsEditing(false);
            return;
        }
        onEdit(comment.id, editedText);
        setIsEditing(false);
    }

    const handleReplySubmit = () => {
        if (!replyText.trim()) return;
        onReply(replyText, comment.parentId || comment.id, comment.authorName);
        setReplyText('');
        setIsReplying(false);
    };

    return (
        <div className="flex items-start gap-3 w-full group">
            <Avatar className="h-10 w-10">
                <AvatarImage src={comment.authorAvatar} />
                <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow space-y-1">
                <div className="relative">
                    <div className="flex items-center gap-2">
                       <p className="font-semibold text-sm break-all">{comment.authorName}</p>
                       <p className="text-xs text-muted-foreground flex-shrink-0">
                            <RealtimeTimestamp date={comment.timestamp} isEdited={comment.isEdited} />
                       </p>
                    </div>

                    <div className="absolute top-0 right-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {user?.uid === comment.userId ? (
                                    <>
                                        <DropdownMenuItem onSelect={() => { setIsEditing(true); setEditedText(comment.text); }}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Delete Comment?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(comment.id, comment.parentId)}>Delete</AlertDialogAction></AlertDialogFooter>
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
                </div>

                {isEditing ? (
                    <div className="space-y-2 pt-1">
                        <Textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} autoFocus rows={2} />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleEditSubmit}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm whitespace-pre-wrap break-words pt-1">
                        {comment.replyingTo && <span className="text-primary font-medium mr-1">@{comment.replyingTo}</span>}
                        {comment.text}
                    </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <button onClick={() => onLike(comment.id)} className={cn("flex items-center gap-1.5 hover:text-primary", hasLiked && "text-primary")}>
                        <ThumbsUp className={cn("w-4 h-4", hasLiked && "fill-primary")} />
                        <span>{comment.likes && comment.likes > 0 ? comment.likes : ''}</span>
                    </button>
                    <button onClick={() => setIsReplying(prev => !prev)} className="hover:text-primary">Reply</button>
                </div>
                {isReplying && (
                     <div className="flex w-full items-start gap-2 pt-2">
                        <Textarea 
                            placeholder={`Replying to @${comment.authorName}...`} 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            autoFocus
                            rows={2}
                            className="h-auto"
                        />
                        <div className="flex flex-col gap-2">
                            <Button size="sm" onClick={handleReplySubmit} disabled={!replyText.trim()}>Reply</Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)}>Cancel</Button>
                        </div>
                    </div>
                )}
                
                 {(comment.replyCount || 0) > 0 && !comment.parentId && (
                     <Button variant="ghost" size="sm" className="text-primary -ml-2 text-xs" onClick={() => setShowReplies(prev => !prev)}>
                        <ChevronDown className={cn("w-4 h-4 mr-1 transition-transform", showReplies && "-rotate-180")} />
                        {showReplies ? 'Hide' : 'View'} {comment.replyCount} {comment.replyCount && comment.replyCount > 1 ? 'replies' : 'reply'}
                    </Button>
                )}

                {showReplies && replies.length > 0 && (
                     <div className="pt-4 space-y-6 pl-6 border-l-2 ml-5">
                         {replies.map(reply => (
                            <Comment 
                                key={reply.id} 
                                comment={reply}
                                replies={[]}
                                onReply={onReply}
                                onLike={onLike}
                                onReport={onReport}
                                onCopyLink={onCopyLink}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                postId={postId}
                            />
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
    const [allComments, setAllComments] = useState<CommentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newCommentText, setNewCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Memoized computation of comment structure
    const { topLevelComments, repliesMap } = useMemo(() => {
        const topLevel: CommentType[] = [];
        const replies = new Map<string, CommentType[]>();

        allComments.forEach(comment => {
            if (comment.parentId) {
                if (!replies.has(comment.parentId)) {
                    replies.set(comment.parentId, []);
                }
                replies.get(comment.parentId)!.push(comment);
            } else {
                topLevel.push(comment);
            }
        });

        // Sort replies chronologically
        replies.forEach(replyList => replyList.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis()));
        
        return { topLevelComments: topLevel, repliesMap: replies };
    }, [allComments]);


    // Real-time listener for all comments on the post
    useEffect(() => {
        if (!post?.id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const db = getFirestoreDb();
        const q = query(collection(db, `posts/${post.id}/comments`), orderBy("timestamp", "asc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as CommentType));
            setAllComments(commentsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Firestore snapshot error:", error);
            toast({ variant: 'destructive', title: "Error", description: "Could not load comments." });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [post?.id, toast]);


    const handleNewCommentSubmit = async (text: string, parentId: string | null = null, replyingTo: string | null = null) => {
        if (!text.trim() || !user || !userData) return;
        if (isSubmitting) return;

        setIsSubmitting(true);
        const db = getFirestoreDb();
        const postRef = doc(db, 'posts', post.id);

        try {
            await runTransaction(db, async (transaction) => {
                const postDoc = await transaction.get(postRef);
                if (!postDoc.exists()) throw new Error("Post does not exist!");

                const newCommentRef = doc(collection(db, `posts/${post.id}/comments`));
                const newCommentData: Omit<CommentType, 'id'> = {
                    userId: user.uid,
                    authorName: userData.displayName,
                    authorAvatar: userData.photoURL || '',
                    text: text,
                    timestamp: Timestamp.now(),
                    isEdited: false,
                    likes: 0,
                    likedBy: [],
                    replyingTo: replyingTo,
                    parentId: parentId,
                    replyCount: 0,
                };
                transaction.set(newCommentRef, newCommentData);
                
                if (parentId) {
                    const parentRef = doc(db, `posts/${post.id}/comments`, parentId);
                    transaction.update(parentRef, { replyCount: increment(1) });
                }

                transaction.update(postRef, { replies: increment(1) });
            });

            if (!parentId) setNewCommentText("");

        } catch (error: any) {
            console.error("Error posting comment:", error);
            toast({ variant: 'destructive', title: "Error posting comment", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async (commentId: string, newText: string) => {
        const db = getFirestoreDb();
        const commentRef = doc(db, `posts/${post.id}/comments`, commentId);
        await updateDoc(commentRef, { text: newText, isEdited: true });
        toast({ title: "Comment Updated" });
    };

    const handleDelete = async (commentId: string, parentId: string | null) => {
        const db = getFirestoreDb();
        const postRef = doc(db, 'posts', post.id);
        const commentRef = doc(db, `posts/${post.id}/comments`, commentId);

        await runTransaction(db, async (transaction) => {
            transaction.delete(commentRef);
            transaction.update(postRef, { replies: increment(-1) });
            if (parentId) {
                const parentRef = doc(db, `posts/${post.id}/comments`, parentId);
                transaction.update(parentRef, { replyCount: increment(-1) });
            }
        });
        toast({ title: "Comment Deleted" });
    };
    
    const handleLike = async (commentId: string) => {
        if (!user) return;
        const db = getFirestoreDb();
        const commentRef = doc(db, `posts/${post.id}/comments`, commentId);
        
        await runTransaction(db, async (transaction) => {
            const commentDoc = await transaction.get(commentRef);
            if (!commentDoc.exists()) return;
            
            const currentLikes = (commentDoc.data().likedBy || []) as string[];
            if (currentLikes.includes(user.uid)) {
                transaction.update(commentRef, { 
                    likedBy: currentLikes.filter(uid => uid !== user.uid),
                    likes: increment(-1)
                });
            } else {
                transaction.update(commentRef, { 
                    likedBy: [...currentLikes, user.uid],
                    likes: increment(1)
                });
            }
        });
    };

    const handleReport = (commentId: string) => toast({ title: "Comment Reported" });
    const handleCopyLink = (commentId: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}#comment-${commentId}`);
        toast({ title: "Link Copied!" });
    };
    
    if (!post) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }
    
    const handlers = { onReply: handleNewCommentSubmit, onLike: handleLike, onReport: handleReport, onCopyLink: handleCopyLink, onEdit: handleEdit, onDelete: handleDelete, postId: post.id };

    return (
        <div className="h-full flex flex-col bg-background/80 backdrop-blur-sm">
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-lg">Comments ({post.replies || 0})</h3>
            </div>
            <ScrollArea className="flex-grow">
                <div className="p-4 flex flex-col items-start gap-y-6">
                    {isLoading ? (
                        <div className="w-full space-y-4 pt-4">
                            <CommentSkeleton />
                            <CommentSkeleton />
                        </div>
                    ) : topLevelComments.length > 0 ? (
                        topLevelComments.map(comment => (
                            <Comment 
                                key={comment.id}
                                {...handlers}
                                comment={comment}
                                replies={repliesMap.get(comment.id) || []}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full w-full text-muted-foreground text-center p-4 min-h-48">
                            <MessageSquare className="w-10 h-10 mb-2" />
                            <h4 className="font-semibold">No comments yet</h4>
                            <p className="text-sm">Be the first one to comment.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t flex-shrink-0 bg-background">
                <form onSubmit={(e) => { e.preventDefault(); handleNewCommentSubmit(newCommentText); }} className="flex items-center gap-2">
                    <div className="relative flex-grow">
                        <Textarea 
                            placeholder="Add a comment..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            rows={1}
                            className="flex-grow resize-none pr-10 min-h-[40px] rounded-md"
                        />
                         <Button variant="ghost" size="icon" type="button" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground">
                            <Smile />
                        </Button>
                    </div>
                    <Button type="submit" disabled={!newCommentText.trim() || isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
