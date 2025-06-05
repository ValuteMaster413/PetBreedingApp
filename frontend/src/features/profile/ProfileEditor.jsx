import React from "react";
import "./ProfileEditor.css";

const ProfileEditor = ({
                           editData,
                           setEditData,
                           onSave,
                           onCancel,
                           errorMessage,
                           successMessage
                       }) => {
    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="profile-editor" onClick={(e) => e.stopPropagation()}>
                <h2 className="editor-title">Редагування профілю</h2>

                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                {["username", "email", "phone"].map((field) => (
                    <input
                        key={field}
                        type="text"
                        placeholder={field}
                        value={editData[field]}
                        onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
                        className="editor-input"
                    />
                ))}

                <input
                    type="password"
                    placeholder="Новий пароль"
                    value={editData.password}
                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                    className="editor-input"
                />
                <small className="editor-note">Залиште незмінним, якщо не хочете змінювати пароль</small>

                <div className="editor-actions">
                    <button className="btn-save" onClick={onSave}>Зберегти</button>
                    <button className="btn-cancel" onClick={onCancel}>Скасувати</button>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditor;
