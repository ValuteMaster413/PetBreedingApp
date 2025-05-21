import React, { useState } from "react";
import "./PhotoViewer.css";

const PhotoViewer = ({ photos = [], startIndex = 0, onClose }) => {
    const [index, setIndex] = useState(startIndex);

    const next = () => setIndex((i) => (i + 1) % photos.length);
    const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);

    return (
        <div className="viewer-backdrop" onClick={onClose}>
            <div className="viewer-content" onClick={(e) => e.stopPropagation()}>
                <img
                    src={`http://localhost:8000${photos[index].url}` || photos[index].url}
                    alt="viewer"
                    className="viewer-image"
                />
                <button className="viewer-close" onClick={onClose}>×</button>
                {photos.length > 1 && (
                    <>
                        <button className="viewer-nav prev" onClick={prev}>‹</button>
                        <button className="viewer-nav next" onClick={next}>›</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PhotoViewer;
