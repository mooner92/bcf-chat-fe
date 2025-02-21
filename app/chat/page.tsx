'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function ChatPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // 1) 소켓 서버 연결 (NestJS 백엔드 URL & 포트에 맞춰 수정)
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    // 2) 연결되면 서버에서 로그 찍힘
    newSocket.on('connect', () => {
      console.log('Connected to server:', newSocket.id);

      // 원하는 방에 join (예: 'test-room')
      newSocket.emit('join_room', { roomId: 'test-room' });
    });

    // 3) 이전 메시지(서버에서 join 시점에 보낼 수도 있음)
    newSocket.on('previous_messages', (msgs) => {
      setMessages(msgs);
    });

    // 4) 새 메시지 수신
    newSocket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // 5) 소켓 객체를 상태에 저장
    setSocket(newSocket);

    // 언마운트 시 소켓 연결 해제
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // 메시지 전송 함수
  const sendMessage = () => {
    if (!socket || !input.trim()) return;

    // 서버로 send_message 이벤트 전송
    socket.emit('send_message', {
      roomId: 'test-room',
      senderId: 'myTestUser', // 로그인 기능이 없으니 임시 아이디
      content: input,
    });

    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
      <h1>Chat Page</h1>
      <div style={{ border: '1px solid #ccc', height: 300, overflowY: 'auto', margin: '10px 0' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 5 }}>
            <strong>{msg.sender_id}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div>
        <input
          style={{ marginRight: 5 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
