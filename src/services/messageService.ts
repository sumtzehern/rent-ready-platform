import { supabase } from '../lib/supabase';

export interface Message {
  message_id: number;
  text: string;
  sender_id: string;
  receiver_id: string;
}

export const messageService = {
  // Get all messages
  async getAll() {
    const { data, error } = await supabase
      .from('message')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Get messages by sender ID
  async getBySenderId(senderId: string) {
    const { data, error } = await supabase
      .from('message')
      .select('*')
      .eq('sender_id', senderId);
    
    if (error) throw error;
    return data;
  },

  // Get messages by receiver ID
  async getByReceiverId(receiverId: string) {
    const { data, error } = await supabase
      .from('message')
      .select('*')
      .eq('receiver_id', receiverId);
    
    if (error) throw error;
    return data;
  },

  // Get conversation between two users
  async getConversation(user1: string, user2: string) {
    const { data, error } = await supabase
      .from('message')
      .select('*')
      .or(`and(sender_id.eq.${user1},receiver_id.eq.${user2}),and(sender_id.eq.${user2},receiver_id.eq.${user1})`)
      .order('message_id', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Create a new message
  async create(message: Omit<Message, 'message_id'>) {
    const { data, error } = await supabase
      .from('message')
      .insert([message])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Update a message
  async update(messageId: number, updates: Partial<Message>) {
    const { data, error } = await supabase
      .from('message')
      .update(updates)
      .eq('message_id', messageId)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Delete a message
  async delete(messageId: number) {
    const { error } = await supabase
      .from('message')
      .delete()
      .eq('message_id', messageId);
    
    if (error) throw error;
    return true;
  }
};
