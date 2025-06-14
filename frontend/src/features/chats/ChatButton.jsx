import { useNavigate } from "react-router-dom";
import { getCsrfToken } from "../../api/authService";
import { useTranslation } from "react-i18next";

const ChatButton = ({ targetUserId, targetUsername }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleClick = async () => {
        try {
            const csrf = await getCsrfToken();
            const res = await fetch(`http://localhost:8000/chats/create_chat/${targetUserId}/`, {
                method: "POST",
                credentials: "include",
                headers: { "X-CSRFToken": csrf }
            });

            const data = await res.json();
            if (data.chat_id) {
                navigate(`/chats/${data.chat_id}`);
            } else {
                alert(t("chat_button.error_create"));
            }
        } catch (err) {
            console.error("Error:", err);
            alert(t("chat_button.error_failed"));
        }
    };

    return (
        <button className="btn-modal-small" onClick={handleClick}>
            ✉ {t("chat_button.send_message")}
        </button>
    );
};

export default ChatButton;
