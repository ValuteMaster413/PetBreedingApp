import React, {useState} from "react";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import "./MatchFilterModal.css";


const MatchFilterModal = ({
                              species,
                              breedOptions,
                              coatColorOptions,
                              filters,
                              onChange,
                              onApply,
                              onClose
                          }) => {
    const { t } = useTranslation();
    const [error, setError] = useState("");

    const handleApply = () => {
        setError("");

        const minAge = Number(filters.minAge);
        const maxAge = Number(filters.maxAge);
        const maxPrice = Number(filters.maxPrice);

        if (!isNaN(minAge) && !isNaN(maxAge) && minAge > maxAge) {
            setError(t("errors.filters.invalid_age_range"));
            return;
        }

        if (!isNaN(maxPrice) && maxPrice < 0) {
            setError(t("errors.filters.negative_price"));
            return;
        }

        onApply();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <h3>{t("match.filters")}</h3>

                <div className="form-group">
                    <label>{t("match.breed")}</label>
                    <Select
                        options={breedOptions}
                        value={breedOptions.find(opt => opt.value === filters.breed)}
                        onChange={(opt) => onChange("breed", opt?.value || "")}
                        isClearable
                    />
                </div>

                <div className="form-group">
                    <label>{t("match.color")}</label>
                    <Select
                        options={coatColorOptions}
                        value={coatColorOptions.find(opt => opt.value === filters.color)}
                        onChange={(opt) => onChange("color", opt?.value || "")}
                        isClearable
                    />
                </div>

                <div className="form-group">
                    <label>{t("match.min_age")}</label>
                    <input
                        type="number"
                        min="0"
                        value={filters.minAge}
                        onChange={e => onChange("minAge", e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>{t("match.max_age")}</label>
                    <input
                        type="number"
                        min="0"
                        value={filters.maxAge}
                        onChange={e => onChange("maxAge", e.target.value)}
                    />
                </div>
                <p className="filter-note">{t("match.age_hint")}</p>

                <div className="form-group">
                    <label>{t("match.max_price")}</label>
                    <input
                        type="number"
                        min="0"
                        value={filters.maxPrice}
                        onChange={e => onChange("maxPrice", e.target.value)}
                    />
                </div>

                {error && <p className="filter-error">{error}</p>}

                <div className="modal-actions">
                    <button className="btn-confirm" onClick={handleApply}>
                        {t("match.apply_filters")}
                    </button>
                    <button className="btn-cancel" onClick={onClose}>
                        {t("common.cancel")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchFilterModal;