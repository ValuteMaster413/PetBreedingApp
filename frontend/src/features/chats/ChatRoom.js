import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const ChatRoom = () => {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const socketRef = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        console.log("🛰 Connecting to chat", chatId); // <-- перевірка chatId

        fetch(`http://localhost:8000/chats/all_messages/${chatId}/`, {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setMessages(data.messages || []))
            .catch(() => alert("Помилка при завантаженні повідомлень"));

        const socket = new WebSocket(`ws://${window.location.hostname}:8000/ws/chats/${chatId}/`);
        socketRef.current = socket;

        // ЛОГИ для діагностики з'єднання
        socket.onopen = () => {
            console.log("✅ WebSocket open");
        };

        socket.onclose = (e) => {
            console.warn("❌ WebSocket closed", e);
        };

        socket.onerror = (err) => {
            console.error("💥 WebSocket error", err);
        };

        socket.onmessage = event => {
            const data = JSON.parse(event.data);
            setMessages(prev => {
                if (data.action === "send") return [...prev, data];
                if (data.action === "edit") return prev.map(m => m.message_id === data.message_id ? { ...m, text: data.text } : m);
                if (data.action === "delete") return prev.filter(m => m.message_id !== data.message_id);
                return prev;
            });
        };

        return () => socket.close();
    }, [chatId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (text.trim() && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ action: "send", message: text }));
            setText("");
        } else {
            console.warn("Socket is not ready to send");
        }
    };

    const editMessage = (id) => {
        const newText = prompt("Нове повідомлення:");
        if (newText && socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ action: "edit", message_id: id, message: newText }));
        }
    };

    const deleteMessage = (id) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ action: "delete", message_id: id }));
        }
    };

    return (
        <div className="chat-room">
            <div className="messages-box">
                {messages.map(msg => (
                    <div key={msg.message_id} className="message">
                        <strong>{msg.sender}: </strong>{msg.text}
                        <div className="actions">
                            <button onClick={() => editMessage(msg.message_id)}>✏️</button>
                            <button onClick={() => deleteMessage(msg.message_id)}>🗑</button>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef}></div>
            </div>
            <div className="input-box">
                <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Написати повідомлення..."
                />
                <button onClick={sendMessage}>Надіслати</button>
            </div>
        </div>
    );
};

export default ChatRoom;
