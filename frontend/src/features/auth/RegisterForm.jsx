import {useState, useContext} from "react";
import {useNavigate, Link} from "react-router-dom";
import {useTranslation} from "react-i18next";
import AuthContext from "../../app/context/AuthContext";
import LanguageSwitcher from "../shared/components/LanguageSwitcher";
import "./RegisterForm.css";

const RegisterForm = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {signUp, signIn} = useContext(AuthContext);

    const [userData, setUserData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        phone: ""
    });

    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState(null);

    const validate = () => {
        const newErrors = {};
        const {username, password, confirmPassword, email, phone} = userData;


        const sqlPattern = /['"=;]|--/;

        if (!username.trim() || sqlPattern.test(username))
            newErrors.username = t("errors.invalid_username");

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
            newErrors.email = t("errors.invalid_email");

        if (sqlPattern.test(email))
            newErrors.email = t("errors.sql_protection");

        if (!phone.match(/^\+?\d{7,15}$/))
            newErrors.phone = t("errors.invalid_phone");

        if (sqlPattern.test(phone))
            newErrors.phone = t("errors.sql_protection");

        if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password))
            newErrors.password = t("errors.weak_password");

        if (password !== confirmPassword)
            newErrors.confirmPassword = t("errors.password_mismatch");

        return newErrors;
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setUserData({...userData, [name]: value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setGeneralError(null);

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const {confirmPassword, ...dataToSend} = userData;
            const response = await signUp(dataToSend);
            if (response.success) {
                await signIn(userData.username, userData.password);
                navigate("/profile");
            }
        } catch (err) {
            setGeneralError(err.error || t("errors.register_failed"));
        }
    };

    return (
        <div className="register-form">
            <LanguageSwitcher/>
            <h2>{t("register.title")}</h2>
            {generalError && <p className="error">{generalError}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder={t("register.username")}
                    onChange={handleChange}
                    required
                />
                {errors.username && <p className="error">{errors.username}</p>}

                <input
                    type="email"
                    name="email"
                    placeholder={t("register.email")}
                    onChange={handleChange}
                    required
                />
                {errors.email && <p className="error">{errors.email}</p>}

                <input
                    type="text"
                    name="phone"
                    placeholder={t("register.phone")}
                    onChange={handleChange}
                    required
                />
                {errors.phone && <p className="error">{errors.phone}</p>}

                <label className="hint">
                    {t("register.password_hint") || "Пароль має бути не менше 8 символів, містити літери і цифри"}
                </label>
                <input
                    type="password"
                    name="password"
                    placeholder={t("register.password")}
                    onChange={handleChange}
                    required
                />
                {errors.password && <p className="error">{errors.password}</p>}

                <input
                    type="password"
                    name="confirmPassword"
                    placeholder={t("register.confirm_password")}
                    onChange={handleChange}
                    required
                />
                {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

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
