import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../store/AuthContext";

const Profile = () => {
    const { user, signOut } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate("/login");
        } catch (error) {
            console.error("Ошибка при выходе:", error);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Профиль пользователя</h2>
            {user ? (
                <div style={styles.profileCard}>
                    <p><strong>Имя пользователя:</strong> {user.username}</p>
                    <p><strong>Email:</strong> user@example.com</p>
                    <p><strong>Телефон:</strong> +1234567890</p>
                    <button style={styles.button} onClick={handleLogout}>Выйти</button>
                </div>
            ) : (
                <p>Загрузка...</p>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
    },
    title: {
        fontSize: "24px",
        marginBottom: "20px",
    },
    profileCard: {
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
        textAlign: "left",
        width: "300px",
    },
    button: {
        marginTop: "20px",
        padding: "10px 20px",
        backgroundColor: "#ff4d4d",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    }
};

export default Profile;
