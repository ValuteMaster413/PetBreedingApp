import {useParams, useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import "./ChatRoom.css";
import EditMessageModal from "./EditMessageModal";
import "./EditMessageModal.css";
import Header from "../shared/components/Header";


const ChatRoom = () => {
    const {t} = useTranslation();
    const {chatId} = useParams();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const socketRef = useRef(null);
    const bottomRef = useRef(null);
    const [editModal, setEditModal] = useState({open: false, messageId: null, initialText: ""});
    const [currentUsername, setCurrentUsername] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        fetch(`http://localhost:8000/users/my_info/`, {credentials: "include"})
            .then(res => res.json())
            .then(data => {
                if (data.chats && data.chats.length > 0) {
                    setCurrentUsername(data.chats[0].username);

                }
            })
            .catch(() => console.error(t("chatroom.error_username")));
    }, [t]);

    useEffect(() => {
        fetch(`http://localhost:8000/chats/all_messages/${chatId}/`, {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setMessages(data.messages || []))
            .catch(() => alert(t("chatroom.error_messages")));
    }, [chatId, t]);

    useEffect(() => {
        const socket = new WebSocket(`ws://${window.location.hostname}:8000/ws/chat/${chatId}/`);
        socketRef.current = socket;

        socket.onmessage = event => {
            const data = JSON.parse(event.data);
            setMessages(prev => {
                if (data.action === "send") return [...prev, data];
                if (data.action === "edit") return prev.map(m =>
                    m.message_id === data.message_id ? {...m, message: data.message} : m
                );
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
        if (text.trim() && socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({action: "send", message: text}));
            setText("");
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

    const fetchUserIdByUsername = async (username) => {
        try {
            const res = await fetch(`http://localhost:8000/users/find_id/?username=${username}`, {
                credentials: "include"
            });
            const data = await res.json();
            return data.user_id;
        } catch (e) {
            console.error("Failed to fetch user ID:", e);
            return null;
        }
    };

    return (
        <>
            <Header/>
            <div className="chat-room">
                <div className="messages-box">
                    {messages.map(msg => {
                        const senderName = msg.username || msg.sender;
                        const messageText = msg.message || msg.text;

                        return (
                            <div
                                key={msg.message_id}
                                className={`message-wrapper ${senderName === currentUsername ? "user" : "other"}`}
                            >
                                <div className="message">
                                    <strong
                                        className="sender-link"
                                        style={{ cursor: "pointer", color: "#2563eb" }}
                                        onClick={async () => {
                                            const op_sender = msg.username || msg.sender;
                                            if (op_sender !== currentUsername) {
                                                const userId = await fetchUserIdByUsername(op_sender);
                                                if (userId) navigate(`/profile/${userId}`);
                                            }
                                        }}
                                    >
                                        {senderName}
                                    </strong>{" "}
                                    {messageText}
                                </div>
                                {senderName === currentUsername && (
                                    <div className="actions">
                                        <button onClick={() => openEditModal(msg.message_id, messageText)}>
                                            {t("chatroom.edit_button")}
                                        </button>
                                        <button onClick={() => deleteMessage(msg.message_id)}>
                                            {t("chatroom.delete_button")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={bottomRef}></div>
                </div>
                <div className="input-box">
                    <input
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder={t("chatroom.placeholder")}
                    />
                    <button onClick={sendMessage}>{t("chatroom.send")}</button>
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
        </>

    );
};

export default ChatRoom;
