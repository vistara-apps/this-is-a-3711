import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

const ImageUploader = ({ onImageUpload, uploadedImage, onRemoveImage }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onImageUpload({
          file,
          preview: e.target.result,
          name: file.name,
          size: file.size
        })
      }
      reader.readAsDataURL(file)
    }
  }, [onImageUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  if (uploadedImage) {
    return (
      <div className="relative">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-text-primary">Product Image</h3>
            <button
              onClick={onRemoveImage}
              className="p-1 hover:bg-bg rounded-md transition-colors duration-200"
            >
              <X className="w-5 h-5 text-text-secondary hover:text-text-primary" />
            </button>
          </div>
          <div className="aspect-video rounded-md overflow-hidden bg-bg">
            <img
              src={uploadedImage.preview}
              alt={uploadedImage.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-3 text-sm text-text-secondary">
            <p className="font-medium">{uploadedImage.name}</p>
            <p>{(uploadedImage.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary/10' : 'bg-bg'}`}>
            <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-text-secondary'}`} />
          </div>
          <div>
            <p className="text-lg font-medium text-text-primary">
              {isDragActive ? 'Drop your image here' : 'Upload Product Image'}
            </p>
            <p className="text-text-secondary mt-1">
              Drag & drop or click to select (PNG, JPG, GIF up to 10MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageUploader