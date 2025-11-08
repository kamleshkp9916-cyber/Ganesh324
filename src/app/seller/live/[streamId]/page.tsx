
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, ThumbsUp, MessageSquare, Users, Clock, Info, Mic, Video, Wifi, X, ShoppingBag, DollarSign, Star } from 'lucide-react';

// NOTE: This file is structured to make integrating LiveKit (or another WebRTC SDK)
// straightforward: the <div ref={videoContainerRef}> is where you should attach the
// remote/local video tracks. Helper placeholder functions connectLiveKit() and
// attachParticipantTracks() show where to put the SDK code.

export default function StreamDashboard() {
  const [isLive, setIsLive] = useState(true);
  const [viewers, setViewers] = useState(2304);
  const [likes, setLikes] = useState(540);
  const [superChats, setSuperChats] = useState(27);
  const [soldCount, setSoldCount] = useState(12);
  const [newFollowers, setNewFollowers] = useState(49);

  // which product overlay is visible on the player (null = none)
  const [shownProduct, setShownProduct] = useState<any | null>(null);

  // Chat messages (example). Each message can include a product reference.
  const [messages, setMessages] = useState([
    { id: 1, user: 'Lily', text: 'Loving the outfits! 💖', productId: 101 },
    { id: 2, user: 'Rahul', text: 'Please show the red jacket again.', productId: 102 },
    { id: 3, user: 'Nora', text: 'Great stream as always!', productId: null },
  ]);

  // products store (example)
  const products: { [key: number]: any } = {
    101: { id: 101, title: 'Floral Dress', price: '₹1,499', image: '/products/dress-101.jpg', soldOut: false },
    102: { id: 102, title: 'Red Jacket', price: '₹2,999', image: '/products/jacket-102.jpg', soldOut: true },
  };

  // Refs for easy LiveKit/webRTC integration: attach your participant's video here.
  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Placeholder: call your LiveKit connect function here and attach tracks to
    // videoContainerRef.current. Keep this small and focused so SDK logic stays
    // separate from UI code.
    // connectLiveKit()
  }, []);

  function connectLiveKit() {
    // Example placeholder. Replace with actual LiveKit / WebRTC connection logic.
    // On success, attach participant tracks using attachParticipantTracks(videoContainerRef.current, participant)
    console.log('connect to LiveKit here');
  }

  function attachParticipantTracks(container: HTMLDivElement | null, participant: any) {
    // SDK-specific: append <video> elements or the SDK's rendered elements into `container`.
    // Keep this function small and testable.
    if (!container) return;
    // e.g. container.appendChild(trackElement)
  }

  function handleShowProduct(productId: number | null) {
    if (!productId) return setShownProduct(null);
    setShownProduct(products[productId]);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col lg:flex-row gap-4 p-4">
      {/* Main column: video player on top, stream stats + details and controls below */}
      <main className="flex-1 flex flex-col gap-4">
        {/* Stream Player - simplified wrapper for LiveKit tracks */}
        <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl" style={{ minHeight: '56vh' }}>
          {/* LiveKit attach point */}
          <div ref={videoContainerRef} className="w-full h-full flex items-center justify-center bg-gray-900">
            {/* Fallback video for local dev/testing; replace when LiveKit is attached */}
            <video className="w-full h-full object-cover" autoPlay muted controls>
              <source src="/sample-stream.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Top-left live badge & basic counters */}
          <div className="absolute top-4 left-4 flex items-center space-x-3">
            <div className="bg-red-600 text-xs font-semibold px-3 py-1 rounded-full">LIVE</div>
            <div className="bg-black/50 rounded-md px-3 py-1 text-sm flex items-center space-x-2">
              <Eye size={14} /> <span className="font-medium">{viewers}</span>
            </div>
          </div>

          {/* Top-right quick reactions */}
          <div className="absolute top-4 right-4 flex items-center space-x-3 text-sm">
            <div className="bg-black/50 rounded-md px-3 py-1 flex items-center space-x-2"><ThumbsUp size={14}/> <span>{likes}</span></div>
            <div className="bg-black/50 rounded-md px-3 py-1 flex items-center space-x-2"><DollarSign size={14}/> <span>{superChats}</span></div>
            <div className="bg-black/50 rounded-md px-3 py-1 flex items-center space-x-2"><ShoppingBag size={14}/> <span>{soldCount}</span></div>
          </div>

          {/* Product overlay shown when a product is requested from chat */}
          {shownProduct && (
            <div className="absolute bottom-6 left-6 right-6 mx-auto max-w-3xl bg-gradient-to-r from-black/70 via-black/50 to-black/70 border border-gray-700 p-4 rounded-xl flex items-center space-x-4">
              <img src={shownProduct.image} alt={shownProduct.title} className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex-1">
                <div className="text-lg font-semibold">{shownProduct.title}</div>
                <div className="text-sm text-gray-300">{shownProduct.price}</div>
                <div className="mt-2 flex items-center space-x-2">
                  <Button onClick={() => { /* add buy flow */ }}>Buy Now</Button>
                  <Button variant="outline" onClick={() => setShownProduct(null)}>Close</Button>
                </div>
              </div>
              <div className="text-sm text-gray-300">{shownProduct.soldOut ? 'Sold out' : 'In stock'}</div>
            </div>
          )}
        </div>

        {/* Compact summary row (below the player) - total super chats, products sold out, new followers */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Total Super Chats</div>
              <div className="text-2xl font-bold">{superChats}</div>
            </div>
            <DollarSign size={28} />
          </div>

          <div className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Products Sold</div>
              <div className="text-2xl font-bold">{soldCount}</div>
            </div>
            <ShoppingBag size={28} />
          </div>

          <div className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">New Followers</div>
              <div className="text-2xl font-bold">{newFollowers}</div>
            </div>
            <Users size={28} />
          </div>
        </div>

        {/* Below the summary row: stream details, analytics and controls arranged horizontally for quick access */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-gray-800 text-white col-span-1 lg:col-span-2">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">Stream Details</h3>
              <div className="mt-2 text-sm text-gray-300 grid grid-cols-2 gap-2">
                <div><strong>Title:</strong> Unboxing the Latest Fashion Trends 👗</div>
                <div><strong>Category:</strong> Live Shopping</div>
                <div><strong>Duration:</strong> <Clock size={14} className="inline" /> 1h 23m</div>
                <div><strong>Viewers:</strong> {viewers}</div>
                <div><strong>Total Likes:</strong> {likes}</div>
                <div><strong>Super Chats:</strong> {superChats}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 text-white">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">Live Analytics & Controls</h3>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-300">
                <div className="bg-gray-700 p-2 rounded">Bitrate<br/><span className="font-medium">4500 kbps</span></div>
                <div className="bg-gray-700 p-2 rounded">FPS<br/><span className="font-medium">60</span></div>
                <div className="bg-gray-700 p-2 rounded">Latency<br/><span className="font-medium">2.1s</span></div>
                <div className="bg-gray-700 p-2 rounded flex items-center justify-between">Connection<br/><span className="font-medium">Good</span></div>
              </div>

              <div className="mt-3 flex space-x-2">
                <Button variant="destructive" onClick={() => setIsLive(false)} className="flex-1">End Stream</Button>
                <Button variant="outline" className="flex-1"><Mic size={16}/> Mute</Button>
                <Button variant="outline" className="flex-1"><Video size={16}/> Cam Off</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Right column: Chat only. Chat contains messages and a right-side action to "Show product" which triggers product overlay on the player */}
      <aside className="w-full lg:w-96 bg-gray-900 rounded-2xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold">Live Chat</h4>
          <div className="text-sm text-gray-400">Subscribers: <span className="font-medium">{newFollowers}</span></div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {messages.map(msg => (
            <div key={msg.id} className="flex items-start justify-between bg-gray-800 p-3 rounded-lg">
              <div>
                <div className="text-sm font-semibold">@{msg.user}</div>
                <div className="text-sm text-gray-300">{msg.text}</div>
              </div>

              {/* Right-side action area: if message references a product, show product icon + button */}
              <div className="flex flex-col items-end ml-4">
                {msg.productId ? (
                  <>
                    <img src={products[msg.productId].image} alt="thumb" className="w-16 h-12 object-cover rounded-md mb-1" />
                    <button
                      className="text-xs bg-gradient-to-r from-primary to-indigo-500 px-3 py-1 rounded text-white"
                      onClick={() => handleShowProduct(msg.productId)}
                    >
                      Show Product
                    </button>
                  </>
                ) : (
                  <div className="text-xs text-gray-400">—</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Chat input */}
        <div className="mt-3">
          <div className="flex gap-2">
            <input type="text" placeholder="Type a message..." className="flex-1 bg-gray-800 rounded-lg px-3 py-2 outline-none text-sm" />
            <Button>Send</Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
