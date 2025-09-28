
"use client";

import {
  ArrowLeft,
  Heart,
  MessageSquare,
  MoreVertical,
  Send,
  Share2,
  ShoppingCart,
  Star,
  UserPlus,
  Users,
  X,
  PlusCircle,
  Video,
  Zap,
  Play,
  Pause,
  Settings,
  RadioTower,
  Tv,
  Volume2,
  VolumeX,
  List,
  Smile,
  PanelRightClose,
  PanelRightOpen,
  Flag,
  MessageCircle,
  LifeBuoy,
  Gavel,
  ShieldCheck,
  StopCircle,
  Rewind,
  FastForward,
  WifiOff,
  ChevronDown,
  Maximize,
  Minimize,
  PictureInPicture,
  ShoppingBag,
  Paperclip,
  Search,
  Pin,
  Wallet,
  Plus,
  Download,
  Loader2,
  RefreshCw,
  Coins,
  Settings2,
  SlidersHorizontal,
  Subtitles,
  History,
  Ticket,
  Award,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from 'next/image';
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { productDetails } from "@/lib/product-data";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { addToCart, isProductInCart } from "@/lib/product-history";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/hooks/use-auth';
import { ScrollArea } from "@/components/ui/scroll-area";
import { toggleFollow, getUserData } from '@/lib/follow-data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { Slider } from "@/components/ui/slider";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { Textarea } from "@/components/ui/textarea";
import { categories } from "@/lib/categories";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Logo } from "@/components/logo";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Label } from "@/components/ui/label";
import { WithdrawForm } from "@/components/settings-forms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";


const emojis = [
    '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚',
    '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴',
    '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤',
    '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬',
    '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🤠', '🤡', '🥳', '🥴', '🥺', '🤥', '🤫', '🤭', '🧐', '🤓', '😈',
    '👿', '👹', '👺', '💀', '👻', '👽', '🤖', '💩', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👋', '🤚',
    '🖐️', '✋', '🖖', '👏', '🙌', '🙏', '🤝', '💪', '🦾', '🦵', '🦿', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴',
    '👀', '👁️', '👅', '👄', '❤️', '💔', '💕', '💖', '💗', '💓', '💞', '💝', '💟', '✨', '⭐', '🌟', '💫', '💥',
    '💯', '🔥', '🎉', '🎊', '🎁', '🎈',
];

const liveSellers = [
    { id: '1', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fashion', viewers: 1200, buyers: 25, rating: 4.8, reviews: 12, hint: 'woman posing stylish outfit', productId: 'prod_1', hasAuction: true },
    { id: '2', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Electronics', viewers: 2500, buyers: 42, rating: 4.9, reviews: 28, hint: 'unboxing new phone', productId: 'prod_2', hasAuction: false },
    { id: '3', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Home Goods', viewers: 850, buyers: 15, rating: 4.7, reviews: 9, hint: 'modern living room decor', productId: 'prod_3', hasAuction: false },
    { id: '4', name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Beauty', viewers: 3100, buyers: 78, rating: 4.9, reviews: 55, hint: 'makeup tutorial', productId: 'prod_4', hasAuction: true },
    { id: '5', name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Kitchenware', viewers: 975, buyers: 0, rating: 0, reviews: 0, hint: 'cooking demonstration', productId: 'prod_5', hasAuction: false },
    { id: '6', name: 'FitFlow', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fitness', viewers: 1500, buyers: 33, rating: 4.6, reviews: 18, hint: 'yoga session', productId: 'prod_6', hasAuction: false },
    { id: '7', name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Handmade', viewers: 450, buyers: 8, rating: 5.0, reviews: 6, hint: 'pottery making', productId: 'prod_7', hasAuction: true },
    { id: '8', name: 'PetPalace', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Pet Supplies', viewers: 1800, buyers: 50, rating: 4.8, reviews: 30, hint: 'playing with puppy', productId: 'prod_8', hasAuction: false },
    { id: '9', name: 'BookNook', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Books', viewers: 620, buyers: 12, rating: 4.9, reviews: 10, hint: 'reading book cozy', productId: 'prod_9', hasAuction: false },
    { id: '10', name: 'GamerGuild', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Gaming', viewers: 4200, buyers: 102, rating: 4.9, reviews: 80, hint: 'esports competition', productId: 'prod_10', hasAuction: true },
];

const productToSellerMapping: { [key: string]: { name: string; avatarUrl: string, uid: string } } = {
    'prod_1': { name: 'FashionFinds', avatarUrl: 'https://placehold.co/80x80.png', uid: 'FashionFinds' },
    'prod_2': { name: 'GadgetGuru', avatarUrl: 'https://placehold.co/80x80.png', uid: 'GadgetGuru' },
    'prod_3': { name: 'HomeHaven', avatarUrl: 'https://placehold.co/80x80.png', uid: 'HomeHaven' },
    'prod_4': { name: 'BeautyBox', avatarUrl: 'https://placehold.co/80x80.png', uid: 'BeautyBox' },
    'prod_5': { name: 'KitchenWiz', avatarUrl: 'https://placehold.co/80x80.png', uid: 'KitchenWiz' },
    'prod_6': { name: 'FitFlow', avatarUrl: 'https://placehold.co/80x80.png', uid: 'FitFlow' },
    'prod_7': { name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/80x80.png', uid: 'ArtisanAlley' },
    'prod_8': { name: 'PetPalace', avatarUrl: 'https://placehold.co/80x80.png', uid: 'PetPalace' },
    'prod_9': { name: 'BookNook', avatarUrl: 'https://placehold.co/80x80.png', uid: 'BookNook' },
    'prod_10': { name: 'GamerGuild', avatarUrl: 'https://placehold.co/80x80.png', uid: 'GamerGuild' },
};

const mockChatMessages: any[] = [
    { id: 1, user: 'Ganesh', text: 'This looks amazing! 🔥 #newpurchase', avatar: 'https://placehold.co/40x40.png', userColor: '#3498db', userId: 'user1' },
    { id: 2, user: 'Alex', text: 'What is the material?', avatar: 'https://placehold.co/40x40.png', userColor: '#e74c3c', userId: 'user2' },
    { id: 3, user: 'Jane', text: 'I just bought one! So excited. 🤩 #newpurchase', avatar: 'https://placehold.co/40x40.png', userColor: '#9b59b6', userId: 'user3' },
    { id: 4, type: 'system', text: 'Chris joined the stream.' },
    { id: 5, user: 'FashionFinds', text: 'Hey Alex, it\'s 100% genuine leather!', avatar: 'https://placehold.co/40x40.png', userColor: '#f1c40f', isSeller: true, userId: 'FashionFinds' },
    { id: 6, type: 'system', text: 'Maria purchased a Vintage Camera.' },
    { id: 7, user: 'David', text: 'Do you ship to the US?', avatar: 'https://placehold.co/40x40.png', userColor: '#2ecc71', userId: 'user4' },
    { id: 8, user: 'FashionFinds', text: 'Yes David, we offer international shipping!', avatar: 'https://placehold.co/40x40.png', userColor: '#f1c40f', isSeller: true, userId: 'FashionFinds' },
    { id: 9, user: 'Sarah', text: 'This is my first time here, loving the vibe!', avatar: 'https://placehold.co/40x40.png', userColor: '#e67e22', userId: 'user5' },
    { id: 10, type: 'auction', productId: 'prod_1', active: false, initialTime: 0 },
    { id: 11, user: 'Mike', text: 'BID ₹8,500', avatar: 'https://placehold.co/40x40.png', userColor: '#1abc9c', userId: 'user6', isBid: true },
    { id: 12, user: 'Laura', text: 'BID ₹9,000', avatar: 'https://placehold.co/40x40.png', userColor: '#d35400', userId: 'user7', isBid: true },
    { id: 13, user: 'FashionFinds', text: 'Laura with a bid of ₹9,000! Going once...', avatar: 'https://placehold.co/40x40.png', userColor: '#f1c40f', isSeller: true, userId: 'FashionFinds' },
    { id: 14, user: 'Emily', text: 'How long does the battery last on the light meter?', avatar: 'https://placehold.co/40x40.png', userColor: '#8e44ad', userId: 'user8' },
    { id: 15, type: 'auction', productId: 'prod_4', active: true, initialTime: 180 },
    { id: 16, user: 'FashionFinds', text: '@Emily It lasts for about a year with average use!', avatar: 'https://placehold.co/40x40.png', userColor: '#f1c40f', isSeller: true, userId: 'FashionFinds' },
    { id: 17, type: 'system', text: 'Robert purchased Wireless Headphones.' },
    { id: 18, user: 'Ganesh', text: 'Can you show the back of the camera?', avatar: 'https://placehold.co/40x40.png', userColor: '#3498db', userId: 'user1' },
    { id: 19, user: 'FashionFinds', text: 'Sure thing, Ganesh! Here is a view of the back.', avatar: 'https://placehold.co/40x40.png', userColor: '#f1c40f', isSeller: true, userId: 'FashionFinds' },
    { id: 20, user: 'Chloe', text: 'Just tuned in, what did I miss?', avatar: 'https://placehold.co/40x40.png', userColor: '#34495e', userId: 'user9' },
    { id: 21, user: 'FashionFinds', text: 'Welcome Chloe! We just finished an auction, but we have more exciting products coming up. Stick around!', avatar: 'https://placehold.co/40x40.png', userColor: '#f1c40f', isSeller: true, userId: 'FashionFinds' },
    { id: 22, user: 'Oliver', text: 'Is this real leather?', avatar: 'https://placehold.co/40x40.png?text=O', userColor: '#27ae60', userId: 'user10' },
    { id: 23, user: 'Mia', text: 'Just followed! Love your stuff.', avatar: 'https://placehold.co/40x40.png?text=M', userColor: '#c0392b', userId: 'user11' },
    { id: 24, user: 'Liam', text: 'How much is shipping?', avatar: 'https://placehold.co/40x40.png?text=L', userColor: '#f39c12', userId: 'user12' },
    { id: 25, type: 'system', text: 'Emma purchased a Smart Watch.' },
    { id: 26, user: 'FashionFinds', text: '@Liam shipping is a flat rate of ₹50 anywhere in India!', avatar: 'https://placehold.co/40x40.png', userColor: '#f1c40f', isSeller: true, userId: 'FashionFinds' },
    { id: 27, user: 'Ava', text: 'Can you show a close-up of the stitching?', avatar: 'https://placehold.co/40x40.png?text=A', userColor: '#7f8c8d', userId: 'user13' },
    { id: 28, user: 'Noah', text: 'BID ₹9,100', avatar: 'https://placehold.co/40x40.png?text=N', userColor: '#2c3e50', userId: 'user14', isBid: true },
    { id: 29, user: 'Noah', text: 'BID ₹9,600', avatar: 'https://placehold.co/40x40.png?text=N', userColor: '#2c3e50', userId: 'user14', isBid: true },
    { id: 30, user: 'Sophia', text: 'Great stream! Thanks!', avatar: 'https://placehold.co/40x40.png?text=S', userColor: '#16a085', userId: 'user15' },
];

const PlayerSettingsDialog = ({ playbackRate, onPlaybackRateChange, skipInterval, onSkipIntervalChange, onClose }: {
    playbackRate: number,
    onPlaybackRateChange: (rate: number) => void,
    skipInterval: number,
    onSkipIntervalChange: (interval: number) => void,
    onClose: () => void;
}) => {
    return (
        <DialogContent className="max-w-2xl bg-black border-gray-800 text-white p-0">
            <DialogHeader className="p-4 border-b border-gray-700">
                <DialogTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5" /> Player Settings
                </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-4">
                <Tabs defaultValue="playback" className="col-span-4 grid grid-cols-4">
                     <TabsList className="col-span-1 flex flex-col h-auto bg-transparent p-2 gap-1 self-start">
                        <TabsTrigger value="playback" className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                            <Play className="h-5 w-5" /> Playback
                        </TabsTrigger>
                        <TabsTrigger value="quality" className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                            <SlidersHorizontal className="h-5 w-5" /> Quality
                        </TabsTrigger>
                    </TabsList>
                    <div className="col-span-3 p-2">
                        <TabsContent value="playback" className="mt-0 space-y-2">
                            <div className="p-4 rounded-lg bg-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="font-semibold">Playback speed</Label>
                                        <div className="text-xs text-gray-400">Adjust speed for time-shifted viewing</div>
                                    </div>
                                    <Select defaultValue={`${playbackRate}`} onValueChange={(val) => onPlaybackRateChange(parseFloat(val))}>
                                        <SelectTrigger className="w-28 bg-gray-800 border-gray-600">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0.5">0.5x</SelectItem>
                                            <SelectItem value="1">1.0x</SelectItem>
                                            <SelectItem value="1.5">1.5x</SelectItem>
                                            <SelectItem value="2">2.0x</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="font-semibold">Skip intervals</Label>
                                        <div className="text-xs text-gray-400">Controls skip forward/back duration</div>
                                    </div>
                                    <Select defaultValue={`${skipInterval}`} onValueChange={(val) => onSkipIntervalChange(parseInt(val))}>
                                        <SelectTrigger className="w-28 bg-gray-800 border-gray-600">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5 sec</SelectItem>
                                            <SelectItem value="10">10 sec</SelectItem>
                                            <SelectItem value="15">15 sec</SelectItem>
                                            <SelectItem value="30">30 sec</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="font-semibold">Low-latency mode</Label>
                                        <div className="text-xs text-gray-400">Prioritize live edge over quality</div>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="font-semibold">Auto-play next live</Label>
                                        <div className="text-xs text-gray-400">Join the next scheduled live automatically</div>
                                    </div>
                                    <Switch />
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5">
                                 <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="font-semibold">Audio output</Label>
                                        <div className="text-xs text-gray-400">Choose output device</div>
                                    </div>
                                    <Select defaultValue="system">
                                        <SelectTrigger className="w-36 bg-gray-800 border-gray-600">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="system">System default</SelectItem>
                                            <SelectItem value="headphones">Headphones</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>
                         <TabsContent value="quality" className="mt-0 space-y-2">
                             <div className="p-4 rounded-lg bg-white/5">
                                <Label className="font-semibold">Streaming quality</Label>
                                <div className="text-xs text-gray-400 mb-4">Optimize for network or pick a fixed resolution</div>
                                <RadioGroup defaultValue="auto">
                                    <div className="space-y-2">
                                        <Label className="flex items-center justify-between p-3 rounded-md has-[:checked]:bg-white/10 has-[:checked]:border-blue-500 border border-transparent hover:bg-white/5 cursor-pointer">
                                            <div>
                                                <div>Auto <Badge className="ml-2 bg-blue-600">LIVE</Badge></div>
                                                <div className="text-xs text-gray-400">Adaptive bitrate (recommended)</div>
                                            </div>
                                            <RadioGroupItem value="auto" />
                                        </Label>
                                        <Label className="flex items-center justify-between p-3 rounded-md has-[:checked]:bg-white/10 has-[:checked]:border-blue-500 border border-transparent hover:bg-white/5 cursor-pointer">
                                            <div>1080p • High</div>
                                            <RadioGroupItem value="1080p" />
                                        </Label>
                                         <Label className="flex items-center justify-between p-3 rounded-md has-[:checked]:bg-white/10 has-[:checked]:border-blue-500 border border-transparent hover:bg-white/5 cursor-pointer">
                                            <div>720p • Medium</div>
                                            <RadioGroupItem value="720p" />
                                        </Label>
                                         <Label className="flex items-center justify-between p-3 rounded-md has-[:checked]:bg-white/10 has-[:checked]:border-blue-500 border border-transparent hover:bg-white/5 cursor-pointer">
                                            <div>480p • Data saver</div>
                                            <RadioGroupItem value="480p" />
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                             <div className="p-4 rounded-lg bg-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="font-semibold">Data saver mode</Label>
                                        <div className="text-xs text-gray-400">Reduce bitrate to minimize usage</div>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="font-semibold">HDR</Label>
                                        <div className="text-xs text-gray-400">Enable if display supports HDR</div>
                                    </div>
                                    <Switch />
                                </div>
                            </div>
                             <div className="p-4 rounded-lg bg-white/5">
                                 <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="font-semibold">Max resolution on mobile data</Label>
                                        <div className="text-xs text-gray-400">Applies when not on Wi-Fi</div>
                                    </div>
                                    <Select defaultValue="720p">
                                        <SelectTrigger className="w-28 bg-gray-800 border-gray-600">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1080p">1080p</SelectItem>
                                            <SelectItem value="720p">720p</SelectItem>
                                            <SelectItem value="480p">480p</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
             <DialogFooter className="p-4 border-t border-gray-700">
                <DialogClose asChild>
                    <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={onClose}>Done</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
};

const renderContentWithHashtags = (text: string) => {
    if (!text) return text;
    const parts = text.split(/(@\w+|#\w+)/g);
    return parts.map((part, index) => {
        if (part.startsWith('#')) {
            return <Link key={index} href={`/feed?hashtag=${part.substring(1)}`} className="text-primary hover:underline">{part}</Link>;
        }
        if (part.startsWith('@')) {
             return <span key={index} className="text-blue-500 font-semibold">{part}</span>;
        }
        return part;
    });
};

const ChatMessageContent = React.memo(({ msg, index, handlers, post, pinnedMessages }: { msg: any; index: number, handlers: any, post: any, pinnedMessages: any[] }) => {
    const { user } = useAuth();
    if (msg.type === 'system') {
        return <p key={msg.id || index} className="text-xs text-muted-foreground text-center italic">{msg.text}</p>;
    }
    
    if (msg.type === 'auction_end') {
         return (
            <Card key={msg.id || index} className="bg-yellow-500/10 border-yellow-500/30 my-2 text-yellow-200">
                <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                         <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.winnerAvatar} />
                            <AvatarFallback>{msg.winner.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="text-xs font-bold text-yellow-400">Auction Ended!</p>
                            <p className="font-semibold text-white">
                                {msg.winner} won {msg.productName} for {msg.winningBid}!
                            </p>
                        </div>
                        <Award className="h-6 w-6 text-yellow-400" />
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (msg.isBid) {
        return (
             <Card key={msg.id || index} className="bg-green-900/20 border-green-500/30 my-2 text-green-200">
                <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.avatar} />
                            <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="text-xs">{msg.user} placed a bid!</p>
                            <p className="font-bold text-lg text-white">{msg.text.replace('BID ', '')}</p>
                        </div>
                        <Gavel className="h-6 w-6 text-green-400" />
                    </div>
                </CardContent>
            </Card>
        );
    }
    if (msg.user) {
        const isPostAuthor = user?.uid === post.sellerId;

        return (
            <div key={msg.id || index} className="text-sm group relative">
                <div className="flex items-start gap-2 w-full group">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={msg.avatar} />
                        <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <span className={cn("font-semibold pr-1 text-xs", msg.isSeller && "text-amber-400")}>
                            {msg.user.split(' ')[0]}
                            {msg.isSeller && (
                                <Badge variant="secondary" className="ml-1 text-amber-400 border-amber-400/50">
                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                    Admin
                                </Badge>
                            )}
                        </span>
                        <span className={cn("text-foreground break-words")}>{renderContentWithHashtags(msg.text)}</span>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handlers.onReply({ name: msg.user, id: msg.userId })}>Reply</DropdownMenuItem>
                            {isPostAuthor && <DropdownMenuItem onSelect={() => handlers.onTogglePinMessage(msg.id)}><Pin className="mr-2 h-4 w-4" />{pinnedMessages.some(p => p.id === msg.id) ? "Unpin" : "Pin"} Message</DropdownMenuItem>}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => handlers.onReportMessage(msg.id)} className="text-destructive"><Flag className="mr-2 h-4 w-4" />Report</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        );
    }
    return null;
});
ChatMessageContent.displayName = 'ChatMessageContent';

const formatAuctionTime = (seconds: number | null) => {
    if (seconds === null || seconds < 0) return '00:00';
    if (seconds === 0) return 'Ended';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const AuctionCard = React.memo(({
    auction,
    auctionTime,
    highestBid,
    totalBids,
    handlePlaceBid,
    walletBalance,
    bidAmount,
    setBidAmount,
    isPinned = false,
}: {
    auction: any,
    auctionTime: number | null,
    highestBid: number,
    totalBids: number,
    handlePlaceBid: () => void,
    walletBalance: number,
    bidAmount: number | string,
    setBidAmount: (value: number | string) => void,
    isPinned?: boolean,
}) => {
    const isAuctionActive = auction.active && auctionTime !== null && auctionTime > 0;
    const product = productDetails[auction.productId as keyof typeof productDetails];
    
    if (!product) return null;

    const recentBids = useMemo(() => {
        return mockChatMessages.filter(m => m.isBid && m.type !== 'auction_end').reverse();
    }, []);

    return (
        <div>
            <Collapsible defaultOpen={isPinned}>
                <Card className={cn(
                    "text-white", 
                    isAuctionActive ? "bg-blue-900/20 border-blue-500/30" : "bg-gray-800/20 border-gray-700/50"
                )}>
                    <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-muted rounded-md relative overflow-hidden flex-shrink-0">
                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                {!isAuctionActive && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <p className="font-bold text-white text-lg -rotate-12 transform">Timed Out</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-center">
                                    <Badge className={cn("text-xs", isAuctionActive ? "bg-blue-500 animate-pulse" : "bg-gray-500")}>AUCTION</Badge>
                                    <Badge variant="secondary" className="font-mono text-white">{formatAuctionTime(auctionTime)}</Badge>
                                </div>
                                <h4 className="font-bold leading-tight mt-1 text-white">{product.name}</h4>
                                <div className="grid grid-cols-2 gap-x-2 text-xs mt-1">
                                    <div className="text-gray-300">Current Bid: <span className="font-bold text-white">₹{highestBid.toLocaleString()}</span></div>
                                    <div className="text-gray-300">Bids: <span className="font-bold text-white">{totalBids}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white" disabled={!isAuctionActive}>
                                        <Gavel className="w-4 h-4 mr-2"/>
                                        Place Your Bid
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md bg-background border-border">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold">Place a Bid for {product.name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4 space-y-4">
                                        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                                            <Image src={product.images[0]} alt={product.name} width={64} height={64} className="rounded-md" />
                                            <div className="flex-grow">
                                                <h4 className="font-semibold">{product.name}</h4>
                                                <p className="text-sm text-muted-foreground">by {productToSellerMapping[product.key as keyof typeof productToSellerMapping]?.name}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Wallet Balance</Label>
                                                <p className="text-lg font-bold flex items-center justify-center gap-1"><Wallet className="h-4 w-4" />₹{(walletBalance).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Current Highest Bid</Label>
                                                <p className="text-lg font-bold">₹{highestBid.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="bid-amount" className="text-sm font-medium">Your Bid (must be > ₹{highestBid.toLocaleString()})</Label>
                                            <div className="relative mt-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                                <Input
                                                    id="bid-amount"
                                                    type="number"
                                                    placeholder="Enter your bid"
                                                    className="pl-7 h-11 text-base"
                                                    value={bidAmount}
                                                    onChange={(e) => setBidAmount(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button variant="outline" onClick={() => setBidAmount(prev => Number(prev || highestBid) + 100)}>+100</Button>
                                            <Button variant="outline" onClick={() => setBidAmount(prev => Number(prev || highestBid) + 500)}>+500</Button>
                                            <Button variant="outline" onClick={() => setBidAmount(prev => Number(prev || highestBid) + 1000)}>+1000</Button>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="flex justify-between gap-2">
                                                <DialogClose asChild>
                                                    <Button type="button" variant="ghost" className="w-full">Cancel</Button>
                                                </DialogClose>
                                                <Button onClick={handlePlaceBid} className="w-full bg-blue-600 hover:bg-blue-700">
                                                    <Gavel className="mr-2 h-4 w-4" />
                                                    Confirm Bid
                                                </Button>
                                            </div>
                                            <p className="text-xs text-left text-muted-foreground pt-2">Note: Your bid amount will be held and automatically refunded if you do not win the auction.</p>
                                        </div>
                                    </DialogFooter>
                                    <DialogClose asChild>
                                        <button id="closeBidDialog" className="hidden"></button>
                                    </DialogClose>
                                </DialogContent>
                            </Dialog>
                            {!isPinned && (
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-blue-300 hover:bg-blue-900/40 hover:text-blue-200">
                                        <ChevronDown className="w-5 h-5"/>
                                    </Button>
                                </CollapsibleTrigger>
                            )}
                        </div>
                    </CardContent>
                    {!isPinned && (
                        <CollapsibleContent>
                            <div className="p-3 border-t border-blue-500/30">
                                <h5 className="font-semibold text-xs mb-2">Recent Bids</h5>
                                <div className="space-y-2 max-h-24 overflow-y-auto thin-scrollbar">
                                    {recentBids.map(bid => (
                                        <div key={bid.id} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-5 h-5">
                                                    <AvatarImage src={bid.avatar} />
                                                    <AvatarFallback>{bid.user.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>{bid.user}</span>
                                            </div>
                                            <span className="font-bold text-white">{bid.text.replace('BID ', '')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CollapsibleContent>
                    )}
                </Card>
            </Collapsible>
        </div>
    );
});
AuctionCard.displayName = 'AuctionCard';


export default function StreamPage() {
    const router = useRouter();
    const params = useParams();
    const streamId = params.streamId as string;
    const { user } = useAuth();
    const { toast } = useToast();
    const [walletBalance, setWalletBalance] = useState(42580.22);
    const [bidAmount, setBidAmount] = useState<number | string>("");
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [bankAccounts, setBankAccounts] = useState([
        { id: 1, bankName: 'HDFC Bank', accountNumber: 'XXXX-XXXX-XX12-3456' },
    ]);
    const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
    
    const [chatMessages, setChatMessages] = useState(mockChatMessages);
    const [auctionTime, setAuctionTime] = useState<number | null>(null);
    const [highestBid, setHighestBid] = useState<number>(9600);
    const [totalBids, setTotalBids] = useState<number>(4);
    
    const activeAuction = useMemo(() => chatMessages.find(msg => msg.type === 'auction' && msg.active), [chatMessages]);

    const isAuctionActive = useMemo(() => auctionTime !== null && auctionTime > 0, [auctionTime]);
    
    const mockStreamData = {
        id: streamId,
        title: "Live Shopping Event",
        description: "Join us for exclusive deals and a first look at our new collection! #fashion #live",
        status: "live",
        startedAt: new Timestamp(Math.floor(Date.now() / 1000) - 300, 0), // 5 minutes ago
        viewerCount: 12400,
        streamUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    };

    const streamData = mockStreamData;
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const progressContainerRef = useRef<HTMLDivElement>(null);
    
    const [isPaused, setIsPaused] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [skipInterval, setSkipInterval] = useState(10);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [isProductListVisible, setIsProductListVisible] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ name: string; id: string } | null>(null);
    
    const seller = useMemo(() => liveSellers.find(s => s.id === streamId), [streamId]);
    const product = productDetails[seller?.productId as keyof typeof productDetails];
    
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

     const sellerProducts = useMemo(() => {
        if (!seller) return [];
        const allProducts = Object.values(productDetails)
        return allProducts.filter(p => productToSellerMapping[p.key]?.name === seller.name && p.stock > 0)
    }, [seller]);
    
    const relatedStreams = useMemo(() => {
        if (!product) return [];
        let streams = liveSellers.filter(
            s => s.category === product.category && s.productId !== product.key
        );
        if (streams.length > 5) {
            return streams.slice(0, 6);
        }
        const fallbackStreams = liveSellers.filter(s => s.productId !== product.key);
        
        let i = 0;
        while(streams.length < 6 && i < fallbackStreams.length) {
            if (!streams.some(s => s.id === fallbackStreams[i].id)) {
                streams.push(fallbackStreams[i]);
            }
            i++;
        }
        return streams.slice(0,6);
    }, [product]);
    
    const formatTime = (timeInSeconds: number) => {
        if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
        const date = new Date(0);
        date.setSeconds(timeInSeconds);
        const timeString = date.toISOString().substr(11, 8);
        return timeString.startsWith('00:') ? timeString.substr(3) : timeString;
    };
    
    useEffect(() => {
        if (activeAuction) {
            setAuctionTime(activeAuction.initialTime);
        } else {
            setAuctionTime(null);
        }
    }, [activeAuction]);
    
    useEffect(() => {
        if (auctionTime !== null && auctionTime > 0) {
            const timer = setInterval(() => {
                setAuctionTime(prev => (prev ? prev - 1 : null));
            }, 1000);
            return () => clearInterval(timer);
        } else if (auctionTime === 0 && activeAuction) {
             const winningBid = [...chatMessages].reverse().find(m => m.isBid);
             if (winningBid) {
                 const winnerMessage = {
                     id: Date.now(),
                     type: 'auction_end',
                     winner: winningBid.user,
                     winnerAvatar: winningBid.avatar,
                     winningBid: winningBid.text.replace('BID ', ''),
                     productName: productDetails[activeAuction.productId as keyof typeof productDetails].name,
                 };
                 setChatMessages(prev => [...prev, winnerMessage]);
             } else {
                  const noWinnerMessage = {
                     id: Date.now(),
                     type: 'system',
                     text: `The auction for ${productDetails[activeAuction.productId as keyof typeof productDetails].name} has ended with no bids.`,
                 };
                 setChatMessages(prev => [...prev, noWinnerMessage]);
             }
             setAuctionTime(null);
             setChatMessages(prev => prev.map(msg => msg.id === activeAuction.id ? {...msg, active: false} : msg));
        }
    }, [auctionTime, activeAuction, chatMessages]);

    const handlePlayPause = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().catch(console.error);
        } else {
            video.pause();
        }
    }, []);

    const handleSeek = useCallback((direction: 'forward' | 'backward') => {
        const video = videoRef.current;
        if (!video) return;
        const newTime = direction === 'forward' ? video.currentTime + skipInterval : video.currentTime - skipInterval;
        video.currentTime = Math.max(0, Math.min(duration, newTime));
    }, [duration, skipInterval]);
    
    const handleGoLive = () => {
        const video = videoRef.current;
        if (video) {
            video.currentTime = duration;
        }
    };
    
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        const progressContainer = progressContainerRef.current;
        if (!video || !progressContainer) return;

        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        const newTime = duration * percentage;
        
        video.currentTime = newTime;
    };
    
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const updateProgress = () => {
                setCurrentTime(video.currentTime);
                if (video.buffered.length > 0) {
                    setBuffered(video.buffered.end(video.buffered.length - 1));
                }
                const isCurrentlyLive = (video.duration - video.currentTime) < 2;
                setIsLive(isCurrentlyLive);
                
                if (isCurrentlyLive && video.playbackRate !== 1) {
                    video.playbackRate = 1;
                    setPlaybackRate(1);
                }
            };
            const setVideoDuration = () => setDuration(video.duration);
            const onPlay = () => setIsPaused(false);
            const onPause = () => setIsPaused(true);

            video.addEventListener("timeupdate", updateProgress);
            video.addEventListener("progress", updateProgress);
            video.addEventListener("loadedmetadata", setVideoDuration);
            video.addEventListener("play", onPlay);
            video.addEventListener("pause", onPause);

            video.muted = true;
            video.play().catch(() => {
                setIsPaused(true);
            });

            return () => {
                video.removeEventListener("timeupdate", updateProgress);
                video.removeEventListener("progress", updateProgress);
                video.removeEventListener("loadedmetadata", setVideoDuration);
                video.removeEventListener("play", onPlay);
                video.removeEventListener("pause", onPause);
            };
        }
    }, [duration]);
    
    const handlePlaybackRateChange = (rate: number) => {
        const video = videoRef.current;
        if (video) {
            if (!isLive) {
                video.playbackRate = rate;
                setPlaybackRate(rate);
            } else {
                toast({
                    title: "Live Playback",
                    description: "Playback speed can only be changed when you are behind the live broadcast.",
                });
            }
        }
    };
    
    const handleSkipIntervalChange = (interval: number) => {
        setSkipInterval(interval);
    };


    const handleReply = (msgUser: { name: string; id: string }) => {
        if(user?.uid === msgUser.id) return;
        setReplyingTo(msgUser);
        setNewMessage(`@${msgUser.name} `);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };
    
    const handleAutoScroll = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        handleAutoScroll();
    }, [chatMessages, handleAutoScroll]);

    const handleNewMessageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        
        const newMsg: any = {
            id: Date.now(),
            user: user?.displayName?.split(' ')[0] || 'You',
            userId: user?.uid,
            text: newMessage,
            avatar: user?.photoURL || 'https://placehold.co/40x40.png',
            userColor: user?.color || '#ffffff'
        };

        setChatMessages(prev => [...prev, newMsg]);
        setNewMessage("");
        setReplyingTo(null);
    };

    const handleReportMessage = (messageId: number) => {
        toast({
            title: "Message Reported",
            description: "The message has been reported and will be reviewed by our moderation team.",
        });
    };
    
    const handleAddToCart = (product: any) => {
      if (product) {
        addToCart({ ...product, quantity: 1 });
        toast({
          title: "Added to Cart!",
          description: `'${product.name}' has been added to your shopping cart.`,
        });
      }
    };
    const handleBuyNow = (product: any) => {
      if (product) {
        router.push(`/cart?buyNow=true&productId=${product.key}`);
      }
    };
    
    const addEmoji = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
    };

    const removeMedia = (index: number) => {
        // Dummy function
    }

    const handleWithdraw = (amount: number, bankAccountId: string) => {
        const selectedAccount = bankAccounts.find(acc => String(acc.id) === bankAccountId);
        const cashAvailable = walletBalance - 2640; // Mock blocked margin
        if (amount > cashAvailable) {
           toast({
               variant: 'destructive',
               title: 'Insufficient Balance',
               description: 'You do not have enough funds to complete this withdrawal.'
           });
           return;
        }
        setWalletBalance(prev => prev - amount);
        toast({
           title: "Withdrawal Initiated!",
           description: `₹${amount} is on its way to ${selectedAccount?.bankName}.`,
       });
        setIsWithdrawOpen(false);
     };
    
    const handleShare = () => {};

     const handleTogglePinMessage = (msgId: number) => {
        const msg = chatMessages.find(m => m.id === msgId);
        if (!msg) return;

        const isProductPin = msg.type === 'product_pin';
        const isOfferPin = msg.type === 'offer_pin';

        let itemToPin:any = {};

        if (isProductPin) {
             itemToPin = { 
                id: msg.id, 
                type: 'product',
                product: productDetails['prod_1']
            };
        } else if (isOfferPin) {
             itemToPin = { 
                id: msg.id,
                type: 'offer',
                title: '🎉 Special Offer!',
                description: 'Use code LIVE10 for 10% off your entire order.'
            };
        } else {
             itemToPin = { 
                id: msg.id,
                type: 'message',
                user: msg.user,
                text: msg.text
            };
        }
        
        setPinnedMessages(prev =>
            prev.some(p => p.id === msgId)
                ? prev.filter(p => p.id !== msgId)
                : [itemToPin, ...prev]
        );

        toast({
            title: pinnedMessages.some(p => p.id === msgId) ? "Message Unpinned" : "Message Pinned",
            description: "The message has been updated in the pinned items."
        });
    };
    
    const handlePlaceBid = () => {
        if (!activeAuction) return;

        const bidValue = Number(bidAmount);
        if (bidValue <= highestBid) {
            toast({ variant: 'destructive', title: 'Invalid Bid', description: `Your bid must be higher than the current bid of ₹${highestBid.toLocaleString()}.` });
            return;
        }
        if (bidValue > walletBalance) {
            toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Your bid exceeds your wallet balance.' });
            return;
        }

        const newMsg: any = {
            id: Date.now(),
            user: user?.displayName?.split(' ')[0] || 'You',
            userId: user?.uid,
            text: `BID ₹${bidValue.toLocaleString()}`,
            avatar: user?.photoURL || 'https://placehold.co/40x40.png',
            userColor: '#ffffff',
            isBid: true,
        };

        setChatMessages(prev => [...prev, newMsg]);
        setHighestBid(bidValue);
        setTotalBids(prev => prev + 1);
        setWalletBalance(prev => prev - bidValue);
        setBidAmount("");
        document.getElementById('closeBidDialog')?.click();
        
        toast({ title: 'Bid Placed!', description: `Your bid of ₹${bidValue.toLocaleString()} has been placed.` });
    };

    const handlers = { onReply: handleReply, onTogglePinMessage: handleTogglePinMessage, onReportMessage: handleReportMessage };

    const memoizedChatMessages = useMemo(() => {
        return chatMessages.map((msg, index) => {
            if (msg.type === 'auction') {
                return (
                    <div key={msg.id} className="my-2">
                        <AuctionCard
                            auction={msg}
                            auctionTime={activeAuction?.id === msg.id ? auctionTime : 0}
                            highestBid={highestBid}
                            totalBids={totalBids}
                            handlePlaceBid={handlePlaceBid}
                            walletBalance={walletBalance}
                            bidAmount={bidAmount}
                            setBidAmount={setBidAmount}
                        />
                    </div>
                );
            }
            return (
                <ChatMessageContent
                    key={msg.id || index}
                    msg={msg}
                    index={index}
                    handlers={handlers}
                    post={{ sellerId: seller?.id, avatarUrl: seller?.avatarUrl, sellerName: seller?.name }}
                    pinnedMessages={pinnedMessages}
                />
            );
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatMessages, seller, pinnedMessages, auctionTime, highestBid, totalBids, bidAmount, walletBalance, activeAuction]);

    return (
        <React.Fragment>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <AlertDialog>
                    <div className="h-dvh w-full flex flex-col bg-background text-foreground">
                        <header className="flex-shrink-0 h-16 bg-background border-b border-border flex items-center justify-between px-4 z-40">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                                    <ArrowLeft />
                                </Button>
                                <Link href="/live-selling" className="flex items-center gap-2">
                                    <Logo className="h-7 w-7" />
                                    <span className="font-bold text-lg hidden sm:inline-block">StreamCart</span>
                                </Link>
                            </div>
                            <div className="relative w-full max-w-md mx-4 hidden lg:block">
                                <Input placeholder="Search..." className="rounded-full bg-muted pr-10" />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button asChild variant="ghost">
                                    <Link href="/cart">
                                        <ShoppingCart className="mr-2" />
                                        My Cart
                                    </Link>
                                </Button>
                            </div>
                        </header>

                        <div className="flex flex-1 overflow-hidden">
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                <div className="w-full aspect-video bg-black relative group flex-shrink-0" ref={playerRef}>
                                    <video ref={videoRef} src={streamData.streamUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} className="w-full h-full object-cover" loop />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/60 flex flex-col p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="flex items-center justify-between">
                                            <h1 className="font-bold text-lg hidden sm:block text-white">{streamData.title || "Live Event"}</h1>
                                            <Badge variant="secondary" className="gap-1.5">
                                                <Users className="h-3 w-3" /> {Math.round(streamData.viewerCount / 1000)}K watching
                                            </Badge>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center gap-4 sm:gap-8 text-white">
                                            <Button variant="ghost" size="icon" className="w-14 h-14" onClick={() => handleSeek('backward')}><Rewind className="w-8 h-8" /></Button>
                                            <Button variant="ghost" size="icon" className="w-20 h-20" onClick={handlePlayPause}>
                                                {isPaused ? <Play className="w-12 h-12 fill-current" /> : <Pause className="w-12 h-12 fill-current" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-14 h-14" onClick={() => handleSeek('forward')}><FastForward className="w-8 h-8" /></Button>
                                        </div>
                                        <div className="space-y-3 text-white">
                                            <div className="w-full cursor-pointer py-1" ref={progressContainerRef} onClick={handleProgressClick}>
                                                <Progress value={(currentTime / duration) * 100} valueBuffer={(buffered / duration) * 100} isLive={isLive} className="h-2" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 sm:gap-4">
                                                    <Button
                                                        variant="destructive"
                                                        className="gap-1.5 h-8 text-xs sm:text-sm"
                                                        onClick={handleGoLive}
                                                        disabled={isLive}
                                                    >
                                                        <div className={cn("h-2 w-2 rounded-full bg-white", !isLive && "animate-pulse")} />
                                                        LIVE
                                                    </Button>
                                                    {!isLive && (
                                                        <div className="text-xs text-yellow-400 font-semibold">
                                                            You are {formatTime(duration - currentTime)} behind
                                                        </div>
                                                    )}
                                                    <Button variant="ghost" size="icon" onClick={() => setIsMuted(prev => !prev)}>
                                                        {isMuted ? <VolumeX /> : <Volume2 />}
                                                    </Button>
                                                    <p className="text-sm font-mono">{formatTime(currentTime)}</p>
                                                </div>
                                                <div className="flex items-center gap-1 sm:gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => videoRef.current?.requestPictureInPicture()}><PictureInPicture /></Button>
                                                    <Button variant="ghost" size="icon" onClick={handleShare}><Share2 /></Button>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon"><Settings /></Button>
                                                    </DialogTrigger>
                                                    <Button variant="ghost" size="icon" onClick={() => playerRef.current?.requestFullscreen()}><Maximize /></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="mb-4">
                                        <h2 className="font-bold text-xl">{streamData.title || "Live Stream"}</h2>
                                        <div className="text-sm text-muted-foreground">{renderContentWithHashtags(streamData.description) || "Welcome to the live stream!"}</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Collapsible className="w-full">
                                            <div className="flex items-center gap-3">
                                                {seller && (
                                                    <>
                                                        <Avatar>
                                                            <AvatarImage src={seller.avatarUrl} />
                                                            <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <h3 className="font-semibold">{seller.name}</h3>
                                                        <Button variant="secondary" size="sm" className="h-7">
                                                            <UserPlus className="mr-1.5 h-4 w-4" /> Follow
                                                        </Button>
                                                        <CollapsibleTrigger asChild>
                                                            <Button variant="outline" size="sm" className="h-7 gap-1.5">
                                                                <ShoppingBag className="w-4 h-4" /> View Products ({sellerProducts.length})
                                                            </Button>
                                                        </CollapsibleTrigger>
                                                    </>
                                                )}
                                            </div>
                                            <CollapsibleContent className="mt-4">
                                                <div className="relative">
                                                    <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                                                        <CarouselContent className="-ml-2">
                                                            {sellerProducts.map((p, index) => (
                                                                <CarouselItem key={index} className="pl-2 basis-auto">
                                                                    <div className="w-32">
                                                                        <Card className="h-full flex flex-col overflow-hidden bg-card text-card-foreground">
                                                                            <Link href={`/product/${p.key}`}>
                                                                                <div className="aspect-square bg-muted rounded-t-lg relative">
                                                                                    <Image src={(p.images && p.images[0]?.preview) || p.images[0]} alt={p.name} fill className="object-cover" />
                                                                                    {p.stock === 0 && (
                                                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                                            <Badge variant="destructive">Out of Stock</Badge>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="p-1.5">
                                                                                    <p className="text-[11px] font-semibold truncate leading-tight">{p.name}</p>
                                                                                    <p className="text-xs font-bold">₹{p.price.toLocaleString()}</p>
                                                                                </div>
                                                                            </Link>
                                                                            <CardFooter className="p-1.5 mt-auto grid grid-cols-2 gap-1">
                                                                                {p.stock > 0 ? (
                                                                                    <>
                                                                                        <Button size="xs" className="w-full text-[10px] h-7" variant="secondary" onClick={() => handleAddToCart(p)}>Add</Button>
                                                                                        <Button size="xs" className="w-full text-[10px] h-7" onClick={() => handleBuyNow(p)}>Buy</Button>
                                                                                    </>
                                                                                ) : (
                                                                                    <Button size="xs" className="w-full text-[10px] h-7 col-span-2" variant="outline" disabled>Out of Stock</Button>
                                                                                )}
                                                                            </CardFooter>
                                                                        </Card>
                                                                    </div>
                                                                </CarouselItem>
                                                            ))}
                                                        </CarouselContent>
                                                    </Carousel>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </div>

                                    <div className="mt-8">
                                        <h4 className="font-semibold mb-4">Related Streams</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {relatedStreams.map((s: any) => (
                                                <Link href={`/stream/${s.id}`} key={s.id} className="group">
                                                    <div className="relative rounded-lg overflow-hidden aspect-[16/9] bg-muted">
                                                        <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                                                        <div className="absolute top-2 right-2 z-10">
                                                            <Badge variant="secondary" className="bg-background/60 backdrop-blur-sm gap-1.5">
                                                                <Users className="h-3 w-3"/>
                                                                {s.viewers}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2 mt-2">
                                                        <Avatar className="w-7 h-7">
                                                            <AvatarImage src={s.avatarUrl} alt={s.name} />
                                                            <AvatarFallback>{s.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <p className="font-semibold text-xs group-hover:underline truncate">{s.name}</p>
                                                                {s.hasAuction && (
                                                                    <Badge variant="purple" className="text-xs font-bold px-1.5 py-0">
                                                                        Auction
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">{s.category}</p>
                                                            <p className="text-xs text-primary font-semibold mt-0.5 sm:hidden lg:block">#{s.category.toLowerCase()}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:flex w-[340px] flex-shrink-0 h-full flex-col bg-card">
                                <div className="p-4 flex items-center justify-between z-10 flex-shrink-0 h-16 border-b">
                                    <h3 className="font-bold text-lg">Live Chat</h3>
                                    <div className="flex items-center gap-1">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Wallet className="h-5 w-5 text-muted-foreground" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent align="end" className="w-80">
                                                <div className="p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-semibold">My Wallet</h4>
                                                        <Button variant="link" size="sm" asChild className="p-0 h-auto">
                                                            <Link href="/wallet">More Details</Link>
                                                        </Button>
                                                    </div>
                                                    <div className="p-3 rounded-lg bg-muted/50 border">
                                                        <p className="text-xs text-muted-foreground">Available Balance</p>
                                                        <p className="text-2xl font-bold">₹{walletBalance.toFixed(2)}</p>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground space-y-1 mt-2">
                                                        <div className="flex justify-between"><span>Blocked Margin:</span> <span className="font-medium text-foreground">₹2,640.00</span></div>
                                                        <div className="flex justify-between"><span>StreamCart Coins:</span> <span className="font-medium text-foreground">1,250</span></div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 pt-4">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm"><Plus className="mr-1.5 h-4 w-4" /> Deposit</Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Add Funds via UPI</DialogTitle>
                                                                    <DialogDescription>Scan the QR code with any UPI app to add funds to your wallet.</DialogDescription>
                                                                </DialogHeader>
                                                                <div className="flex flex-col items-center gap-4 py-4">
                                                                    <div className="bg-white p-4 rounded-lg">
                                                                        <Image src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=streamcart@mock" alt="UPI QR Code" width={200} height={200} />
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">or pay to UPI ID:</p>
                                                                    <p className="font-semibold">streamcart@mock</p>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                        <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm"><Download className="mr-1.5 h-4 w-4" /> Withdraw</Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Withdraw Funds</DialogTitle>
                                                                    <DialogDescription>Select an account and enter the amount you wish to withdraw.</DialogDescription>
                                                                </DialogHeader>
                                                                <WithdrawForm cashAvailable={walletBalance - 2640} bankAccounts={bankAccounts} onWithdraw={handleWithdraw} onAddAccount={(newAccount) => { setBankAccounts(prev => [...prev, { ...newAccount, id: Date.now() }]); toast({ title: "Bank Account Added!", description: "You can now select it for withdrawals." }); }} />
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                                                    <Pin className="h-5 w-5 text-muted-foreground" />
                                                    {pinnedMessages.length > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent align="end" className="w-80 p-0">
                                                <div className="p-3 border-b">
                                                    <h4 className="font-semibold">Pinned Items</h4>
                                                </div>
                                                <ScrollArea className="h-64">
                                                    <div className="p-3 space-y-3">
                                                        <Card className="bg-primary/10 border-primary/20">
                                                            <CardContent className="p-3">
                                                                <div className="flex items-start gap-3">
                                                                    <Ticket className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                                                    <div>
                                                                        <p className="text-xs font-semibold">🎉 Special Offer!</p>
                                                                        <p className="text-sm">Use code <span className="font-bold text-primary">LIVE10</span> for 10% off your entire order.</p>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                        <Card className="overflow-hidden">
                                                            <CardContent className="p-0">
                                                                <div className="p-3">
                                                                    <p className="text-xs text-muted-foreground font-semibold">Featured Product</p>
                                                                    <div className="flex items-center gap-3 mt-1">
                                                                        <div className="w-12 h-12 bg-muted rounded-md relative overflow-hidden flex-shrink-0">
                                                                            <Image src={productDetails['prod_1'].images[0]} alt={productDetails['prod_1'].name} fill className="object-cover" />
                                                                        </div>
                                                                        <div className="flex-grow">
                                                                            <h4 className="font-semibold leading-tight text-sm">{productDetails['prod_1'].name}</h4>
                                                                            <p className="text-sm font-bold">{productDetails['prod_1'].price}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <CardFooter className="p-0">
                                                                    <Button asChild variant="secondary" className="w-full rounded-none rounded-b-lg h-9">
                                                                        <Link href={`/product/${productDetails['prod_1'].key}`}>View Product</Link>
                                                                    </Button>
                                                                </CardFooter>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                </ScrollArea>
                                            </PopoverContent>
                                        </Popover>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <FeedbackDialog>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <MessageCircle className="mr-2 h-4 w-4" /> Feedback
                                                    </DropdownMenuItem>
                                                </FeedbackDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                        <Flag className="mr-2 h-4 w-4" /> Report Stream
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                
                                <div className="relative flex-1 flex flex-col overflow-hidden">
                                     {isAuctionActive && (
                                        <div className="p-4 border-b border-border/50 bg-card z-20 shadow-lg">
                                            <AuctionCard
                                                auction={activeAuction}
                                                auctionTime={auctionTime}
                                                highestBid={highestBid}
                                                totalBids={totalBids}
                                                handlePlaceBid={handlePlaceBid}
                                                walletBalance={walletBalance}
                                                bidAmount={bidAmount}
                                                setBidAmount={setBidAmount}
                                                isPinned={true}
                                            />
                                        </div>
                                    )}
                                    <ScrollArea className="flex-1" ref={chatContainerRef}>
                                        <div className="p-4 space-y-4">
                                            {memoizedChatMessages}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </ScrollArea>
                                    <div className="p-3 border-t bg-background flex-shrink-0">
                                        <form onSubmit={handleNewMessageSubmit} className="flex items-center gap-3">
                                            <div className="relative flex-grow">
                                                <Textarea ref={textareaRef} placeholder={replyingTo ? `@${replyingTo.name} ` : "Send a message..."} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="resize-none pr-10 rounded-2xl bg-muted border-transparent focus:border-primary focus:bg-background h-10 min-h-[40px] pt-2.5 text-sm" rows={1} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNewMessageSubmit(e); } }} />
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="icon" type="button" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-muted-foreground">
                                                            <Smile className="h-5 w-5" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-80 h-64 p-2">
                                                        <div className="grid grid-cols-8 gap-1 h-full overflow-y-auto no-scrollbar">
                                                            {emojis.map((emoji, index) => (
                                                                <Button key={index} variant="ghost" size="icon" onClick={() => addEmoji(emoji)} className="text-xl">
                                                                    {emoji}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <Button type="submit" size="icon" disabled={!newMessage.trim()} className="rounded-full flex-shrink-0 h-10 w-10">
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Report Stream</AlertDialogTitle>
                            <AlertDialogDescription>
                                Please let us know why you are reporting this stream. Your feedback helps us keep the community safe.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction>Submit Report</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <DialogContent className="max-w-2xl bg-black border-gray-800 text-white p-0">
                    <PlayerSettingsDialog
                        playbackRate={playbackRate}
                        onPlaybackRateChange={handlePlaybackRateChange}
                        skipInterval={skipInterval}
                        onSkipIntervalChange={handleSkipIntervalChange}
                        onClose={() => setIsSettingsOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}

    