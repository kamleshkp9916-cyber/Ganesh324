
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FollowingUser {
  id: string;
  name: string;
  avatar: string;
}

interface FollowingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followingList: FollowingUser[];
  onUnfollow: (userId: string) => void;
}

export function FollowingSheet({ open, onOpenChange, followingList, onUnfollow }: FollowingSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>Following</SheetTitle>
          <SheetDescription>
            Manage the accounts you are following.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {followingList.length > 0 ? (
              followingList.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUnfollow(user.id)}
                  >
                    Unfollow
                  </Button>
                </div>
              ))
            ) : (
                <div className="text-center text-muted-foreground pt-10">
                    <p>You are not following anyone yet.</p>
                </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
