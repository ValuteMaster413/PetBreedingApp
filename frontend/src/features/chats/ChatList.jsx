import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        fetch("http://localhost:8000/chats/all_chats/", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setChats(data.chats || []))
            .catch(() => alert(t("chatlist.error_loading")));
    }, []);

    return (
        <div className="chat-list">
            <h2>{t("chatlist.title")}</h2>
            {chats.length === 0 ? (
                <p>{t("chatlist.empty")}</p>
            ) : (
                <ul>
                    {chats.map((chat, idx) => (
                        <li key={idx}>
                            <button onClick={() => navigate(`/chats/${chat.chat_id}`)}>
                                {t("chatlist.with_users", {
                                    user1: chat.user_1,
                                    user2: chat.user_2
                                })}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ChatList;
