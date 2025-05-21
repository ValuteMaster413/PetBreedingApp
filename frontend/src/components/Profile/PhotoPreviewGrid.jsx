import React, { useState } from "react";
import "./PhotoPreviewGrid.css";
import PhotoViewer from "./PhotoViewer";

const PhotoPreviewGrid = ({ photos, onClose }) => {
    const [viewerIndex, setViewerIndex] = useState(null);

    return (
        <div className="preview-backdrop" onClick={onClose}>
            <div className="preview-grid" onClick={(e) => e.stopPropagation()}>
                <h2 className="preview-title">Усі фото тварини</h2>
                <div className="preview-thumbs">
                    {photos.map((photo, i) => (
                        <img
                            key={i}
                            src={`http://localhost:8000${photo.url}`}
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
