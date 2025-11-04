import React from 'react';
import { Face, CubeColor } from '../types';
import { COLOR_CLASSES } from '../constants';

interface CubeFacePreviewProps {
    face: Face;
    title?: string;
    onStickerClick?: (row: number, col: number) => void;
    selectedSticker?: { row: number; col: number } | null;
    sizeClass?: string;
}

const CubeFacePreview: React.FC<CubeFacePreviewProps> = ({ face, title, onStickerClick, selectedSticker, sizeClass = "w-20 h-20 sm:w-24 sm:h-24" }) => {
    return (
        <div className="flex flex-col items-center">
            {title && <h3 className="text-sm font-semibold mb-1 text-gray-300 truncate">{title}</h3>}
            <div className={`grid grid-cols-3 gap-1 p-1 bg-gray-900 rounded-md ${sizeClass}`}>
            {face.flat().map((color, index) => {
                const row = Math.floor(index / 3);
                const col = index % 3;
                const isSelected = selectedSticker?.row === row && selectedSticker?.col === col;
                const clickableClass = onStickerClick ? 'cursor-pointer transition-transform hover:scale-110' : '';
                const selectedClass = isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-900' : '';

                return (
                    <div
                        key={index}
                        onClick={() => onStickerClick?.(row, col)}
                        className={`w-full h-full rounded-sm ${COLOR_CLASSES[color]} ${clickableClass} ${selectedClass}`}
                    />
                );
            })}
            </div>
        </div>
    );
};

export default CubeFacePreview;