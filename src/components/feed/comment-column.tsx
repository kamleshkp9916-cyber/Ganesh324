
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
  where,
  getDocs,
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
  authorName: string;
  userId: string;
  authorAvatar: string;
  text: string;
  timestamp: Timestamp;
  isEdited?: boolean;
  likes?: string[];
  replyingTo?: string | null;
  parentId: string | null;
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

const Comment = ({ comment, onReply, onLike, onReport, onCopyLink, onEdit, onDelete, postId, onFetchReplies }: {
    comment: CommentType,
    onReply: (text: string, parentId: string, replyingTo: string) => void,
    onLike: (id: string) => void,
    onReport: (id: string) => void,
    onCopyLink: (id: string) => void,
    onEdit: (id: string, text: string) => void,
    onDelete: (id: string) => void,
    postId: string;
    onFetchReplies: (comment: CommentType) => void;
}) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const hasLiked = user && comment.likes ? comment.likes.includes(user.uid) : false;

    const handleEditSubmit = () => {
        onEdit(comment.id, editedText);
        setIsEditing(false);
    }

    const handleReplySubmit = () => {
        if (!replyText.trim()) return;
        onReply(replyText, comment.id, comment.authorName);
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
                    <div className="flex flex-col">
                         <div className="flex items-center gap-2">
                           <p className="font-semibold text-sm break-all">{comment.authorName}</p>
                           <p className="text-xs text-muted-foreground flex-shrink-0">
                                <RealtimeTimestamp date={comment.timestamp} isEdited={comment.isEdited} />
                           </p>
                        </div>
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
                        <span>{comment.likes && comment.likes.length > 0 ? comment.likes.length : ''}</span>
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
                     <Button variant="ghost" size="sm" className="text-primary -ml-2 text-xs" onClick={() => onFetchReplies(comment)}>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        View {comment.replyCount} {comment.replyCount && comment.replyCount > 1 ? 'replies' : 'reply'}
                    </Button>
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
    const [newCommentText, setNewCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeThread, setActiveThread] = useState<CommentType | null>(null);

    const handleNewCommentSubmit = async (text: string, parentId: string | null = null, replyingTo: string | null = null) => {
        if (!text.trim() || !user || !userData) return;
        if (isSubmitting) return;

        setIsSubmitting(true);
        const db = getFirestoreDb();
        const postRef = doc(db, 'posts', post.id);

        try {
            await runTransaction(db, async (transaction) => {
                const postDoc = await transaction.get(postRef);
                if (!postDoc.exists()) {
                    throw new Error("Post does not exist!");
                }

                if (parentId) {
                    const parentRef = doc(db, `posts/${post.id}/comments`, parentId);
                    transaction.update(parentRef, { replyCount: increment(1) });
                }
                
                const newCommentRef = doc(collection(db, `posts/${post.id}/comments`));
                const newCommentData: any = {
                    userId: user.uid,
                    authorName: userData.displayName,
                    authorAvatar: userData.photoURL || '',
                    text: text,
                    timestamp: serverTimestamp(),
                    isEdited: false,
                    likes: [],
                    replyingTo: replyingTo,
                    replyCount: 0,
                    parentId: parentId,
                };

                transaction.set(newCommentRef, newCommentData);
                transaction.update(postRef, { replies: increment(1) });
            });

            if (!parentId) {
                setNewCommentText("");
            }
        } catch (error: any) {
            console.error("Error posting comment:", error);
            toast({ variant: 'destructive', title: "Error posting comment", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async (commentId: string, newText: string) => {
        try {
            const db = getFirestoreDb();
            await updateDoc(doc(db, `posts/${post.id}/comments`, commentId), {
                text: newText,
                isEdited: true,
            });
            toast({ title: "Comment Updated" });
        } catch (error) {
            console.error("Error editing comment:", error);
            toast({ variant: 'destructive', title: "Error", description: "Could not update comment." });
        }
    };

    const handleDelete = async (commentId: string) => {
        try {
            const db = getFirestoreDb();
            const postRef = doc(db, 'posts', post.id);
            const commentRef = doc(db, `posts/${post.id}/comments`, commentId);
            
            await runTransaction(db, async (transaction) => {
                const commentDoc = await transaction.get(commentRef);
                if (!commentDoc.exists()) return;

                const parentId = commentDoc.data().parentId;
                
                transaction.delete(commentRef);
                transaction.update(postRef, { replies: increment(-1) });

                if (parentId) {
                    const parentRef = doc(db, `posts/${post.id}/comments`, parentId);
                    transaction.update(parentRef, { replyCount: increment(-1) });
                }
            });

            toast({ title: "Comment Deleted" });
        } catch (error) {
             console.error("Error deleting comment:", error);
            toast({ variant: 'destructive', title: "Error", description: "Could not delete comment." });
        }
    };
    
    const handleLike = async (commentId: string) => {
        if (!user) return;
        try {
            const db = getFirestoreDb();
            const commentRef = doc(db, `posts/${post.id}/comments`, commentId);
            await runTransaction(db, async (transaction) => {
                const commentDoc = await transaction.get(commentRef);
                if (!commentDoc.exists()) throw "Comment does not exist!";
                
                const likes: string[] = commentDoc.data().likes || [];
                if (likes.includes(user.uid)) {
                    transaction.update(commentRef, { likes: likes.filter(uid => uid !== user.uid) });
                } else {
                    transaction.update(commentRef, { likes: [...likes, user.uid] });
                }
            });
        } catch (error) {
            console.error("Error liking comment:", error);
        }
    };

    const handleReport = (commentId: string) => {
        toast({
            title: "Comment Reported",
            description: "Thank you for your feedback.",
        });
    };
    
    const handleCopyLink = (commentId: string) => {
        navigator.clipboard.writeText(`${window.location.href}#comment-${commentId}`);
        toast({ title: "Link Copied!" });
    };

    useEffect(() => {
        if (!post?.id) {
            setComments([]);
            setIsLoading(false);
            return;
        };

        setIsLoading(true);
        const db = getFirestoreDb();
        const parentId = activeThread ? activeThread.id : null;
        
        const q = query(collection(db, `posts/${post.id}/comments`), where("parentId", "==", parentId), orderBy("timestamp", "asc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as CommentType));
            setComments(commentsData);
            setIsLoading(false);
        }, (error) => {
             console.error("Firestore snapshot error:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [post?.id, activeThread]);

    const handlers = { onReply: handleNewCommentSubmit, onLike: handleLike, onReport: handleReport, onCopyLink: handleCopyLink, onEdit: handleEdit, onDelete: handleDelete, postId: post?.id || '', onFetchReplies: setActiveThread };

    if (!post) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col bg-background/80 backdrop-blur-sm">
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-2">
                    {activeThread && (
                        <Button variant="ghost" size="icon" className="-ml-2" onClick={() => setActiveThread(null)}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    )}
                    <h3 className="font-bold text-lg">
                        {activeThread ? `Replies to @${activeThread.authorName}` : `Comments (${post.replies || 0})`}
                    </h3>
                </div>
            </div>
            <ScrollArea className="flex-grow">
                <div className="p-4 flex flex-col items-start gap-y-6">
                    {activeThread && (
                        <Comment key={activeThread.id} {...handlers} comment={activeThread} />
                    )}
                    {(isLoading && (!activeThread || comments.length === 0)) ? (
                        <div className="w-full space-y-4 pt-4">
                            <CommentSkeleton />
                            <CommentSkeleton />
                        </div>
                    ) : (comments.length > 0) ? (
                        <div className={cn("w-full space-y-6", activeThread && "pl-6 border-l-2 ml-5")}>
                            {comments.map(comment => (
                                <Comment 
                                    key={comment.id}
                                    {...handlers}
                                    comment={comment}
                                />
                            ))}
                        </div>
                    ) : (!activeThread) ? (
                        <div className="flex flex-col items-center justify-center h-full w-full text-muted-foreground text-center p-4 min-h-48">
                            <MessageSquare className="w-10 h-10 mb-2" />
                            <h4 className="font-semibold">No comments yet</h4>
                            <p className="text-sm">Be the first one to comment.</p>
                        </div>
                    ) : null}
                </div>
            </ScrollArea>
            <div className="p-4 border-t flex-shrink-0 bg-background">
                <form onSubmit={(e) => { e.preventDefault(); handleNewCommentSubmit(newCommentText, activeThread?.id || null, activeThread?.authorName); }} className="flex items-center gap-2">
                    <div className="relative flex-grow">
                        <Textarea 
                            placeholder={activeThread ? `Replying to @${activeThread.authorName}...` : "Add a comment..."}
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
