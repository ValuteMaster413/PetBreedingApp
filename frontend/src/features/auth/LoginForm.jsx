import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import AuthContext from "../../app/context/AuthContext";
import { useTranslation } from "react-i18next";
import "./LoginForm.css";

const LoginForm = () => {
    const { t } = useTranslation();
    const { signIn } = useContext(AuthContext);
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await signIn(credentials.username, credentials.password);
            navigate("/profile");
        } catch (error) {
            setError(t("errors.login_failed") || "Помилка входу");
            console.error("Login error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-form">
            <h2>{t("login.title")}</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder={t("login.username")}
                    value={credentials.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder={t("login.password")}
                    value={credentials.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit" disabled={isSubmitting}>
                    {t("login.submit")}
                </button>
            </form>
            <p className="text-sm text-gray-600 mt-4 text-center">
                {t("login.register_question")}{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                    {t("login.register_link")}
                </Link>
            </p>
        </div>
    );
};

export default LoginForm;
