
"use client";

import { useState, useEffect, useCallback } from 'react';

// SSR-safe useLocalStorage hook
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  
  // This function will only be called on the client side after hydration.
  const readValue = useCallback((): T => {
    // Prevent build errors "window is not defined"
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value. 
  // We pass a function to useState so it only runs on the client.
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  
  // We need this to safely read from local storage on the client.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Read from local storage only after the component has mounted.
  useEffect(() => {
    if (isMounted) {
      setStoredValue(readValue());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);


  const setValue = (value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') {
      console.warn(`Tried to set localStorage key “${key}” even though it is not supported`);
      return;
    }

    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      setStoredValue(valueToStore);
      window.dispatchEvent(new StorageEvent('storage', { key }));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };
  
  // Listen to storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && isMounted) {
        setStoredValue(readValue());
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, readValue, isMounted]);


  return [storedValue, setValue];
}
