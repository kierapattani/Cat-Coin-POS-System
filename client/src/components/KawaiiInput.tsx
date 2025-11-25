import { InputHTMLAttributes } from 'react';
import './KawaiiInput.css';

interface KawaiiInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
}

export default function KawaiiInput({ label, icon, className = '', ...props }: KawaiiInputProps) {
  return (
    <div className="kawaii-input-wrapper">
      {label && <label className="kawaii-label">{label}</label>}
      <div className="kawaii-input-container">
        {icon && <span className="input-icon">{icon}</span>}
        <input className={`kawaii-input ${icon ? 'with-icon' : ''} ${className}`} {...props} />
      </div>
    </div>
  );
}
