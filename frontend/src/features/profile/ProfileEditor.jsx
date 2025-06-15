import React, {useState} from "react";
import "./ProfileEditor.css";
import {useTranslation} from "react-i18next";

const ProfileEditor = ({
                           editData,
                           setEditData,
                           onSave,
                           onCancel,
                           errorMessage,
                           successMessage
                       }) => {
    const {t} = useTranslation();
    const [localErrors, setLocalErrors] = useState({});

    const handleSave = () => {
        const phone = editData.phone?.trim();
        const password = editData.password;
        const newErrors = {};

        if (phone && phone.length < 10) {
            newErrors.phone = t("errors.phone_too_short");
        }

        if (password && password.length > 0 && password.length < 8) {
            newErrors.password = t("errors.password_too_short");
        }

        if (Object.keys(newErrors).length > 0) {
            setLocalErrors(newErrors);
            return;
        }

        setLocalErrors({});
        onSave();
    };


    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="profile-editor" onClick={(e) => e.stopPropagation()}>
                <h2 className="editor-title">{t("profileEditor.title")}</h2>

                {errorMessage && <p className="error-message">{t(errorMessage)}</p>}
                {successMessage && <p className="success-message">{t(successMessage)}</p>}

                {["username", "email", "phone"].map((field) => (
                    <div key={field} className="editor-group">
                        <input
                            type="text"
                            placeholder={t(`profileEditor.fields.${field}`)}
                            value={editData[field]}
                            onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
                            className="editor-input"
                        />
                        {localErrors[field] && <p className="editor-error">{localErrors[field]}</p>}
                    </div>
                ))}

                <div className="editor-group">
                    <input
                        type="password"
                        placeholder={t("profileEditor.passwordPlaceholder")}
                        value={editData.password}
                        onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                        className="editor-input"
                    />
                    {localErrors.password && <p className="editor-error">{localErrors.password}</p>}
                    <small className="editor-note">{t("profileEditor.passwordNote")}</small>
                </div>


                <div className="editor-actions">
                    <button className="btn-save" onClick={handleSave}>
                        {t("buttons.save")}
                    </button>
                    <button className="btn-cancel" onClick={onCancel}>
                        {t("buttons.cancel")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditor;
