import React, { useState } from 'react';
import './Styles.css';

const RatingSlider = ({ value = 0, onChange, readOnly = false, size = 'medium' }) => {
    const [hoverValue, setHoverValue] = useState(null);
    const displayValue = hoverValue !== null ? hoverValue : value;
    
    const getColor = (rating) => {
        if (rating <= 1) return '#ef4444'; // Vermelho
        if (rating <= 2) return '#f97316'; // Laranja
        if (rating <= 3) return '#eab308'; // Amarelo
        if (rating <= 4) return '#84cc16'; // Verde claro
        return '#22c55e'; // Verde
    };

    const getLabel = (rating) => {
        if (rating === 0) return 'Sem avaliação';
        if (rating <= 1) return 'Muito ruim';
        if (rating <= 2) return 'Ruim';
        if (rating <= 3) return 'Regular';
        if (rating <= 4) return 'Bom';
        return 'Excelente';
    };

    const handleSliderChange = (e) => {
        if (!readOnly && onChange) {
            onChange(parseFloat(e.target.value));
        }
    };

    const handleMouseMove = (e) => {
        if (readOnly) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newValue = Math.max(0, Math.min(5, percent * 5));
        setHoverValue(Math.round(newValue * 2) / 2); // Arredondar para 0.5
    };

    return (
        <div className={`rating-slider-container ${size} ${readOnly ? 'readonly' : ''}`}>
            <div 
                className="rating-slider-track"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoverValue(null)}
            >
                <div 
                    className="rating-slider-fill"
                    style={{ 
                        width: `${(displayValue / 5) * 100}%`,
                        background: getColor(displayValue)
                    }}
                />
                {!readOnly && (
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={value}
                        onChange={handleSliderChange}
                        className="rating-slider-input"
                    />
                )}
            </div>
            <div className="rating-slider-info">
                <span className="rating-value" style={{ color: getColor(displayValue) }}>
                    {displayValue.toFixed(1)}
                </span>
                <span className="rating-label">{getLabel(displayValue)}</span>
            </div>
        </div>
    );
};

export default RatingSlider;
