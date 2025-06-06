import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8000/chats/all_chats/", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setChats(data.chats || []))
            .catch(() => alert("Не вдалося завантажити чати"));
    }, []);

    return (
        <div className="chat-list">
            <h2>Ваші чати</h2>
            {chats.length === 0 ? <p>Чатів ще немає</p> : (
                <ul>
                    {chats.map((chat, idx) => (
                        <li key={idx}>
                            <button onClick={() => navigate(`/chats/${chat.chat_id}`)}>
                                З {chat.user_1} та {chat.user_2}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ChatList;

