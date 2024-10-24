import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, collection, query, orderBy, onSnapshot, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Message as MessageType, Room } from '../types/room';
import Message from '../components/Message';
import { Send, Copy, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Chat() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) return;
      
      const roomRef = doc(db, 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);
      
      if (!roomSnap.exists()) {
        toast.error('Room not found');
        navigate('/');
        return;
      }
      
      setRoom(roomSnap.data() as Room);
      setLoading(false);
    };

    fetchRoom();
  }, [roomId, navigate]);

  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MessageType[];
      
      setMessages(newMessages);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || !user) return;

    try {
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        content: newMessage,
        senderId: user.uid,
        senderName: room?.shareDetails ? user.displayName : 'Anonymous',
        timestamp: new Date().toISOString(),
      });

      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId || '');
    toast.success('Room ID copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4">
        <div className="h-[calc(100vh-4rem)] flex flex-col">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4 flex items-center justify-between border-b dark:border-gray-700"
          >
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyRoomId}
              className="flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/30"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Room ID
            </motion.button>
          </motion.div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  showSender={room?.shareDetails || false}
                />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={sendMessage}
            className="py-4 border-t dark:border-gray-700"
          >
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}