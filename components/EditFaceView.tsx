import React, { useState } from 'react';
import { Face, FaceName, CubeColor } from '../types';
import { COLOR_CLASSES, FACE_NAMES } from '../constants';
import CubeFacePreview from './CubeFacePreview';
import { CameraIcon } from './Icons';

interface EditFaceViewProps {
  faceToEdit: FaceName;
  initialFace: Face;
  onSave: (face: Face) => void;
  onCancel: () => void;
  onRescanRequest: (face: FaceName) => void;
}

const EditFaceView: React.FC<EditFaceViewProps> = ({ faceToEdit, initialFace, onSave, onCancel, onRescanRequest }) => {
  const [face, setFace] = useState<Face>(initialFace.map(row => [...row]));
  const [selectedSticker, setSelectedSticker] = useState<{ row: number; col: number } | null>(null);

  const handleStickerClick = (row: number, col: number) => {
    if (selectedSticker && selectedSticker.row === row && selectedSticker.col === col) {
      setSelectedSticker(null);
    } else {
      setSelectedSticker({ row, col });
    }
  };

  const handleColorCorrection = (newColor: CubeColor) => {
    if (!selectedSticker) return;

    const newFace = face.map(r => [...r]);
    newFace[selectedSticker.row][selectedSticker.col] = newColor;

    setFace(newFace);
    setSelectedSticker(null);
  };

  return (
    <div className="w-full h-full max-h-[700px] flex flex-col items-center justify-between max-w-sm mx-auto p-4 sm:p-6 bg-gray-800 rounded-lg shadow-2xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Edit: {FACE_NAMES[faceToEdit]}</h2>
        <p className="text-gray-300 mt-1 h-10 flex items-center px-2">
          {selectedSticker ? 'Select the correct color for the highlighted square.' : "Tap any square to correct its color."}
        </p>
      </div>

      <div className="my-4">
        <CubeFacePreview
          face={face}
          onStickerClick={handleStickerClick}
          selectedSticker={selectedSticker}
          sizeClass="w-48 h-48 sm:w-56 sm:h-56"
        />
      </div>
      
      <div className="p-2 h-20 w-full flex items-center justify-center">
        {selectedSticker && (
          <div className="p-2 bg-gray-900 rounded-lg flex justify-center gap-2 animate-fade-in">
            {Object.values(CubeColor).map(color => (
              <button
                key={color}
                onClick={() => handleColorCorrection(color)}
                className={`w-10 h-10 rounded-full border-2 border-gray-700 hover:border-white transition-transform transform hover:scale-110 ${COLOR_CLASSES[color]}`}
                aria-label={`Select ${color}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-3 w-full mt-4">
        <button 
          onClick={() => onSave(face)}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg text-lg"
        >
          Save Changes
        </button>
        <button 
          onClick={() => onRescanRequest(faceToEdit)}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg text-lg flex items-center justify-center"
        >
            <CameraIcon className="w-6 h-6 mr-2"/>
            Rescan Face
        </button>
        <button 
          onClick={onCancel}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-base"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditFaceView;