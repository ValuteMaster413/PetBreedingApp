import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthContext from "../../app/context/AuthContext";
import LanguageSwitcher from "../shared/components/LanguageSwitcher";
import "./RegisterForm.css";

const RegisterForm = () => {
    const { t } = useTranslation();
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
            setError(err.error || t("errors.register_failed"));
        }
    };

    return (
        <div className="register-form">
            <LanguageSwitcher />
            <h2>{t("register.title")}</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder={t("register.username")}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder={t("register.email")}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="phone"
                    placeholder={t("register.phone")}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder={t("register.password")}
                    onChange={handleChange}
                    required
                />
                <button type="submit">{t("register.submit")}</button>
            </form>
            <p className="text-sm text-gray-600 mt-4">
                {t("register.login_question")}{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                    {t("register.login_link")}
                </Link>
            </p>
        </div>
    );
};

export default RegisterForm;
