import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./PhotoPreviewGrid.css";
import PhotoViewer from "./PhotoViewer";

const PhotoPreviewGrid = ({ photos, onClose }) => {
    const [viewerIndex, setViewerIndex] = useState(null);
    const { t } = useTranslation();

    return (
        <div className="preview-backdrop" onClick={onClose}>
            <div className="preview-grid" onClick={(e) => e.stopPropagation()}>
                <h2 className="preview-title">{t("photopreview.title")}</h2>
                <div className="preview-thumbs">
                    {photos.map((photo, i) => (
                        <img
                            key={i}
                            src={`http://localhost:8000${typeof photo === "string" ? photo : photo.url}`}
                            alt={`thumb-${i}`}
                            className="preview-thumb"
                            onClick={() => setViewerIndex(i)}
                        />
                    ))}
                </div>
                <button className="preview-close" onClick={onClose}>×</button>
            </div>

            {viewerIndex !== null && (
                <PhotoViewer
                    photos={photos}
                    startIndex={viewerIndex}
                    onClose={() => setViewerIndex(null)}
                />
            )}
        </div>
    );
};

export default PhotoPreviewGrid;
