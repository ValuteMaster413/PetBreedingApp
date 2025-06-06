import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./PhotoGallery.css";

const PhotoGallery = ({
                          photos = [],
                          deletable = false,
                          selectedIds = [],
                          onToggleSelect = () => {}
                      }) => {
    const { t } = useTranslation();
    const [viewerOpen, setViewerOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openViewer = (index) => {
        setCurrentIndex(index);
        setViewerOpen(true);
    };

    const closeViewer = () => setViewerOpen(false);
    const next = () => setCurrentIndex((prev) => (prev + 1) % photos.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);

    return (
        <>
            <div className="photo-gallery">
                {photos.map((photo, index) => {
                    const id = photo.id || index;
                    const isSelected = selectedIds.includes(id);
                    return (
                        <div key={id} className="photo-wrapper">
                            <img
                                src={`http://localhost:8000${photo.url}` || photo.url}
                                alt={`photo-${id}`}
                                className={`photo ${isSelected ? "selected" : ""}`}
                                onClick={() => (deletable ? onToggleSelect(id) : openViewer(index))}
                            />
                            {isSelected && deletable && (
                                <div className="photo-checkmark">✓</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {viewerOpen && (
                <div className="viewer-backdrop" onClick={closeViewer}>
                    <div className="viewer-content" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={`http://localhost:8000${photos[currentIndex].url}` || photos[currentIndex].url}
                            alt="full"
                            className="viewer-image"
                        />
                        <button className="viewer-close" onClick={closeViewer}>×</button>
                        <button className="viewer-nav prev" onClick={prev}>‹</button>
                        <button className="viewer-nav next" onClick={next}>›</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default PhotoGallery;
