import { useState, useContext } from "react";
import AuthContext from "../../store/AuthContext";
import { useNavigate } from "react-router-dom";

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
            navigate("/profile"); // Перенаправление после успешного входа
        } catch (error) {
            console.error("Ошибка входа:", error);
        }
    };


    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="username" placeholder="Username" onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} />
            <button type="submit">Login</button>
        </form>
    );
};

export default LoginForm;