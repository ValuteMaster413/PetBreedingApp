import {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import "./ChatList.css";
import Header from "../shared/components/Header";
import { getCsrfToken } from "../../api/authService"
import ConfirmModal from "../shared/components/ConfirmModal";

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const navigate = useNavigate();
    const {t} = useTranslation();
    const [currentUsername, setCurrentUsername] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [chatToDelete, setChatToDelete] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8000/chats/all_chats/", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setChats(data.chats || []))
            .catch(() => alert(t("chatlist.error_loading")));
    }, []);

    const handleRequestDelete = (chatId) => {
        setChatToDelete(chatId);
        setShowConfirm(true);
    };

    const handleConfirmDelete = async () => {
        const csrf = await getCsrfToken();
        try {
            const res = await axios.delete(`http://localhost:8000/chats/delete_chat/${chatToDelete}/`, {
                headers: {
                    "X-CSRFToken": csrf
                },
                withCredentials: true
            });

            if (res.data.success) {
                setChats(prev => prev.filter(chat => chat.chat_id !== chatToDelete));
            }
        } catch (e) {
            alert(t("chatlist.delete_failed"));
        } finally {
            setShowConfirm(false);
            setChatToDelete(null);
        }
    };

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
                                    <div className="chat-item">
                                        <button
                                            className="chat-button"
                                            onClick={() => navigate(`/chats/${chat.chat_id}`)}
                                        >
                                            {t("chatlist.with_user", { username: otherUser })}
                                        </button>
                                        <button
                                            className="chat-delete-button"
                                            onClick={() => handleRequestDelete(chat.chat_id)}
                                            title={t("chatlist.delete")}>
                                            🗑
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
            {showConfirm && (
                <ConfirmModal
                    message={t("chatlist.confirm_delete")}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => {
                        setShowConfirm(false);
                        setChatToDelete(null);
                    }}
                />
            )}
        </>
    );
};

export default ChatList;
