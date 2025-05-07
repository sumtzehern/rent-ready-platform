import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { messageService, Message } from "@/services/messageService";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MessagePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { receiverId } = useParams<{ receiverId: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [receivers, setReceivers] = useState<{ id: string, username: string }[]>([]);
  const [selectedReceiver, setSelectedReceiver] = useState<string | null>(receiverId || null);

  // Identify whether current user is admin
  const resolvedId = user?.username === "admin" ? "admin" : user?.id;

  useEffect(() => {
    const loadConversations = async () => {
      if (!resolvedId) return;

      try {
        setLoading(true);
        const sent = await messageService.getBySenderId(resolvedId);
        const received = await messageService.getByReceiverId(resolvedId);

        const uniqueUsers = new Map();

        sent.forEach(msg => {
            if (!uniqueUsers.has(msg.receiver_id)) {
              uniqueUsers.set(msg.receiver_id, {
                id: msg.receiver_id,
                username: msg.receiver_id === "admin" ? msg.f_host_username : msg.f_guest_username || msg.receiver_id
              });
            }
          });
          
          received.forEach(msg => {
            if (!uniqueUsers.has(msg.sender_id)) {
              uniqueUsers.set(msg.sender_id, {
                id: msg.sender_id,
                username: msg.sender_id === "admin" ? msg.f_host_username : msg.f_guest_username || msg.sender_id
              });
            }
          });          

        setReceivers(Array.from(uniqueUsers.values()));

        if (!selectedReceiver && uniqueUsers.size > 0) {
          setSelectedReceiver(Array.from(uniqueUsers.keys())[0]);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [resolvedId, selectedReceiver]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!resolvedId || !selectedReceiver) return;

      try {
        setLoading(true);
        const conversation = await messageService.getConversation(resolvedId, selectedReceiver);
        setMessages(conversation);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [resolvedId, selectedReceiver]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user || !selectedReceiver) return;

    try {
      setSending(true);
      const isHost = user.username === 'admin';

      const newMessage = {
        text: messageText.trim(),
        sender_id: resolvedId,
        receiver_id: selectedReceiver,
        f_host_username: isHost ? user.username : undefined,
        f_guest_username: !isHost ? user.username : undefined,
      };

      await messageService.create(newMessage);
      setMessageText("");

      const updatedConversation = await messageService.getConversation(resolvedId, selectedReceiver);
      setMessages(updatedConversation);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const selectConversation = (receiverId: string) => {
    setSelectedReceiver(receiverId);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p>Please log in to view messages.</p>
        <Button onClick={() => navigate("/login")} className="mt-4">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[70vh]">
        <div className="col-span-1 border rounded-lg overflow-hidden">
          <div className="bg-muted p-4 border-b">
            <h2 className="font-medium">Conversations</h2>
          </div>
          <ScrollArea className="h-[calc(70vh-56px)]">
            <div className="p-2 space-y-1">
              {loading && receivers.length === 0 ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : receivers.length > 0 ? (
                receivers.map(receiver => (
                  <Button
                    key={receiver.id}
                    variant={selectedReceiver === receiver.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => selectConversation(receiver.id)}
                  >
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>{receiver.username[0]}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{receiver.username}</span>
                  </Button>
                ))
              ) : (
                <p className="text-center text-muted-foreground p-4">
                  No conversations found
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="col-span-1 md:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b py-3">
              <div className="flex items-center">
                {selectedReceiver && (
                  <>
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>
                        {receivers.find(r => r.id === selectedReceiver)?.username[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {receivers.find(r => r.id === selectedReceiver)?.username || 'User'}
                    </span>
                  </>
                )}
                {!selectedReceiver && <span>Select a conversation</span>}
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div 
                        key={message.message_id}
                        className={`flex ${message.sender_id === resolvedId ? "justify-end" : "justify-start"}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.sender_id === resolvedId 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          }`}
                        >
                          <p>{message.text}</p>
                          {message.created_at && (
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedReceiver ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No messages yet</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Select a conversation to view messages</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            <CardFooter className="border-t p-3">
              {selectedReceiver && (
                <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!messageText.trim() || sending}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
