
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const initialFlaggedContent = [
  { id: 1, type: 'User Profile', content: 'Inappropriate bio for user "SpamBot99"', reportedBy: 'AdminBot', status: 'Pending' },
  { id: 2, type: 'Product Image', content: 'Misleading image for "Magic Beans"', reportedBy: 'JaneDoe', status: 'Pending' },
  { id: 3, type: 'Chat Message', content: 'Harassment in chat from "User123"', reportedBy: 'User456', status: 'Pending' },
  { id: 4, type: 'Live Stream', content: 'Off-topic content in "GadgetGuru" stream', reportedBy: 'CommunityMod', status: 'Reviewed' },
];

export function ContentModerationSettings() {
  const [flaggedContent, setFlaggedContent] = useState(initialFlaggedContent);
  const { toast } = useToast();

  const handleReview = (id: number) => {
    setFlaggedContent(prev => prev.map(item => item.id === id ? { ...item, status: 'Reviewed' } : item));
    toast({ title: "Content Reviewed", description: "The status has been updated." });
  };

  const handleRemove = (id: number, content: string) => {
    setFlaggedContent(prev => prev.filter(item => item.id !== id));
    toast({ title: "Content Removed", description: `"${content}" has been taken down.`, variant: "destructive" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flagged Content for Review</CardTitle>
        <CardDescription>Review content reported by users or the system for violations.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Content/Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flaggedContent.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Badge variant="outline">{item.type}</Badge>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{item.content}</p>
                  <p className="text-xs text-muted-foreground">Reported by: {item.reportedBy}</p>
                </TableCell>
                <TableCell>
                    <Badge variant={item.status === 'Pending' ? 'destructive' : 'secondary'}>{item.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleReview(item.id)} disabled={item.status === 'Reviewed'}>Review</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleRemove(item.id, item.content)}>Remove</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {flaggedContent.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        No flagged content to review.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
