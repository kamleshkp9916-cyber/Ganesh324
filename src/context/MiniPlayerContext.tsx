
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface StreamData {
  id: string;
  streamUrl: string;
  title: string;
}

interface MiniPlayerContextType {
  minimizedStream: StreamData | null;
  minimizeStream: (stream: StreamData) => void;
  closeMinimizedStream: () => void;
  isMinimized: (streamId: string) => boolean;
}

const MiniPlayerContext = createContext<MiniPlayerContextType | undefined>(undefined);

export const MiniPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [minimizedStream, setMinimizedStream] = useState<StreamData | null>(null);

  const minimizeStream = (stream: StreamData) => {
    setMinimizedStream(stream);
  };

  const closeMinimizedStream = () => {
    setMinimizedStream(null);
  };

  const isMinimized = (streamId: string) => {
    return minimizedStream?.id === streamId;
  };
  
  return (
    <MiniPlayerContext.Provider value={{ minimizedStream, minimizeStream, closeMinimizedStream, isMinimized }}>
      {children}
    </MiniPlayerContext.Provider>
  );
};

export const useMiniPlayer = () => {
  const context = useContext(MiniPlayerContext);
  if (context === undefined) {
    throw new Error('useMiniPlayer must be used within a MiniPlayerProvider');
  }
  return context;
};
