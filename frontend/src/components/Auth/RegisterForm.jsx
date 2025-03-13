import { useState, useContext } from "react";
import AuthContext from "../../store/AuthContext";

const RegisterForm = () => {
    const { signUp } = useContext(AuthContext);
    const [userData, setUserData] = useState({
        username: "",
        password: "",
        email: "",
        phone: ""
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const response = await signUp(userData);
            if (response.success) {
                setSuccess("Регистрация успешна! Теперь можно войти.");
            }
        } catch (err) {
            setError(err.error || "Ошибка при регистрации");
        }
    };

    return (
        <div>
            <h2>Регистрация</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" placeholder="Имя пользователя" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="text" name="phone" placeholder="Телефон" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Пароль" onChange={handleChange} required />
                <button type="submit">Зарегистрироваться</button>
            </form>
        </div>
    );
};

export default RegisterForm;
