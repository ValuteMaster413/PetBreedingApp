import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:8000/chats/all_chats/", { withCredentials: true })
            .then(res => setChats(res.data.chats))
            .catch(err => console.error("Не вдалося завантажити чати:", err));
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
