
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { formatDistanceToNowStrict } from 'date-fns';

export const RealtimeTimestamp = ({ date, isEdited }: { date: Date | string | Timestamp, isEdited?: boolean }) => {
    const [relativeTime, setRelativeTime] = useState('');

    const formatTimestamp = useCallback((d: Date | string | Timestamp): string => {
        let dateObj: Date;

        if (d instanceof Timestamp) {
            dateObj = d.toDate();
        } else if (d instanceof Date) {
            dateObj = d;
        } else {
            dateObj = new Date(d);
        }

        if (isNaN(dateObj.getTime())) return 'Invalid date';
        
        return formatDistanceToNowStrict(dateObj, { addSuffix: true });
    }, []);

    useEffect(() => {
        setRelativeTime(formatTimestamp(date));
        
        const interval = setInterval(() => {
            setRelativeTime(formatTimestamp(date));
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [date, formatTimestamp]);

    return (
        <>
            {relativeTime}
            {isEdited && <span className="text-muted-foreground/80"> • Edited</span>}
        </>
    );
};
