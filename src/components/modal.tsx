import { X } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

interface Props {
    visible: boolean;
    title?: string;
    onClose: () => void;
    children: ReactNode;
    width?: number;
    bodyStyle?: CSSProperties;
}

export function Modal({ visible, title, onClose, children, width = 520, bodyStyle }: Props) {
    if (!visible) {
        return null;
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" style={{ width: `min(100%, ${width}px)` }} onClick={(event) => event.stopPropagation()}>
                <div className="modal-header">
                    <strong style={{ color: "var(--lp-text-heading)", fontSize: 18 }}>{title}</strong>
                    <button className="button compact" onClick={onClose} type="button">
                        <X size={14} />
                    </button>
                </div>
                <div className="modal-content" style={bodyStyle}>
                    {children}
                </div>
            </div>
        </div>
    );
}
