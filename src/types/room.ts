export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  timestamp: string;
}

export interface Room {
  createdAt: string;
  createdBy: string;
  permanent: boolean;
  shareDetails: boolean;
  members: string[];
}