import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Message as MessageType } from '../types/room';

interface MessageProps {
  message: MessageType;
  showSender: boolean;
}

export default function Message({ message, showSender }: MessageProps) {
  const { user } = useAuth();
  const isOwnMessage = message.senderId === user?.uid;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[70%] ${isOwnMessage ? 'order-1' : 'order-2'}`}>
        {showSender && message.senderName && !isOwnMessage && (
          <div className="text-sm text-gray-500 dark:text-gray-400 ml-2 mb-1">
            {message.senderName}
          </div>
        )}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwnMessage
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
          }`}
        >
          {message.content}
        </div>
        <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
          isOwnMessage ? 'text-right mr-2' : 'ml-2'
        }`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </motion.div>
  );
}