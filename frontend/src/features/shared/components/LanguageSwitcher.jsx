import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem("lang", lng); // сохраняем выбранный язык
    };

    return (
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button onClick={() => changeLanguage("uk")}>Українська</button>
            <button onClick={() => changeLanguage("en")}>English</button>
        </div>
    );
};

export default LanguageSwitcher;