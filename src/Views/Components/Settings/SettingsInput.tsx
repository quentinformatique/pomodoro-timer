import { FC } from "react";
import { Icon } from "../Utilities/Icon";

interface SettingsInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    unit?: string;
}

export const SettingsInput: FC<SettingsInputProps> = ({
    label,
    value,
    onChange,
    min,
    max,
    unit = "minutes"
}) => {
    const handleIncrement = () => {
        if (value < max) {
            onChange(value + 1);
        }
    };

    const handleDecrement = () => {
        if (value > min) {
            onChange(value - 1);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        if (!isNaN(newValue) && newValue >= min && newValue <= max) {
            onChange(newValue);
        }
    };

    return (
        <div className="flex items-center justify-between py-3">
            <label className="text-green-light flex-1 md:mr-16 lg:mr-24">
                {label}
            </label>
            <div className="flex items-center gap-4">
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={handleDecrement}
                        className={`p-1 rounded-lg transition-colors ${
                            value <= min 
                                ? 'text-green-light/30 cursor-not-allowed' 
                                : 'text-green-light hover:bg-green-light/10'
                        }`}
                        disabled={value <= min}
                    >
                        <Icon code="remove" fill={false} className="text-lg" />
                    </button>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={min}
                        max={max}
                        value={value}
                        onChange={handleInputChange}
                        className="w-12 p-1 text-center bg-transparent text-green-light focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={handleIncrement}
                        className={`p-1 rounded-lg transition-colors ${
                            value >= max 
                                ? 'text-green-light/30 cursor-not-allowed' 
                                : 'text-green-light hover:bg-green-light/10'
                        }`}
                        disabled={value >= max}
                    >
                        <Icon code="add" fill={false} className="text-lg" />
                    </button>
                </div>
                <span className="text-sm text-green-light/70 w-14">{unit}</span>
            </div>
        </div>
    );
}; 