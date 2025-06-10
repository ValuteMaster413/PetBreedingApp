import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import "./ChatList.css";
import Header from "../shared/components/Header";

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const navigate = useNavigate();
    const {t} = useTranslation();
    const [currentUsername, setCurrentUsername] = useState("");

    useEffect(() => {
        fetch("http://localhost:8000/chats/all_chats/", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setChats(data.chats || []))
            .catch(() => alert(t("chatlist.error_loading")));
    }, []);

    useEffect(() => {
        fetch("http://localhost:8000/users/my_info/", {credentials: "include"})
            .then(res => res.json())
            .then(data => {
                if (data.chats?.[0]?.username) {
                    setCurrentUsername(data.chats[0].username);
                }
            })
            .catch(() => alert(t("chatlist.error_loading_user")));
    }, []);

    return (
        <>
            <Header/>
            <div className="chat-list-container">
                <h2>{t("chatlist.title")}</h2>
                {chats.length === 0 ? (
                    <p className="no-chats">{t("chatlist.empty")}</p>
                ) : (
                    <ul className="chat-list-ul">
                        {chats.map((chat, idx) => {
                            const otherUser = chat.user_1 === currentUsername ? chat.user_2 : chat.user_1;
                            return (
                                <li key={idx}>
                                    <button
                                        className="chat-button"
                                        onClick={() => navigate(`/chats/${chat.chat_id}`)}
                                    >
                                        {t("chatlist.with_user", {username: otherUser})}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </>
    );
};

export default ChatList;
