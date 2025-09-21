
"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { X, MoreHorizontal, Edit, Trash2, Send, MessageSquare, ThumbsUp, ThumbsDown, ChevronDown, Flag, Link as Link2, Loader2, Smile, Pin } from 'lucide-react';
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
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';

interface CommentType {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: Date;
  isEdited?: boolean;
  isPinned?: boolean;
  likes?: number;
  likedBy?: string[];
  parentId?: string | null;
  replyCount?: number;
  replyingTo?: string;
}

const mockCommentsData: CommentType[] = [
    { id: '1', userId: 'userA', authorName: 'Ganesh Prajapati', authorAvatar: 'https://placehold.co/40x40.png?text=GP', text: 'This looks amazing! What material is it made of? I\'m very interested.', timestamp: new Date(Date.now() - 5 * 60 * 1000), parentId: null, likes: 12, likedBy: [], replyCount: 2 },
    { id: '2', userId: 'userB', authorName: 'Alex Morgan', authorAvatar: 'https://placehold.co/40x40.png?text=AM', text: 'Replying to Ganesh: It\'s made from 100% recycled materials and feels super premium!', timestamp: new Date(Date.now() - 4 * 60 * 1000), parentId: '1', likes: 3, likedBy: [], replyingTo: 'Ganesh Prajapati' },
    { id: '3', userId: 'userA', authorName: 'Ganesh Prajapati', authorAvatar: 'https://placehold.co/40x40.png?text=GP', text: 'Wow, that\'s impressive. Thanks for the quick reply, Alex!', timestamp: new Date(Date.now() - 3 * 60 * 1000), parentId: '1', likes: 1, likedBy: [], replyingTo: 'Alex Morgan' },
    { id: '4', userId: 'userC', authorName: 'Chris Wilson', authorAvatar: 'https://placehold.co/40x40.png?text=CW', text: 'I bought this last week and it has been fantastic. Highly recommended!', timestamp: new Date(Date.now() - 10 * 60 * 1000), parentId: null, likes: 8, likedBy: [], replyCount: 0 },
    { id: '5', userId: 'userD', authorName: 'Brianna West', authorAvatar: 'https://placehold.co/40x40.png?text=BW', text: 'Are there any other colors available?', timestamp: new Date(Date.now() - 15 * 60 * 1000), parentId: null, likes: 2, likedBy: [], replyCount: 1 },
    { id: '6', userId: 'userB', authorName: 'Alex Morgan', authorAvatar: 'https://placehold.co/40x40.png?text=AM', text: 'Hi Brianna! We have it in blue and green as well. They will be in stock next week.', timestamp: new Date(Date.now() - 14 * 60 * 1000), parentId: '5', likes: 4, likedBy: [], replyingTo: 'Brianna West' },
];

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

const Comment = ({ comment, post, handlers, allComments }: {
    comment: CommentType,
    post: any,
    handlers: any,
    allComments: CommentType[]
}) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<CommentType[]>([]);

    const hasLiked = user && comment.likedBy ? comment.likedBy.includes(user.uid) : false;

    const handleFetchReplies = useCallback(() => {
        const fetchedReplies = allComments.filter(c => c.parentId === comment.id).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        setReplies(fetchedReplies);
    }, [allComments, comment.id]);

    const handleToggleReplies = () => {
        const newShowState = !showReplies;
        setShowReplies(newShowState);
        if (newShowState && replies.length === 0 && comment.replyCount && comment.replyCount > 0) {
            handleFetchReplies();
        }
    };
    
    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handlers.onReply({ text: replyText, parentId: comment.id, replyingTo: comment.authorName });
        setReplyText('');
        setIsReplying(false);
        if (!showReplies) {
            handleToggleReplies();
        }
    };

    const handleEditSubmit = () => {
        handlers.onEdit(comment.id, editedText);
        setIsEditing(false);
    };

    const isPostAuthor = user?.uid === post.sellerId;

    return (
        <div className="flex flex-col">
            {comment.isPinned && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 pl-4">
                    <Avatar className="w-5 h-5">
                        <AvatarImage src={post.avatarUrl} />
                        <AvatarFallback>{post.sellerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Pin className="w-3 h-3 text-muted-foreground" /> Pinned by {post.sellerName}
                </div>
            )}
            <div className="flex items-start gap-3 w-full group">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.authorAvatar} />
                    <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-xs break-all">{comment.authorName}</p>
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
                            <DropdownMenuContent align="end">
                                {isPostAuthor && (
                                     <DropdownMenuItem onSelect={() => handlers.onTogglePin(comment.id)}>
                                        <Pin className="mr-2 h-4 w-4" />{comment.isPinned ? "Unpin" : "Pin"} Comment
                                    </DropdownMenuItem>
                                )}
                                {user?.uid === comment.userId ? (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handlers.onDelete(comment.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                    </>
                                ) : (
                                    <DropdownMenuItem onSelect={() => handlers.onReport(comment.id)}><Flag className="mr-2 h-4 w-4" />Report</DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => handlers.onCopyLink(comment.id)}><Link2 className="mr-2 h-4 w-4" />Copy Link to Comment</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>


                    {!isEditing ? (
                        <p className="text-sm whitespace-pre-wrap break-words">
                            {comment.replyingTo && <span className="text-primary font-semibold mr-1">@{comment.replyingTo}</span>}
                            {comment.text}
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} className="text-sm" />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleEditSubmit}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <button onClick={() => handlers.onLike(comment.id)} className="flex items-center gap-1.5 hover:text-primary">
                            <ThumbsUp className={cn("w-4 h-4", hasLiked && "text-primary fill-primary")} />
                            <span>{comment.likes || 0}</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-primary">
                            <ThumbsDown className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsReplying(prev => !prev)} className="hover:text-primary font-semibold">Reply</button>
                    </div>
                    
                     {isReplying && (
                        <form onSubmit={handleReplySubmit} className="flex items-center gap-2 pt-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.photoURL || undefined} />
                                <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <Input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={`Replying to @${comment.authorName}...`} className="h-9" />
                            <Button type="submit" size="sm" disabled={!replyText.trim()}>Reply</Button>
                        </form>
                    )}

                    {comment.replyCount && comment.replyCount > 0 && (
                        <Button variant="ghost" size="sm" className="text-primary -ml-2 text-xs h-auto py-1" onClick={handleToggleReplies}>
                            <ChevronDown className={cn("w-4 h-4 mr-1 transition-transform", showReplies && "-rotate-180")} />
                            {showReplies ? 'Hide' : 'View'} {comment.replyCount} {comment.replyCount > 1 ? 'replies' : 'reply'}
                        </Button>
                    )}

                    {showReplies && (
                        <div className="pt-2 space-y-4">
                            {replies.length > 0 ? (
                                replies.map(reply => (
                                    <div key={reply.id} className="pl-6">
                                        <Comment comment={reply} post={post} handlers={handlers} allComments={allComments} />
                                    </div>
                                ))
                            ) : (
                                <CommentSkeleton />
                            )}
                        </div>
                    )}
                </div>
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
    const [pinnedCommentId, setPinnedCommentId] = useState<string | null>(null);

    
    useEffect(() => {
      if (!post) return;
      setIsLoading(true);
      // Simulate fetching data
      setTimeout(() => {
          setAllComments(mockCommentsData);
          setIsLoading(false);
      }, 500);
    }, [post]);

    const orderedComments = useMemo(() => {
        const topLevel = allComments
            .filter(comment => !comment.parentId)
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        if (pinnedCommentId) {
            const pinned = topLevel.find(c => c.id === pinnedCommentId);
            if (pinned) {
                return [
                    { ...pinned, isPinned: true }, 
                    ...topLevel.filter(c => c.id !== pinnedCommentId)
                ];
            }
        }
        
        return topLevel.map(c => ({...c, isPinned: false}));

    }, [allComments, pinnedCommentId]);
    
    const handleNewCommentSubmit = (data: { text: string, parentId?: string, replyingTo?: string }) => {
        if (!user || !userData) {
            toast({ variant: 'destructive', title: "Login Required", description: "You must be logged in to comment." });
            return;
        }

        const newComment: CommentType = {
            id: String(Date.now()),
            userId: user.uid,
            authorName: userData.displayName,
            authorAvatar: userData.photoURL,
            text: data.text,
            timestamp: new Date(),
            parentId: data.parentId || null,
            likes: 0,
            likedBy: [],
            replyingTo: data.replyingTo,
        };

        setAllComments(prev => [...prev, newComment]);

        if (data.parentId) {
            setAllComments(prev => prev.map(c => 
                c.id === data.parentId ? {...c, replyCount: (c.replyCount || 0) + 1} : c
            ));
        }

        toast({ title: "Comment Posted!" });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCommentText.trim()) return;
        handleNewCommentSubmit({ text: newCommentText });
        setNewCommentText('');
    };

    const handleTogglePin = (commentId: string) => {
        setPinnedCommentId(prevId => (prevId === commentId ? null : commentId));
        toast({ title: pinnedCommentId === commentId ? "Comment Unpinned" : "Comment Pinned" });
    };
    const handleLike = (commentId: string) => console.log("Liking comment:", commentId);
    const handleReport = (commentId: string) => toast({ title: "Comment Reported", description: "Our team will review it." });
    const handleCopyLink = (commentId: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}?comment=${commentId}`);
        toast({ title: "Link Copied!" });
    };
    const handleEdit = (commentId: string, newText: string) => {
        setAllComments(prev => prev.map(c => 
            c.id === commentId ? {...c, text: newText, isEdited: true} : c
        ));
        toast({ title: "Comment Updated" });
    };
    const handleDelete = (commentId: string) => {
        setAllComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId));
        toast({ title: "Comment Deleted" });
    };
    
    if (!post) {
      return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    const handlers = { onReply: handleNewCommentSubmit, onLike: handleLike, onReport: handleReport, onCopyLink: handleCopyLink, onEdit: handleEdit, onDelete: handleDelete, onTogglePin: handleTogglePin, postId: post.id };

    return (
        <div className="h-full flex flex-col bg-background">
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-lg">Comments ({allComments.length})</h3>
            </div>
            <ScrollArea className="flex-grow">
                <div className="divide-y">
                    {isLoading ? (
                        <div className="w-full space-y-4 pt-4">
                            <CommentSkeleton />
                            <CommentSkeleton />
                        </div>
                    ) : orderedComments.length > 0 ? (
                        orderedComments.map(comment => (
                            <div key={comment.id} className="w-full p-4">
                                <Comment 
                                    comment={comment}
                                    post={post}
                                    handlers={handlers}
                                    allComments={allComments}
                                />
                            </div>
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
                <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.photoURL || undefined} />
                        <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
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
