import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../app/context/AuthContext";
import "./RegisterForm.css";
import { Link } from "react-router-dom";

const RegisterForm = () => {
    const navigate = useNavigate();
    const { signUp, signIn } = useContext(AuthContext);

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
                await signIn(userData.username, userData.password);
                navigate("/profile");
            }
        } catch (err) {
            setError(err.error || "Помилка при реєстрації");
        }
    };

    return (
        <div className="register-form">
            <h2>Реєстрація</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" placeholder="Ім’я користувача" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="text" name="phone" placeholder="Телефон" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Пароль" onChange={handleChange} required />
                <button type="submit">Зареєструватися</button>
            </form>
            <p className="text-sm text-gray-600 mt-4">
                Вже маєте акаунт? <Link to="/login" className="text-blue-600 hover:underline">Увійти</Link>
            </p>
        </div>
    );
};

export default RegisterForm;
