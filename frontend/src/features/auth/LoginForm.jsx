import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../../app/context/AuthContext";
import "./LoginForm.css";

const LoginForm = () => {
    const { signIn } = useContext(AuthContext);
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signIn(credentials.username, credentials.password);
            navigate("/profile");
        } catch (error) {
            console.error("Ошибка входа:", error);
        }
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <h2>Вхід</h2>
            <input type="text" name="username" placeholder="Ім’я користувача" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Пароль" onChange={handleChange} required />
            <button type="submit">Увійти</button>
            <p className="register-link">
                Ще не маєте акаунту? <Link to="/register">Зареєструватися</Link>
            </p>
        </form>
    );
};

export default LoginForm;
