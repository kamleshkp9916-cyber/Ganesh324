
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
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/hooks/use-auth';
import { ScrollArea } from "@/components/ui/scroll-area";
import { toggleFollow, getUserData } from "@/lib/follow-data";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { Slider } from "@/components/ui/slider";


const liveSellers = [
    { id: '1', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', viewers: 1200, productId: 'prod_1', hasAuction: true, category: 'Fashion', description: 'Showcasing our latest vintage-inspired summer collection. Exclusive deals for live viewers!' },
    { id: '2', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', viewers: 2500, productId: 'prod_2', hasAuction: false, category: 'Electronics', description: 'Unboxing the brand new SoundWave Pro 2 headphones. We will be testing the noise cancellation and battery life. Ask me anything!' },
    { id: '3', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', viewers: 850, productId: 'prod_3', hasAuction: false, category: 'Home Goods', description: 'Transform your living space with our new minimalist home decor items. Perfect for a modern aesthetic.' },
];

function formatTime(seconds: number) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function StreamPage() {
    const router = useRouter();
    const params = useParams();
    const streamId = params.streamId as string;
    const { user } = useAuth();
    
    // Using mock data directly
    const streamData = {
        id: streamId,
        title: "Live Shopping Event",
        status: "live",
        startedAt: new Timestamp(Math.floor(Date.now() / 1000) - 300, 0), // 5 minutes ago
        viewerCount: 12400,
        streamUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    };
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    
    const [isPaused, setIsPaused] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [controlsVisible, setControlsVisible] = useState(true);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPaused(false);
            } else {
                videoRef.current.pause();
                setIsPaused(true);
            }
        }
    };
    
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const updateProgress = () => setCurrentTime(video.currentTime);
            const setVideoDuration = () => setDuration(video.duration);
            const onPlay = () => setIsPaused(false);
            const onPause = () => setIsPaused(true);

            video.addEventListener("timeupdate", updateProgress);
            video.addEventListener("loadedmetadata", setVideoDuration);
            video.addEventListener("play", onPlay);
            video.addEventListener("pause", onPause);

            return () => {
                video.removeEventListener("timeupdate", updateProgress);
                video.removeEventListener("loadedmetadata", setVideoDuration);
                video.removeEventListener("play", onPlay);
                video.removeEventListener("pause", onPause);
            };
        }
    }, []);
    
    const elapsedTime = streamData?.startedAt ? (Date.now() - (streamData.startedAt as Timestamp).toDate().getTime()) / 1000 : currentTime;

    return (
        <div ref={playerRef} className="h-dvh w-full bg-black text-white flex items-center justify-center">
            <div className="w-full h-full relative">
                <video
                    ref={videoRef}
                    src={streamData.streamUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                    className="w-full h-full object-contain"
                    loop
                    onClick={handlePlayPause}
                />
                 <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/70 flex flex-col p-4"
                >
                    {/* Top Bar */}
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Button variant="ghost" size="sm" className="bg-black/30 hover:bg-black/50" onClick={() => router.back()}>
                                <ArrowLeft className="mr-2"/>
                                Back
                            </Button>
                             <h1 className="font-bold text-lg hidden sm:block">{streamData.title || "Live Event"}</h1>
                        </div>
                        <Badge variant="secondary" className="gap-2 bg-black/30">
                            <Users />
                            {streamData.viewerCount ? (streamData.viewerCount / 1000).toFixed(1) + 'K watching' : '12.4K watching'}
                        </Badge>
                    </div>

                    {/* Center Controls */}
                     <div className="flex-1 flex items-center justify-center gap-4 sm:gap-8">
                        <Button variant="ghost" size="icon" className="h-16 w-16">
                            <Rewind className="w-8 h-8 fill-white" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-20 w-20" onClick={handlePlayPause}>
                            {isPaused ? <Play className="w-12 h-12 fill-white" /> : <Pause className="w-12 h-12 fill-white" />}
                        </Button>
                         <Button variant="ghost" size="icon" className="h-16 w-16">
                            <FastForward className="w-8 h-8 fill-white" />
                        </Button>
                    </div>

                     {/* Bottom Bar */}
                     <div className="space-y-3">
                         <Slider 
                            value={[currentTime]}
                            max={duration || 1}
                            className="w-full h-2 [&>span:first-child]:h-2 [&>span>span]:h-2 [&>span>span]:bg-primary"
                         />
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-4">
                                {streamData.status === 'live' && (
                                     <Badge variant="destructive" className="items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                        LIVE
                                    </Badge>
                                )}
                                <div className="flex items-center gap-2">
                                     <Button variant="ghost" size="icon" className="h-8 w-8">
                                        {isMuted || volume === 0 ? <VolumeX /> : <Volume2 />}
                                    </Button>
                                    <Slider 
                                        className="w-20 hidden sm:flex"
                                        value={[volume * 100]}
                                    />
                                </div>
                                <span className="text-xs font-mono">{formatTime(currentTime)} / {streamData.status === 'live' ? formatTime(elapsedTime) : formatTime(duration)}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                                {typeof document !== 'undefined' && document.pictureInPictureEnabled && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><PictureInPicture/></Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Share2 /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Settings /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    {isFullscreen ? <Minimize /> : <Maximize />}
                                </Button>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
