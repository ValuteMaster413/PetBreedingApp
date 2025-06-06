import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./EditMessageModal.css";

const EditMessageModal = ({ messageId, initialText, onSave, onCancel }) => {
    const { t } = useTranslation();
    const [newText, setNewText] = useState(initialText || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newText.trim()) onSave(messageId, newText.trim());
    };

    return (
        <div className="edit-modal-backdrop" onClick={onCancel}>
            <div className="edit-modal" onClick={e => e.stopPropagation()}>
                <h3>{t("chatroom.edit")}</h3>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        rows={4}
                        autoFocus
                    />
                    <div className="edit-modal-actions">
                        <button type="submit">💾 {t("chatroom.save")}</button>
                        <button type="button" onClick={onCancel}>❌ {t("chatroom.cancel")}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMessageModal;
