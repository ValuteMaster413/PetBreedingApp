import { useNavigate } from "react-router-dom";
import { getCsrfToken } from "../../api/authService";

const ChatButton = ({ targetUserId, targetUsername }) => {
    const navigate = useNavigate();

    const handleClick = async () => {
        try {
            const csrf = await getCsrfToken();

            const createRes = await fetch(`http://localhost:8000/chats/create_chat/${targetUserId}/`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "X-CSRFToken": csrf
                }
            });

            const createData = await createRes.json();

            if (createData.chat_id) {
                navigate(`/chat/${createData.chat_id}`);
            } else {
                alert("Помилка при створенні або відкритті чату.");
            }
        } catch (err) {
            console.error("Помилка:", err);
            alert("Не вдалося створити чат.");
        }
    };

    return (
        <button className="btn-modal-small" onClick={handleClick}>
            ✉ Написати повідомлення {targetUsername ? `(${targetUsername})` : ""}
        </button>
    );
};

export default ChatButton;
