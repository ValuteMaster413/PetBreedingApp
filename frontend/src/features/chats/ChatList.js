import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Header from "../shared/components/Header";
import "./ChatList.css";

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        axios.get("http://localhost:8000/chats/all_chats/", { withCredentials: true })
            .then(res => setChats(res.data.chats))
            .catch(err => console.error(t("chatlist.error_loading"), err));
    }, [t]);

    return (
        <>
            <Header />
            <div className="chat-list-container">
                <h2>{t("chatlist.title")}</h2>
                {chats.length === 0 ? (
                    <p className="no-chats">{t("chatlist.empty")}</p>
                ) : (
                    <ul className="chat-list-ul">
                        {chats.map((chat, idx) => (
                            <li key={idx}>
                                <button
                                    className="chat-button"
                                    onClick={() => navigate(`/chats/${chat.chat_id}`)}
                                >
                                    {t("chatlist.with_users", {
                                        user1: chat.user_1,
                                        // user2: chat.user_2
                                    })}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
};

export default ChatList;
