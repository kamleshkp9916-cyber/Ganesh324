
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
import { Search, Mic, MicOff, Video, VideoOff, Settings2, Play, Pause, CheckCircle2, AlertTriangle, Upload, Plus, Trash2, MoveHorizontal } from "lucide-react";

// Types
type Product = { id: string; title: string; price: number; image?: string; stock?: number; };

// Props for future wiring
type GoLiveProps = {
  products?: Product[];              // pass fetched products for the seller
  defaultTitle?: string;
  onStart?: (payload: {
    title: string;
    description: string;
    visibility: "public" | "unlisted" | "private";
    thumbnail?: { url?: string; fileName?: string };
    selectedProductIds: string[];
    featuredProductId?: string;
    enableChat: boolean;
    recordVOD: boolean;
    superChat: { enabled: boolean; onScreen: boolean };
    overlay: {
      enabled: boolean;
      position: "top" | "bottom";
      autoSlideMs: number;
      items: Array<{ type: "product" | "text"; id?: string; text?: string }>;
    };
    // livekit token, room, etc. can be injected later
  }) => void;
};

const currency = (n:number)=> new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(n);

const DEMO_PRODUCTS: Product[] = [
  { id: "p1", title: "Cotton T‑Shirt", price: 499, image: "https://picsum.photos/seed/p1/120/120", stock: 24 },
  { id: "p2", title: "Denim Jacket", price: 1999, image: "https://picsum.photos/seed/p2/120/120", stock: 8 },
  { id: "p3", title: "Sneakers", price: 2999, image: "https://picsum.photos/seed/p3/120/120", stock: 15 },
  { id: "p4", title: "Silk Saree", price: 4599, image: "https://picsum.photos/seed/p4/120/120", stock: 5 },
];


export default function GoLiveStudio({ products = DEMO_PRODUCTS, defaultTitle = "New Live Show", onStart }: GoLiveProps){
  // Step logic
  const [step, setStep] = useState<1|2|3>(1);

  // Details
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public"|"unlisted"|"private">("public");
  const [enableChat, setEnableChat] = useState(true);
  const [recordVOD, setRecordVOD] = useState(true);

  // Thumbnail
  const [thumbUrl, setThumbUrl] = useState<string | undefined>();
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const onPickThumb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setThumbUrl(url);
  };

  // Products
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [featuredId, setFeaturedId] = useState<string|undefined>(undefined);

  // Super Chat
  const [superChatEnabled, setSuperChatEnabled] = useState(true);
  const [superChatOnScreen, setSuperChatOnScreen] = useState(true);

  // Overlay designer
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [overlayPosition, setOverlayPosition] = useState<"top"|"bottom">("top");
  const [overlayAutoMs, setOverlayAutoMs] = useState(2500);
  type OverlayItem = { type: "product" | "text"; id?: string; text?: string };
  const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([]);

  // Media
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream|null>(null);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceId, setVideoDeviceId] = useState<string|undefined>();
  const [audioDeviceId, setAudioDeviceId] = useState<string|undefined>();
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
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  // Overlay: add from selected products
  const addSelectedToOverlay = () => {
    const newItems: OverlayItem[] = selectedIds.map(id => ({ type: "product", id }));
    setOverlayItems(prev => [...prev, ...newItems]);
  };
  const addCustomText = () => setOverlayItems(prev => [...prev, { type: "text", text: "New drop! Flat 10% today" }]);
  const removeOverlayItem = (idx:number) => setOverlayItems(prev => prev.filter((_,i)=>i!==idx));

  // Media: enumerate devices
  const refreshDevices = useCallback(async()=>{
    const devs = await navigator.mediaDevices.enumerateDevices();
    setDevices(devs);
    if(!videoDeviceId){
      const cam = devs.find(d=> d.kind === "videoinput");
      if (cam) setVideoDeviceId(cam.deviceId);
    }
    if(!audioDeviceId){
      const mic = devs.find(d=> d.kind === "audioinput");
      if (mic) setAudioDeviceId(mic.deviceId);
    }
  },[videoDeviceId, audioDeviceId]);

  // Start/replace local preview stream
  const startPreview = useCallback(async()=>{
    try{
      setPermissionsError("");
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
        audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
      });
      if (stream) stream.getTracks().forEach(t=>t.stop());
      setStream(newStream);
      if (videoRef.current){
        videoRef.current.srcObject = newStream;
        await videoRef.current.play().catch(()=>{});
      }
      setupAudioLevel(newStream);
    }catch(e:any){
      console.error(e);
      setPermissionsError(e?.message || "Camera/Mic permission denied");
    }
  },[videoDeviceId, audioDeviceId, stream]);

  const stopPreview = useCallback(()=>{
    if(stream){
      stream.getTracks().forEach(t=>t.stop());
      setStream(null);
    }
    teardownAudioLevel();
  },[stream]);

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

  // Refresh devices once
  useEffect(()=>{ (async()=>{ await refreshDevices(); })(); },[refreshDevices]);
  useEffect(()=>{ startPreview(); }, [videoDeviceId, audioDeviceId, startPreview]);

  // Cleanup on unmount
  useEffect(()=>()=>{ stopPreview(); },[stopPreview]);

  const handleStart = ()=>{
    onStart?.({
      title, description, visibility,
      thumbnail: thumbUrl ? { url: thumbUrl, fileName: thumbInputRef.current?.files?.[0]?.name } : undefined,
      selectedProductIds: selectedIds,
      featuredProductId: featuredId,
      enableChat, recordVOD,
      superChat: { enabled: superChatEnabled, onScreen: superChatOnScreen },
      overlay: { enabled: overlayEnabled, position: overlayPosition, autoSlideMs: overlayAutoMs, items: overlayItems },
    });
  };

  // Auto slide state (preview only)
  const [activeOverlayIndex, setActiveOverlayIndex] = useState(0);
  useEffect(()=>{
    if(!overlayEnabled || overlayItems.length===0) return;
    const id = setInterval(()=>{
      setActiveOverlayIndex(i => (i+1) % overlayItems.length);
    }, Math.max(1000, overlayAutoMs));
    return ()=> clearInterval(id);
  }, [overlayEnabled, overlayItems, overlayAutoMs]);

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
        <StepBadge n={1} active={step===1} title="Details"/>
        <StepBadge n={2} active={step===2} title="Products"/>
        <StepBadge n={3} active={step===3} title="Camera & Mic"/>
        <StepBadge n={4} active={false} title="Overlays & Super Chat"/>
      </div>

      {step===1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Stream details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e)=>setTitle(e.target.value)} maxLength={80}/>
              <div className="text-xs text-muted-foreground">Max 80 characters</div>
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(v:any)=>setVisibility(v)}>
                <SelectTrigger><SelectValue placeholder="public"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Thumbnail */}
            <div className="md:col-span-2 space-y-2">
              <Label>Thumbnail</Label>
              <div className="flex items-center gap-3">
                <Input ref={thumbInputRef} type="file" accept="image/*" onChange={onPickThumb} />
                <Button type="button" variant="outline" onClick={()=>thumbInputRef.current?.click()}><Upload className="w-4 h-4 mr-1"/>Upload</Button>
              </div>
              <div className="h-32 border rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
                {thumbUrl ? <img src={thumbUrl} className="h-full object-contain" alt="thumbnail"/> : <span className="text-xs text-muted-foreground">No thumbnail selected</span>}
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={3} placeholder="Tell viewers what this live is about..."/>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={enableChat} onCheckedChange={setEnableChat}/>
              <span className="text-sm">Enable live chat</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={recordVOD} onCheckedChange={setRecordVOD}/>
              <span className="text-sm">Record a VOD</span>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-xs text-muted-foreground">You can change these later.</div>
            <Button onClick={()=>setStep(2)}>Next</Button>
          </CardFooter>
        </Card>
      )}

      {step===2 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Select products</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <Input className="pl-8" placeholder="Search products" value={query} onChange={(e)=>setQuery(e.target.value)} />
              </div>
              <div className="text-xs text-muted-foreground">Selected: {selectedIds.length}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {filtered.map(p=> (
                <div key={p.id} className={`border rounded-2xl p-3 flex gap-3 items-center ${selectedIds.includes(p.id)?'border-primary shadow-sm':''}`}>
                  <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                    {p.image ? (<img src={p.image} className="w-full h-full object-cover" alt={p.title}/>) : (
                      <span className="text-xs text-muted-foreground">No image</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{currency(p.price)}{p.stock!=null && <span> • Stock {p.stock}</span>}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Checkbox id={`sel-${p.id}`} checked={selectedIds.includes(p.id)} onCheckedChange={()=>toggleProduct(p.id)}/>
                      <Label htmlFor={`sel-${p.id}`} className="text-xs">Include</Label>
                      <Button size="sm" variant={featuredId===p.id?"default":"outline"} onClick={()=>setFeaturedId(p.id)} className="ml-auto">
                        {featuredId===p.id ? <><CheckCircle2 className="w-4 h-4 mr-1"/> Featured</> : "Set featured"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={()=>setStep(1)}>Back</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={addSelectedToOverlay}><MoveHorizontal className="w-4 h-4 mr-1"/>Add to overlay</Button>
              <Button onClick={()=>setStep(3)} disabled={selectedIds.length===0}>Next</Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {step===3 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Camera & microphone</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-[2fr,1fr] gap-4">
            {/* Preview with overlay */}
            <div className="rounded-2xl overflow-hidden bg-black aspect-video relative">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              {!stream && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  <span>Grant camera & mic permissions to preview</span>
                </div>
              )}
              {permissionsError && (
                <div className="absolute bottom-2 left-2 right-2 text-xs bg-red-500/90 text-white px-2 py-1 rounded">
                  <AlertTriangle className="w-3 h-3 inline mr-1"/> {permissionsError}
                </div>
              )}

              {/* Overlay strip (preview only) */}
              {overlayEnabled && overlayItems.length>0 && (
                <OverlayStrip
                  products={products}
                  items={overlayItems}
                  activeIndex={activeOverlayIndex}
                  position={overlayPosition}
                />
              )}

              {/* Super Chat badge (preview only) */}
              {superChatEnabled && superChatOnScreen && (
                <div className="absolute top-2 right-2 bg-white/90 text-xs rounded-full px-2 py-1 shadow">Super Chat ON</div>
              )}
            </div>

            {/* Controls */}
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

              {/* Super Chat controls */}
              <div className="space-y-2">
                <Label>Super Chat</Label>
                <div className="flex items-center gap-3">
                  <Switch checked={superChatEnabled} onCheckedChange={setSuperChatEnabled}/>
                  <span className="text-sm">Enable Super Chat</span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={superChatOnScreen} onCheckedChange={setSuperChatOnScreen} disabled={!superChatEnabled}/>
                  <span className="text-sm">Show Super Chat badge on screen</span>
                </div>
              </div>

              {/* Overlay designer controls */}
              <Separator/>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch checked={overlayEnabled} onCheckedChange={setOverlayEnabled}/>
                    <span className="text-sm">Enable overlay strip</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Position</Label>
                    <Select value={overlayPosition} onValueChange={(v:any)=>setOverlayPosition(v)}>
                      <SelectTrigger className="w-28"><SelectValue placeholder="pos"/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr,auto] gap-2 items-end">
                  <Input type="number" min={1000} step={500} value={overlayAutoMs} onChange={(e)=>setOverlayAutoMs(parseInt(e.target.value||'0')||2500)} placeholder="Auto slide (ms)" />
                  <Button variant="outline" onClick={addCustomText}><Plus className="w-4 h-4 mr-1"/>Add custom text</Button>
                </div>

                <div className="space-y-2">
                  {overlayItems.length===0 && <div className="text-xs text-muted-foreground">No overlay items yet. Add selected products or custom texts.</div>}
                  {overlayItems.map((it, idx)=> (
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

              <Separator/>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={startPreview}><Play className="w-4 h-4 mr-1"/> Refresh preview</Button>
                <Button variant="outline" onClick={stopPreview}><Pause className="w-4 h-4 mr-1"/> Stop preview</Button>
              </div>

              <div className="text-xs text-muted-foreground">Tip: Screen share can be added later via LiveKit.</div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={()=>setStep(2)}>Back</Button>
            <div className="flex items-center gap-2">
              <Button onClick={handleStart} className="bg-red-600 hover:bg-red-700">Go Live</Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Summary footer */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 text-xs py-3">
          <Badge variant="outline">{visibility}</Badge>
          <span>•</span>
          <span>{selectedIds.length} products</span>
          {featuredId && (<><span>•</span><span>Featured: {featuredId}</span></>)}
          <span>•</span>
          <span>{enableChat?"Chat on":"Chat off"}</span>
          <span>•</span>
          <span>{recordVOD?"Record on":"Record off"}</span>
          <span>•</span>
          <span>{superChatEnabled?"Super Chat on":"Super Chat off"}</span>
          {overlayEnabled && <><span>•</span><span>Overlay {overlayPosition} ({overlayItems.length} items)</span></>}
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
