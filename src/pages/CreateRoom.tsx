import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { nanoid } from 'nanoid';
import { Clock, Lock, Unlock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RoomSettings {
  permanent: boolean;
  shareDetails: boolean;
}

export default function CreateRoom() {
  const [settings, setSettings] = useState<RoomSettings>({
    permanent: false,
    shareDetails: true,
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      const roomId = nanoid(10);
      const roomRef = doc(db, 'rooms', roomId);
      
      await setDoc(roomRef, {
        createdAt: new Date().toISOString(),
        createdBy: user?.uid,
        permanent: settings.permanent,
        shareDetails: settings.shareDetails,
        members: [user?.uid],
      });

      toast.success('Room created successfully!');
      navigate(`/chat/${roomId}`);
    } catch (error) {
      toast.error('Failed to create room');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Create Chat Room
          </h2>

          <div className="space-y-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
              onClick={() => setSettings(s => ({ ...s, permanent: !s.permanent }))}
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-200">Room Duration</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {settings.permanent ? 'Permanent room' : 'Temporary room (24 hours)'}
                  </p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                settings.permanent ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  settings.permanent ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
              onClick={() => setSettings(s => ({ ...s, shareDetails: !s.shareDetails }))}
            >
              <div className="flex items-center space-x-3">
                {settings.shareDetails ? (
                  <Unlock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-200">Profile Visibility</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {settings.shareDetails ? 'Share profile details' : 'Stay anonymous'}
                  </p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                settings.shareDetails ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  settings.shareDetails ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={createRoom}
              className="w-full bg-primary-600 text-white rounded-lg p-4 font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Create Room
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}