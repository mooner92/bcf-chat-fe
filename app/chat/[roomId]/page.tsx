'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params.roomId;
  const userId = 'user-1';

  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected:', newSocket.id);
      newSocket.emit('join_room', { roomId, userId });
    });

    newSocket.on('previous_messages', (msgs) => {
      setMessages(msgs);
    });

    newSocket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, userId]);

  const sendMessage = () => {
    if (!socket || !input.trim()) return;
    socket.emit('send_message', { roomId, senderId: userId, content: input });
    setInput('');
  };

  return (
    <div className="p-4">
      <h1>Room: {roomId}</h1>
      <div style={{ border: '1px solid #ccc', height: 300, overflowY: 'auto', marginBottom: 10 }}>
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.sender_id}:</strong> {m.content}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Message"
        style={{ marginRight: 5 }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}