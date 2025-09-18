
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { X, MoreHorizontal, Edit, Trash2, Send, MessageSquare, ThumbsUp, ChevronDown, Flag, Link as Link2, Loader2 } from 'lucide-react';
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
import { useLocalStorage } from '@/hooks/use-local-storage';
import { RealtimeTimestamp } from '@/components/feed/realtime-timestamp';


interface CommentType {
  id: string;
  authorName: string;
  userId: string;
  authorAvatar: string;
  text: string;
  timestamp: Timestamp;
  isEdited: boolean;
  likes: string[];
  replyingTo?: string | null;
  parentId: string | null;
  replyCount: number;
}

const Comment = ({ comment, onReply, onLike, onReport, onCopyLink, onEdit, onDelete, children }: {
    comment: CommentType,
    onReply: (text: string, parentId: string, replyingTo: string) => void,
    onLike: (id: string) => void,
    onReport: (id: string) => void,
    onCopyLink: (id: string) => void,
    onEdit: (id: string, text: string) => void,
    onDelete: (id: string) => void,
    children: React.ReactNode
}) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [areRepliesVisible, setAreRepliesVisible] = useState(false);
    const hasLiked = user ? comment.likes.includes(user.uid) : false;

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
        <div className="flex flex-col gap-2">
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
                                <button className="ml-auto"><MoreHorizontal className="w-4 h-4" /></button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
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
                        <button onClick={() => onLike(comment.id)} className={cn("flex items-center gap-1.5 hover:text-primary", hasLiked && "text-primary")}>
                            <ThumbsUp className={cn("w-4 h-4", hasLiked && "fill-primary")} />
                            <span>{comment.likes.length > 0 ? comment.likes.length : ''}</span>
                        </button>
                        <button onClick={() => setIsReplying(prev => !prev)} className="hover:text-primary">Reply</button>
                    </div>
                </div>
            </div>
            
            {isReplying && (
                <div className="pl-12">
                    <div className="flex items-start gap-3">
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
            {areRepliesVisible && (
                 <div className="pl-14">
                    {children}
                 </div>
            )}
            {comment.replyCount > 0 && (
                <div className="pl-14 mt-2">
                    <button className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-2" onClick={() => setAreRepliesVisible(prev => !prev)}>
                         <div className="w-6 h-px bg-border" />
                         {areRepliesVisible ? 'Hide replies' : `View ${comment.replyCount} ${comment.replyCount > 1 ? 'replies' : 'reply'}`}
                    </button>
                </div>
            )}
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

    useEffect(() => {
        if (!post?.id) {
            setComments([]);
            setIsLoading(false);
            return;
        };

        setIsLoading(true);
        const db = getFirestoreDb();
        const commentsQuery = query(collection(db, `posts/${post.id}/comments`), orderBy("timestamp", "asc"));
        
        const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
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
    }, [post?.id]);

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

                let parentRef = null;
                if (parentId) {
                    parentRef = doc(db, `posts/${post.id}/comments`, parentId);
                    const parentDoc = await transaction.get(parentRef);
                    if (!parentDoc.exists()) {
                        throw new Error("Parent comment does not exist!");
                    }
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
                if (parentRef) {
                    transaction.update(parentRef, { replyCount: increment(1) });
                }
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
    
    const handlers = { onReply: handleNewCommentSubmit, onLike: handleLike, onReport: handleReport, onCopyLink: handleCopyLink, onEdit: handleEdit, onDelete: handleDelete };
    
    const renderComments = (parentId: string | null): JSX.Element[] => {
        return comments
            .filter(comment => comment.parentId === parentId)
            .map(comment => (
                <Comment key={comment.id} comment={comment} {...handlers}>
                    {renderComments(comment.id)}
                </Comment>
            ));
    };

    return (
        <div className="h-full flex flex-col bg-background/80 backdrop-blur-sm">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Comments ({post.replies || 0})</h3>
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
                    ) : comments.length > 0 ? (
                        renderComments(null)
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
                    <Button type="submit" disabled={!newCommentText.trim() || isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
