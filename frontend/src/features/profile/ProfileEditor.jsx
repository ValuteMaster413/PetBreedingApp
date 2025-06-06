import React from "react";
import "./ProfileEditor.css";
import { useTranslation } from "react-i18next";

const ProfileEditor = ({
                           editData,
                           setEditData,
                           onSave,
                           onCancel,
                           errorMessage,
                           successMessage
                       }) => {
    const { t } = useTranslation();

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="profile-editor" onClick={(e) => e.stopPropagation()}>
                <h2 className="editor-title">{t("profileEditor.title")}</h2>

                {errorMessage && <p className="error-message">{t(errorMessage)}</p>}
                {successMessage && <p className="success-message">{t(successMessage)}</p>}

                {["username", "email", "phone"].map((field) => (
                    <input
                        key={field}
                        type="text"
                        placeholder={t(`profileEditor.fields.${field}`)}
                        value={editData[field]}
                        onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
                        className="editor-input"
                    />
                ))}

                <input
                    type="password"
                    placeholder={t("profileEditor.passwordPlaceholder")}
                    value={editData.password}
                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                    className="editor-input"
                />
                <small className="editor-note">{t("profileEditor.passwordNote")}</small>

                <div className="editor-actions">
                    <button className="btn-save" onClick={onSave}>
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
