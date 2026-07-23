import React, { useEffect, useId, useState } from 'react';

const ImageDropSlot = ({
  shape = 'rect',
  placeholder = 'Arraste uma imagem aqui',
  className = '',
  initialUrl = null,
  onFileSelected,
}) => {
  const inputId = useId();
  const [preview, setPreview] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPreview(initialUrl);
  }, [initialUrl]);

  const handleChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    if (onFileSelected) {
      setUploading(true);
      try {
        await onFileSelected(file);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <label
      htmlFor={inputId}
      className={`image-drop-slot ${shape === 'circle' ? 'image-drop-circle' : ''} ${className}`}
    >
      {preview ? (
        <img src={preview} alt="" className="image-drop-preview" />
      ) : (
        <span className="image-drop-placeholder">{uploading ? 'Enviando...' : placeholder}</span>
      )}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="image-drop-input"
      />
    </label>
  );
};

export default ImageDropSlot;
