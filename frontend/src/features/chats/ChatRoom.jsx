import {useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import "./ChatRoom.css";
import EditMessageModal from "./EditMessageModal";
import "./EditMessageModal.css";


const ChatRoom = () => {
    const {chatId} = useParams();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const socketRef = useRef(null);
    const bottomRef = useRef(null);
    const [editModal, setEditModal] = useState({open: false, messageId: null, initialText: ""});


    useEffect(() => {
        console.log("🛰 Connecting to chat", chatId); // <-- перевірка chatId

        fetch(`http://localhost:8000/chat/all_messages/${chatId}/`, {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setMessages(data.messages || []))
            .catch(() => alert("Помилка при завантаженні повідомлень"));

        const socket = new WebSocket(`ws://${window.location.hostname}:8000/ws/chat/${chatId}/`);
        socketRef.current = socket;


        socket.onmessage = event => {
            const data = JSON.parse(event.data);
            setMessages(prev => {
                if (data.action === "send") return [...prev, data];
                if (data.action === "edit") return prev.map(m => m.message_id === data.message_id ? {
                    ...m,
                    text: data.text
                } : m);
                if (data.action === "delete") return prev.filter(m => m.message_id !== data.message_id);
                return prev;
            });
        };

        return () => socket.close();
    }, [chatId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    const sendMessage = () => {
        if (text.trim() && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({action: "send", message: text}));
            setText("");
            setTimeout(() => window.location.reload(), 100);
        } else {
            console.warn("Socket is not ready to send");
        }
    };


    const openEditModal = (id, text) => {
        setEditModal({open: true, messageId: id, initialText: text});
    };

    const handleEditSubmit = (id, newText) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({action: "edit", message_id: id, message: newText}));
        }
        setEditModal({open: false, messageId: null, initialText: ""});
    };

    const deleteMessage = (id) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({action: "delete", message_id: id}));
        }
    };
    const [currentUsername, setCurrentUsername] = useState("");
    useEffect(() => {
        fetch("http://localhost:8000/users/my_info/", {credentials: "include"})
            .then(res => res.json())
            .then(data => {
                if (data.chats && data.chats.length > 0) {
                    setCurrentUsername(data.chats[0].username);
                }
            })
            .catch(() => console.error("Не вдалося отримати ім’я поточного користувача"));
    }, []);

    return (
        <div className="chat-room">
            <div className="messages-box">
                {messages.map(msg => (
                    <div
                        key={msg.message_id}
                        className={`message-wrapper ${msg.sender === currentUsername ? "user" : "other"}`}
                    >
                        <div className="message">
                            <strong>{msg.sender}</strong>
                            {msg.text}
                        </div>
                        {msg.sender === currentUsername && (
                            <div className="actions">
                                <button onClick={() => openEditModal(msg.message_id, msg.text)}>✏️</button>
                                <button onClick={() => deleteMessage(msg.message_id)}>🗑</button>
                            </div>
                        )}
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
            {editModal.open && (
                <EditMessageModal
                    messageId={editModal.messageId}
                    initialText={editModal.initialText}
                    onSave={handleEditSubmit}
                    onCancel={() => setEditModal({open: false, messageId: null, initialText: ""})}
                />
            )}
        </div>
    );
};

export default ChatRoom;
