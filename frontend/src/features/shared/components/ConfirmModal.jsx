import React from "react";
import { useTranslation } from "react-i18next";
import "./ConfirmModal.css";

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
    const { t } = useTranslation();

    return (
        <div className="confirm-backdrop">
            <div className="confirm-modal">
                <p>{t(message)}</p>
                <div className="confirm-actions">
                    <button className="btn-yes" onClick={onConfirm}>✔ {t("yes")}</button>
                    <button className="btn-no" onClick={onCancel}>✖ {t("no")}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
