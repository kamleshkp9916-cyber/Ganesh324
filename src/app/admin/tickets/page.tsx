"use client";
import React, { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Real-time Support Dashboard (for admin)
// - Integrated into the admin layout
// - Uses local state to simulate realtime updates and presence

export default function SupportDashboardPage() {
  // sample tickets: role: "customer" or "seller"
  const [tickets, setTickets] = useState([
    {
      id: "TCK-1001",
      title: "Order not delivered",
      role: "customer",
      status: "open",
      assignee: "Unassigned",
      lastMessage: "I didn't receive my order",
      updatedAt: Date.now() - 1000 * 60 * 25,
      messages: [
        { from: "customer", text: "I didn't receive my order", ts: Date.now() - 1000 * 60 * 25 },
      ],
    },
    {
      id: "TCK-1002",
      title: "Payment captured but order pending",
      role: "seller",
      status: "open",
      assignee: "Admin A",
      lastMessage: "Payment captured but order still pending on platform",
      updatedAt: Date.now() - 1000 * 60 * 60 * 2,
      messages: [
        { from: "seller", text: "Payment captured but order still pending", ts: Date.now() - 1000 * 60 * 60 * 2 },
        { from: "admin", text: "I'll check webhook logs and retry.", ts: Date.now() - 1000 * 60 * 30 },
      ],
    },
  ]);

  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id || null);
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketRole, setNewTicketRole] = useState("customer");
  const [composerText, setComposerText] = useState("");

  const [presence, setPresence] = useState<{ [key: string]: { customer?: boolean, seller?: boolean, admin?: boolean } }>({});

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  function postMessage(ticketId: string | null, from: string, text: string) {
    if (!ticketId) return;
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const msg = { from, text, ts: Date.now() };
        return {
          ...t,
          messages: [...t.messages, msg],
          lastMessage: text,
          updatedAt: Date.now(),
        };
      })
    );
  }

  function createTicket() {
    if (!newTicketTitle.trim()) return;
    const id = `TCK-${1000 + tickets.length + 1}`;
    const ticket = {
      id,
      title: newTicketTitle.trim(),
      role: newTicketRole,
      status: "open",
      assignee: "Unassigned",
      lastMessage: "Ticket created",
      updatedAt: Date.now(),
      messages: [{ from: newTicketRole, text: newTicketTitle.trim(), ts: Date.now() }],
    };
    setTickets((p) => [ticket, ...p]);
    setNewTicketTitle("");
    setSelectedTicketId(id);
  }

  function toggleAssign(ticketId: string | null, adminName: string) {
    if (!ticketId) return;
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, assignee: adminName } : t)));
  }

  function changeStatus(ticketId: string | null, status: string) {
    if (!ticketId) return;
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status } : t)));
  }

  useEffect(() => {
    const iv = setInterval(() => {
      if (!selectedTicketId) return;
      setPresence((p) => ({ ...p, [selectedTicketId]: { customer: Math.random() > 0.5, admin: true } }));

      if (Math.random() > 0.85 && selectedTicketId) {
        postMessage(selectedTicketId, "admin", "Thank you — I'm looking into this and will update shortly.");
      }
    }, 12000);
    return () => clearInterval(iv);
  }, [selectedTicketId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages?.length]);

  return (
    <AdminLayout>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>Create or select a ticket to view the conversation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border rounded-lg p-3 bg-muted/50">
                <label className="block text-xs text-muted-foreground">Create New Ticket</label>
                <Input
                  className="w-full mt-2 p-2 rounded border bg-background text-sm"
                  placeholder="Issue summary"
                  value={newTicketTitle}
                  onChange={(e) => setNewTicketTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createTicket()}
                />
                <div className="flex items-center gap-2 mt-2">
                  <Select value={newTicketRole} onValueChange={setNewTicketRole}>
                      <SelectTrigger className="text-sm h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
                      </SelectContent>
                  </Select>
                  <Button size="sm" className="ml-auto" onClick={createTicket}><PlusCircle className="mr-2 h-4 w-4" />Create</Button>
                </div>
              </div>
              <div className="space-y-2">
                {tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={cn(`w-full text-left p-3 rounded-lg cursor-pointer border flex flex-col gap-1`, 
                      selectedTicketId === t.id ? "ring-2 ring-primary bg-secondary" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium">{t.title}</div>
                        <div className="text-xs text-muted-foreground">{t.id} • {t.role}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant={t.status === 'open' ? 'success' : t.status === 'closed' ? 'outline' : 'warning'}>{t.status}</Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-10rem)] flex flex-col">
              {!selectedTicket ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a ticket to view chat</div>
              ) : (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{selectedTicket.title}</CardTitle>
                            <CardDescription>{selectedTicket.id} • {selectedTicket.role}</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-sm">
                                <Label>Assignee</Label>
                                <Select value={selectedTicket.assignee} onValueChange={(val) => toggleAssign(selectedTicket.id, val)}>
                                    <SelectTrigger className="h-8 w-32 mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Unassigned">Unassigned</SelectItem>
                                        <SelectItem value="Admin A">Admin A</SelectItem>
                                        <SelectItem value="Admin B">Admin B</SelectItem>
                                        <SelectItem value="Support Bot">Support Bot</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="text-sm">
                                <Label>Status</Label>
                                <div className="mt-1 flex items-center gap-1">
                                    <Button size="sm" variant={selectedTicket.status === 'open' ? 'default' : 'outline'} onClick={() => changeStatus(selectedTicket.id, "open")}>Open</Button>
                                    <Button size="sm" variant={selectedTicket.status === 'pending' ? 'default' : 'outline'} onClick={() => changeStatus(selectedTicket.id, "pending")}>Pending</Button>
                                    <Button size="sm" variant={selectedTicket.status === 'closed' ? 'default' : 'outline'} onClick={() => changeStatus(selectedTicket.id, "closed")}>Close</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {selectedTicket.messages.map((m, idx) => (
                        <div key={idx} className={cn("flex items-end gap-2", m.from === "admin" ? "justify-end" : "justify-start")}>
                          {m.from !== 'admin' && (
                            <Avatar className="h-8 w-8"><AvatarFallback>{m.from.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                          )}
                          <div className={cn("max-w-md rounded-lg px-3 py-2", m.from === "admin" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                            <p className="text-sm">{m.text}</p>
                            <p className="text-xs text-right mt-1 opacity-70">{new Date(m.ts).toLocaleTimeString()}</p>
                          </div>
                           {m.from === 'admin' && (
                            <Avatar className="h-8 w-8"><AvatarFallback>A</AvatarFallback></Avatar>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="border-t p-3 text-xs text-muted-foreground">
                        Presence: 
                        <span className="font-medium text-foreground"> Customer {presence[selectedTicket.id]?.customer ? "🟢 online" : "⚪ offline"}</span> | 
                        <span className="font-medium text-foreground"> Admin {presence[selectedTicket.id]?.admin ? "🟢 online" : "⚪ offline"}</span>
                    </div>
                    <div className="p-4 border-t bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Input
                          value={composerText}
                          onChange={(e) => setComposerText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              postMessage(selectedTicket.id, "admin", composerText);
                              setComposerText("");
                            }
                          }}
                          className="flex-1"
                          placeholder="Write a message as Admin... Press Enter to send"
                        />
                        <Button
                          onClick={() => {
                            postMessage(selectedTicket.id, "admin", composerText);
                            setComposerText("");
                          }}
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
        </div>
      </main>
    </AdminLayout>
  );
}
