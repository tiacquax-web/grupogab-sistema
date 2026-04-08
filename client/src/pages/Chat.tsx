import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Send, Plus, Users, MessageSquare } from "lucide-react";

function initials(name: string | null | undefined) { if (!name) return "?"; return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase(); }
function timeAgo(date: Date | string) { const d = new Date(date); return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }

export default function Chat() {
  const { user } = useAuth();
  const [selectedConv, setSelectedConv] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [openNew, setOpenNew] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [groupName, setGroupName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], refetch: refetchConvs } = trpc.chat.listConversations.useQuery();
  const { data: availableUsers = [] } = trpc.chat.listUsers.useQuery();
  const { data: messages = [], refetch: refetchMessages } = trpc.chat.listMessages.useQuery(
    { conversationId: selectedConv! },
    { enabled: !!selectedConv, refetchInterval: 3000 }
  );
  const { data: participants = [] } = trpc.chat.getParticipants.useQuery(
    { conversationId: selectedConv! },
    { enabled: !!selectedConv }
  );

  const createConvMutation = trpc.chat.createConversation.useMutation({
    onSuccess: (res) => { toast.success("Conversa criada!"); setOpenNew(false); setSelectedUsers([]); setGroupName(""); refetchConvs(); setSelectedConv(res.id); },
    onError: () => toast.error("Erro ao criar conversa"),
  });

  const sendMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => { setMessage(""); refetchMessages(); },
    onError: () => toast.error("Erro ao enviar mensagem"),
  });

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !selectedConv) return;
    sendMutation.mutate({ conversationId: selectedConv, content: message.trim() });
  };

  const handleCreateConv = () => {
    if (selectedUsers.length === 0) { toast.error("Selecione pelo menos um participante"); return; }
    createConvMutation.mutate({ name: groupName || undefined, participantIds: selectedUsers, isGroup: selectedUsers.length > 1 });
  };

  const toggleUser = (id: number) => setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);

  const selectedConvData = conversations.find((c: any) => c.id === selectedConv);

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Sidebar */}
      <div className="w-72 shrink-0 flex flex-col border border-border rounded-xl overflow-hidden bg-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Mensagens</h2>
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 w-8 p-0"><Plus className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Nova Conversa</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Nome do grupo (opcional)</Label>
                  <Input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Ex: Equipe Obra A..." />
                </div>
                <div className="space-y-2">
                  <Label>Participantes *</Label>
                  {availableUsers.length === 0 && <p className="text-sm text-muted-foreground">Nenhum outro usuário cadastrado</p>}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableUsers.map((u: any) => (
                      <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer" onClick={() => toggleUser(u.id)}>
                        <Checkbox checked={selectedUsers.includes(u.id)} onCheckedChange={() => toggleUser(u.id)} />
                        <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{initials(u.name)}</AvatarFallback></Avatar>
                        <div><p className="text-sm font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setOpenNew(false)}>Cancelar</Button>
                  <Button className="flex-1" onClick={handleCreateConv} disabled={createConvMutation.isPending}>Criar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground p-4 text-center">
              <MessageSquare className="h-10 w-10 opacity-30" />
              <p className="text-sm">Nenhuma conversa ainda. Clique em + para iniciar.</p>
            </div>
          )}
          {conversations.map((conv: any) => (
            <button key={conv.id} onClick={() => setSelectedConv(conv.id)}
              className={`w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left ${selectedConv === conv.id ? "bg-accent" : ""}`}>
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-xs">{conv.isGroup ? <Users className="h-4 w-4" /> : initials(conv.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{conv.name || "Conversa"}</p>
                <p className="text-xs text-muted-foreground">{conv.isGroup ? "Grupo" : "Direto"}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col border border-border rounded-xl overflow-hidden bg-card">
        {!selectedConv ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <MessageSquare className="h-16 w-16 opacity-20" />
            <p className="text-lg font-medium">Selecione uma conversa</p>
            <p className="text-sm">ou crie uma nova clicando no botão +</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs">{selectedConvData?.isGroup ? <Users className="h-4 w-4" /> : initials(selectedConvData?.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{selectedConvData?.name || "Conversa"}</p>
                <p className="text-xs text-muted-foreground">{participants.map((p: any) => p.name).join(", ")}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && <div className="text-center text-muted-foreground text-sm py-8">Nenhuma mensagem ainda. Seja o primeiro!</div>}
              {messages.map((msg: any) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <Avatar className="h-7 w-7 shrink-0 mt-1"><AvatarFallback className="text-[10px]">{initials(msg.senderName)}</AvatarFallback></Avatar>
                    <div className={`max-w-[70%] space-y-1 ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                      {!isMe && <p className="text-xs text-muted-foreground px-1">{msg.senderName}</p>}
                      <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-accent rounded-tl-sm"}`}>
                        {msg.content}
                      </div>
                      <p className="text-[10px] text-muted-foreground px-1">{timeAgo(msg.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Digite uma mensagem..." className="flex-1"
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
              <Button size="icon" onClick={handleSend} disabled={!message.trim() || sendMutation.isPending}><Send className="h-4 w-4" /></Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
