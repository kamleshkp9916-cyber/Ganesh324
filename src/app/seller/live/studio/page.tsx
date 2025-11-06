
// app/(seller)/live/studio/page.tsx
// Go Live Studio — UI‑only, LiveKit‑ready. No backend, no node modules.
// Added per request:
//  • Thumbnail picker + preview
//  • Super Chat enable/disable + on‑screen toggle
//  • Overlay designer: horizontal strip at TOP or BOTTOM with auto‑slide (products + custom items)
//  • Existing: Details → Products → Camera/Mic → Start

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Search, Mic, MicOff, Video, VideoOff, Settings2, Play, Pause, CheckCircle2, AlertTriangle, Upload, Plus, Trash2, MoveHorizontal, PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";


// Types
type Product = { id: string; title: string; price: number; image?: string; stock?: number; status?: "active" | "draft" | "archived" };
type OverlayItem = { type: "product" | "text"; id?: string; text?: string };

interface GoLiveState {
  step: 1 | 2 | 3;
  title: string;
  description: string;
  visibility: "public" | "unlisted" | "private";
  enableChat: boolean;
  recordVOD: boolean;
  thumbDataUrl?: string;
  selectedIds: string[];
  featuredId?: string;
  superChatEnabled: boolean;
  superChatOnScreen: boolean;
  overlayEnabled: boolean;
  overlayPosition: "top" | "bottom";
  overlayAutoMs: number;
  overlayItems: OverlayItem[];
  videoDeviceId?: string;
  audioDeviceId?: string;
}

// Props for future wiring
type GoLiveProps = {
  products?: Product[];              // pass fetched products for the seller
  defaultTitle?: string;
  onStart?: (payload: any) => void;
};

const currency = (n:number)=> new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(n);

const GO_LIVE_STORAGE_KEY = 'goLiveStudioState';

export default function GoLiveStudio({ defaultTitle = "New Live Show", onStart }: GoLiveProps){
  const { user } = useAuth();
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const [state, setState] = useLocalStorage<GoLiveState>(GO_LIVE_STORAGE_KEY, {
    step: 1,
    title: defaultTitle,
    description: "",
    visibility: "public",
    enableChat: true,
    recordVOD: true,
    selectedIds: [],
    superChatEnabled: true,
    superChatOnScreen: true,
    overlayEnabled: true,
    overlayPosition: "top",
    overlayAutoMs: 2500,
    overlayItems: [],
  });

  const updateState = (updates: Partial<GoLiveState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedProducts = localStorage.getItem('sellerProducts');
        if (storedProducts) {
            setSellerProducts(JSON.parse(storedProducts));
        }
    }
  }, []);

  const products = useMemo(() => {
    return sellerProducts.filter(p => p.status === 'active');
  }, [sellerProducts]);

  // Thumbnail
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const onPickThumb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        updateState({ thumbDataUrl: event.target?.result as string });
    };
    reader.readAsDataURL(f);
  };

  // Products
  const [query, setQuery] = useState("");

  // Media
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream|null>(null);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [permissionsError, setPermissionsError] = useState<string>("");
  const [level, setLevel] = useState<number>(0);
  const levelNodeRef = useRef<MediaStreamAudioSourceNode|null>(null);
  const analyserRef = useRef<AnalyserNode|null>(null);

  // Filter products
  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase();
    if(!q) return products;
    return products.filter(p=> p.title.toLowerCase().includes(q));
  },[products, query]);

  // Toggle selection
  const toggleProduct = (id:string)=>{
    updateState({
        selectedIds: state.selectedIds.includes(id) 
            ? state.selectedIds.filter(x => x !== id) 
            : [...state.selectedIds, id]
    });
  };

  // Overlay: add from selected products
  const addSelectedToOverlay = () => {
    const newItems: OverlayItem[] = state.selectedIds.map(id => ({ type: "product", id }));
    updateState({ overlayItems: [...state.overlayItems, ...newItems]});
    toast({ title: `${newItems.length} product(s) added to overlay.`})
  };
  const addCustomText = () => updateState({ overlayItems: [...state.overlayItems, { type: "text", text: "New drop! Flat 10% today" }] });
  const removeOverlayItem = (idx:number) => updateState({ overlayItems: state.overlayItems.filter((_,i)=>i!==idx) });

  const stopPreview = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start/replace local preview stream
  const startPreview = useCallback(async () => {
    stopPreview(); // Stop any existing stream first
    
    // Build flexible constraints
    const audioConstraints: MediaTrackConstraints = {};
    if (state.audioDeviceId) {
        audioConstraints.deviceId = state.audioDeviceId;
    }

    const videoConstraints: MediaTrackConstraints = {
        // Prioritize front camera on mobile
        facingMode: 'user'
    };
    if (state.videoDeviceId) {
        videoConstraints.deviceId = state.videoDeviceId;
    }

    try {
      setPermissionsError("");
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: audioConstraints,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play().catch(console.error);
      }
      setupAudioLevel(newStream);
    } catch (e: any) {
      console.error("Error starting media preview:", e);
      setPermissionsError("Could not start camera/mic. It might be in use or permissions were denied.");
      stopPreview();
    }
  }, [state.videoDeviceId, state.audioDeviceId, stopPreview]);
  

  const refreshDevices = useCallback(async()=>{
    try {
        setPermissionsError("");
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        const devs = await navigator.mediaDevices.enumerateDevices();
        setDevices(devs);

        const videoDevice = devs.find(d => d.kind === 'videoinput');
        const audioDevice = devs.find(d => d.kind === 'audioinput');

        updateState({
            videoDeviceId: state.videoDeviceId || videoDevice?.deviceId,
            audioDeviceId: state.audioDeviceId || audioDevice?.deviceId,
        });

        tempStream.getTracks().forEach(track => track.stop());
    } catch (e: any) {
        console.error("Permission error:", e);
        setPermissionsError("Camera and microphone permissions are required to go live. Please enable them in your browser settings and refresh the page.");
    }
  }, [state.videoDeviceId, state.audioDeviceId, updateState]);


  // Audio level meter
  function setupAudioLevel(ms: MediaStream){
    try{
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const src = ctx.createMediaStreamSource(ms);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = ()=>{
        if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(data);
            const avg = data.reduce((a,b)=>a+b,0)/data.length;
            setLevel(avg/255);
            requestAnimationFrame(loop);
        }
      };
      loop();
      levelNodeRef.current = src;
    }catch(err){
      console.warn("Audio meter not available", err);
    }
  }
  function teardownAudioLevel(){
    try{ analyserRef.current?.disconnect(); levelNodeRef.current?.disconnect(); }catch{}
  }

  // Track enable/disable
  const setTrackEnabled = (kind: 'video'|'audio', on:boolean)=>{
    if(!stream) return;
    stream.getTracks().forEach(t=>{ if(t.kind===kind) (t as MediaStreamTrack).enabled = on; });
  };

  useEffect(()=>{ if(stream) setTrackEnabled('video', camOn); }, [camOn, stream]);
  useEffect(()=>{ if(stream) setTrackEnabled('audio', micOn); }, [micOn, stream]);
  
  useEffect(() => {
    if (state.step === 3) {
        refreshDevices();
    } else {
        stopPreview();
    }
    return () => {
        if (state.step === 3) {
            stopPreview();
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step]);

  // Start preview when devices are selected
  useEffect(()=> {
    if (state.step === 3 && state.videoDeviceId && state.audioDeviceId) {
        startPreview();
    }
  }, [state.step, state.videoDeviceId, state.audioDeviceId, startPreview]);

  // Cleanup on unmount
  useEffect(()=>()=>{ stopPreview(); },[stopPreview]);

  const handleStart = ()=>{
    const { step, ...payload } = state;
    onStart?.(payload);
  };

  // Auto slide state (preview only)
  const [activeOverlayIndex, setActiveOverlayIndex] = useState(0);
  useEffect(()=>{
    if(!state.overlayEnabled || state.overlayItems.length===0) return;
    const id = setInterval(()=>{
      setActiveOverlayIndex(i => (i+1) % state.overlayItems.length);
    }, Math.max(1000, state.overlayAutoMs));
    return ()=> clearInterval(id);
  }, [state.overlayEnabled, state.overlayItems, state.overlayAutoMs]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold">Go Live</h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Settings2 className="w-4 h-4"/><span>LiveKit‑ready UI</span>
        </div>
      </header>

      {/* Steps */}
      <div className="grid md:grid-cols-4 gap-4">
        <StepBadge n={1} active={state.step===1} title="Details"/>
        <StepBadge n={2} active={state.step===2} title="Products"/>
        <StepBadge n={3} active={state.step===3} title="Camera & Mic"/>
        <StepBadge n={4} active={false} title="Overlays & Super Chat"/>
      </div>

      {state.step===1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Stream details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={state.title} onChange={(e)=>updateState({title: e.target.value})} maxLength={80}/>
              <div className="text-xs text-muted-foreground">Max 80 characters</div>
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={state.visibility} onValueChange={(v:any)=>updateState({visibility: v})}>
                <SelectTrigger><SelectValue placeholder="public"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Thumbnail</Label>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={()=>thumbInputRef.current?.click()}><Upload className="w-4 h-4 mr-1"/>Upload Image</Button>
                <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={onPickThumb} />
              </div>
              <div className="h-32 border rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
                {state.thumbDataUrl ? <img src={state.thumbDataUrl} className="h-full object-contain" alt="thumbnail"/> : <span className="text-xs text-muted-foreground">No thumbnail selected</span>}
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea value={state.description} onChange={(e)=>updateState({description: e.target.value})} rows={3} placeholder="Tell viewers what this live is about..."/>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={state.enableChat} onCheckedChange={(checked) => updateState({enableChat: checked})}/>
              <span className="text-sm">Enable live chat</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={state.recordVOD} onCheckedChange={(checked) => updateState({recordVOD: checked})}/>
              <span className="text-sm">Record a VOD</span>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-xs text-muted-foreground">You can change these later.</div>
            <Button onClick={()=>updateState({step: 2})}>Next</Button>
          </CardFooter>
        </Card>
      )}

      {state.step===2 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Select products</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <Input className="pl-8" placeholder="Search products" value={query} onChange={(e)=>setQuery(e.target.value)} />
              </div>
              <div className="text-xs text-muted-foreground">Selected: {state.selectedIds.length}</div>
            </div>

            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {filtered.map(p=> (
                    <div key={p.id} className={`border rounded-2xl p-3 flex gap-3 items-center ${state.selectedIds.includes(p.id)?'border-primary shadow-sm':''}`}>
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                        {p.image ? (<img src={p.image} className="w-full h-full object-cover" alt={p.title}/>) : (
                        <span className="text-xs text-muted-foreground">No image</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-medium">{p.title}</div>
                        <div className="text-xs text-muted-foreground">{currency(p.price)}{p.stock!=null && <span> • Stock {p.stock}</span>}</div>
                        <div className="flex items-center gap-2 mt-2">
                        <Checkbox id={`sel-${p.id}`} checked={state.selectedIds.includes(p.id)} onCheckedChange={()=>toggleProduct(p.id)}/>
                        <Label htmlFor={`sel-${p.id}`} className="text-xs">Include</Label>
                        <Button size="sm" variant={state.featuredId===p.id?"default":"outline"} onClick={()=>updateState({featuredId: p.id})} className="ml-auto">
                            {state.featuredId===p.id ? <><CheckCircle2 className="w-4 h-4 mr-1"/> Featured</> : "Set featured"}
                        </Button>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                 <div className="text-center py-10 text-muted-foreground">
                    <p>You have no active products.</p>
                    <Button asChild variant="link" className="mt-2">
                        <Link href="/seller/products">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add a Product
                        </Link>
                    </Button>
                </div>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={()=>updateState({step: 1})}>Back</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={addSelectedToOverlay} disabled={state.selectedIds.length === 0}><MoveHorizontal className="w-4 h-4 mr-1"/>Add to overlay</Button>
              <Button onClick={()=>updateState({step: 3})} disabled={state.selectedIds.length===0}>Next</Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {state.step===3 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Camera & microphone</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-[2fr,1fr] gap-4">
            <div className="rounded-2xl overflow-hidden bg-black aspect-video relative">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              {!stream && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  {permissionsError ? (
                       <div className="text-center max-w-sm p-4">
                           <AlertTriangle className="mx-auto w-8 h-8 text-destructive mb-2" />
                           <p className="font-semibold text-destructive">Permissions Required</p>
                           <p>{permissionsError}</p>
                       </div>
                  ) : (
                    <span>Requesting permissions...</span>
                  )}
                </div>
              )}

              {state.overlayEnabled && state.overlayItems.length>0 && (
                <OverlayStrip
                  products={products}
                  items={state.overlayItems}
                  activeIndex={activeOverlayIndex}
                  position={state.overlayPosition}
                />
              )}

              {state.superChatEnabled && state.superChatOnScreen && (
                <div className="absolute top-2 right-2 bg-white/90 text-xs rounded-full px-2 py-1 shadow">Super Chat ON</div>
              )}
            </div>

            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-3">
                <Button variant={camOn?"default":"secondary"} onClick={()=>setCamOn(v=>!v)}>
                  {camOn ? <Video className="w-4 h-4 mr-1"/> : <VideoOff className="w-4 h-4 mr-1"/>}
                  {camOn ? "Camera on" : "Camera off"}
                </Button>
                <Button variant={micOn?"default":"secondary"} onClick={()=>setMicOn(v=>!v)}>
                  {micOn ? <Mic className="w-4 h-4 mr-1"/> : <MicOff className="w-4 h-4 mr-1"/>}
                  {micOn ? "Mic on" : "Mic off"}
                </Button>
              </div>

               <div className="space-y-2">
                 <Label>Camera</Label>
                 <Select value={state.videoDeviceId} onValueChange={(v) => updateState({videoDeviceId: v})} disabled={!devices.find(d=>d.kind==='videoinput')}>
                    <SelectTrigger><SelectValue placeholder="Select camera"/></SelectTrigger>
                    <SelectContent>
                        {devices.filter(d=>d.kind==='videoinput').map(d=> <SelectItem key={d.deviceId} value={d.deviceId}>{d.label}</SelectItem>)}
                    </SelectContent>
                 </Select>
               </div>

                <div className="space-y-2">
                 <Label>Microphone</Label>
                 <Select value={state.audioDeviceId} onValueChange={(v) => updateState({audioDeviceId: v})} disabled={!devices.find(d=>d.kind==='audioinput')}>
                    <SelectTrigger><SelectValue placeholder="Select microphone"/></SelectTrigger>
                    <SelectContent>
                        {devices.filter(d=>d.kind==='audioinput').map(d=> <SelectItem key={d.deviceId} value={d.deviceId}>{d.label}</SelectItem>)}
                    </SelectContent>
                 </Select>
                 {micOn && <LevelMeter value={level} />}
               </div>
               
              <div className="space-y-2">
                <Label>Super Chat</Label>
                <div className="flex items-center gap-3">
                  <Switch checked={state.superChatEnabled} onCheckedChange={(checked) => updateState({superChatEnabled: checked})}/>
                  <span className="text-sm">Enable Super Chat</span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={state.superChatOnScreen} onCheckedChange={(checked) => updateState({superChatOnScreen: checked})} disabled={!state.superChatEnabled}/>
                  <span className="text-sm">Show Super Chat badge on screen</span>
                </div>
              </div>

              <Separator/>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch checked={state.overlayEnabled} onCheckedChange={(checked) => updateState({overlayEnabled: checked})}/>
                    <span className="text-sm">Enable overlay strip</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Position</Label>
                    <Select value={state.overlayPosition} onValueChange={(v:any)=>updateState({overlayPosition: v})}>
                      <SelectTrigger className="w-28"><SelectValue placeholder="pos"/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr,auto] gap-2 items-end">
                  <Input type="number" min={1000} step={500} value={state.overlayAutoMs} onChange={(e)=>updateState({overlayAutoMs: parseInt(e.target.value||'0')||2500})} placeholder="Auto slide (ms)" />
                  <Button variant="outline" onClick={addCustomText}><Plus className="w-4 h-4 mr-1"/>Add custom text</Button>
                </div>

                <div className="space-y-2">
                  {state.overlayItems.length===0 && <div className="text-xs text-muted-foreground">No overlay items yet. Add selected products or custom texts.</div>}
                  {state.overlayItems.map((it, idx)=> (
                    <div key={idx} className="flex items-center justify-between border rounded-xl px-3 py-2">
                      <div className="text-sm">
                        {it.type === 'product' ? (
                          <span>Product • {products.find(p=>p.id===it.id)?.title || it.id}</span>
                        ) : (
                          <span>Text • {it.text}</span>
                        )}
                      </div>
                      <Button size="icon" variant="ghost" onClick={()=>removeOverlayItem(idx)}><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={()=>updateState({step: 2})}>Back</Button>
            <div className="flex items-center gap-2">
               <Button onClick={handleStart} className="bg-red-600 hover:bg-red-700" disabled={!stream}>Go Live</Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Summary footer */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 text-xs py-3">
          <Badge variant="outline">{state.visibility}</Badge>
          <span>•</span>
          <span>{state.selectedIds.length} products</span>
          {state.featuredId && (<><span>•</span><span>Featured: {state.featuredId}</span></>)}
          <span>•</span>
          <span>{state.enableChat?"Chat on":"Chat off"}</span>
          <span>•</span>
          <span>{state.recordVOD?"Record on":"Record off"}</span>
          <span>•</span>
          <span>{state.superChatEnabled?"Super Chat on":"Super Chat off"}</span>
          {state.overlayEnabled && <><span>•</span><span>Overlay {state.overlayPosition} ({state.overlayItems.length} items)</span></>}
        </CardContent>
      </Card>
    </div>
  );
}

function StepBadge({ n, title, active }:{ n: number; title: string; active?: boolean }){
  return (
    <div className={`flex items-center gap-2 p-3 rounded-2xl border ${active? 'border-primary bg-primary/5' : ''}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${active? 'bg-primary text-white' : 'bg-muted text-foreground'}`}>{n}</div>
      <div className="text-sm font-medium">{title}</div>
    </div>
  );
}

function LevelMeter({ value }:{ value:number }){
  const pct = Math.min(100, Math.round(value*100));
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div className="h-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg,#22c55e,#f59e0b,#ef4444)` }} />
    </div>
  );
}

function OverlayStrip({ products, items, activeIndex, position }:{ products: Product[]; items: Array<{type:"product"|"text"; id?: string; text?: string}>; activeIndex: number; position: "top"|"bottom" }){
  const active = items[activeIndex];
  return (
    <div className={`absolute ${position==='top'?'top-0':'bottom-0'} left-0 right-0 bg-black/50 backdrop-blur px-2 py-1`}> 
      <div className="flex items-center gap-2 overflow-hidden">
        {active?.type==='product' ? (
          <>
            <Badge variant="secondary" className="shrink-0">Featured</Badge>
            <span className="truncate text-white text-xs">{products.find(p=>p.id===active.id)?.title || active.id}</span>
            <span className="text-white/80 text-xs">• {currency(products.find(p=>p.id===active.id)?.price || 0)}</span>
          </>
        ) : (
          <span className="text-white text-xs">{active?.text}</span>
        )}
      </div>
    </div>
  );
}
