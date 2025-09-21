
"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
} from 'firebase/firestore';
import { X, MoreHorizontal, Edit, Trash2, Send, MessageSquare, ThumbsUp, ThumbsDown, ChevronDown, Flag, Link as Link2, Loader2, Smile } from 'lucide-react';
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
    <div className="flex items-start gap-3 w-full p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-grow space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-4 mt-2">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-10" />
            </div>
        </div>
    </div>
);

const Comment = ({ comment, postId }: {
    comment: CommentType,
    postId: string;
}) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<CommentType[]>([]);
    const [isRepliesLoading, setIsRepliesLoading] = useState(false);
    const unsubscribeRepliesRef = useRef<() => void | null>(null);

    const hasLiked = user && comment.likedBy ? comment.likedBy.includes(user.uid) : false;
    
    const handleFetchReplies = useCallback(async () => {
        if (unsubscribeRepliesRef.current) {
            return;
        }

        setIsRepliesLoading(true);
        const db = getFirestoreDb();
        const repliesQuery = query(
            collection(db, `posts/${postId}/comments`),
            where("parentId", "==", comment.id),
            orderBy("timestamp", "asc")
        );
        const unsubscribe = onSnapshot(repliesQuery, (snapshot) => {
            const fetchedReplies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommentType));
            setReplies(fetchedReplies);
            setIsRepliesLoading(false);
        });
        
        unsubscribeRepliesRef.current = unsubscribe;
    }, [comment.id, postId]);
    
    const onToggleReplies = () => {
        const newShowState = !showReplies;
        setShowReplies(newShowState);
        if (newShowState) {
            handleFetchReplies();
        } else {
            if (unsubscribeRepliesRef.current) {
                unsubscribeRepliesRef.current();
                unsubscribeRepliesRef.current = null;
            }
        }
    }
    
    useEffect(() => {
        // Cleanup listener on component unmount
        return () => {
            if (unsubscribeRepliesRef.current) {
                unsubscribeRepliesRef.current();
            }
        };
    }, []);

    // Handlers would be passed down or use context for a real app
    const onLike = () => console.log('like');
    const onEdit = () => console.log('edit');
    const onDelete = () => console.log('delete');
    const onReport = () => console.log('report');
    const onCopyLink = () => console.log('copy link');
    const onReply = () => console.log('reply');

    return (
        <div className="flex items-start gap-3 w-full group">
            <Avatar className="h-10 w-10">
                <AvatarImage src={comment.authorAvatar} />
                <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow space-y-1">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <p className="font-semibold text-sm break-all">{comment.authorName}</p>
                       <p className="text-xs text-muted-foreground flex-shrink-0">
                            <RealtimeTimestamp date={comment.timestamp} />
                       </p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        {/* Dropdown Menu Content Here */}
                    </DropdownMenu>
                </div>
                
                <p className="text-sm whitespace-pre-wrap break-words">{comment.text}</p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <button onClick={() => onLike()} className="flex items-center gap-1.5 hover:text-primary">
                        <ThumbsUp className={cn("w-4 h-4", hasLiked && "text-primary fill-primary")} />
                        <span>{comment.likes || 0}</span>
                    </button>
                     <button className="flex items-center gap-1.5 hover:text-primary">
                        <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsReplying(prev => !prev)} className="hover:text-primary font-semibold">Reply</button>
                </div>
                
                {(comment.replyCount || 0) > 0 && (
                     <Button variant="ghost" size="sm" className="text-primary -ml-2 text-xs h-auto py-1" onClick={onToggleReplies}>
                        <ChevronDown className={cn("w-4 h-4 mr-1 transition-transform", showReplies && "-rotate-180")} />
                        {showReplies ? 'Hide' : 'View'} {comment.replyCount} {comment.replyCount && comment.replyCount > 1 ? 'replies' : 'reply'}
                    </Button>
                )}

                {showReplies && (
                    <div className="pt-4 space-y-6">
                         {isRepliesLoading ? <CommentSkeleton /> : (
                            replies.map(reply => (
                                <div key={reply.id} className="flex items-start gap-3 w-full pl-6 border-l-2 ml-5">
                                    <Comment comment={reply} postId={postId} />
                                </div>
                            ))
                         )}
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
    
    // Check for post existence at the very top
    if (!post) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }
    
    // Memoized computation of comment structure
    const topLevelComments = useMemo(() => {
        return allComments.filter(comment => !comment.parentId)
    }, [allComments]);


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


    return (
        <div className="h-full flex flex-col bg-background">
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-lg">Comments ({post.replies || 0})</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                    <X className="w-5 h-5"/>
                </Button>
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
                                comment={comment}
                                postId={post.id}
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
                <form className="flex items-center gap-2">
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
