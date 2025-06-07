import React from "react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import AuthContext from "../../../app/context/AuthContext";
import "./Header.css";

const Header = () => {
    const {t, i18n} = useTranslation();
    const navigate = useNavigate();
    const {signOut} = React.useContext(AuthContext);

    const handleLogout = async () => {
        await signOut();
        navigate("/login");
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem("lang", lng);
    };


    return (
        <header className="app-header">
            <div className="header-left">
                <button onClick={() => navigate("/profile")}>{t("header.profile")}</button>
                <button onClick={() => navigate("/chats")}>{t("header.chats")}</button>
                <button onClick={handleLogout}>{t("header.logout")}</button>
            </div>
            <div className="header-right">
                <button onClick={() => changeLanguage("uk")}>🇺🇦</button>
                <button onClick={() => changeLanguage("en")}>en</button>
            </div>
        </header>
    );
};

export default Header;
