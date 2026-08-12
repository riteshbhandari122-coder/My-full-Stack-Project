import React, { useState, useRef } from 'react';
import api from '../utils/api';

const UpcycleStudio = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Camera access denied or unavailable.');
      setShowCamera(false);
    }
  };

  const captureCamera = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImage(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/recycling/analyze', {
        imageBase64: image,
        mimeType: 'image/jpeg',
      });
      setResult(response.data);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 180px)', padding: '40px 16px' }} className="max-w-5xl mx-auto flex flex-col justify-between">
      <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 md:p-10 mb-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <span>♻️</span> Know How to Recycle & Upcycle
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Take a photo with your camera or upload an image to receive instant zero-cost reuse ideas!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={startCamera}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            📷 Open Real Camera
          </button>
          <label className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 text-center">
            📁 Upload Image
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        {/* Camera Modal View */}
        {showCamera && (
          <div className="mb-8 p-4 bg-gray-900 rounded-2xl flex flex-col items-center">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded-xl mb-4 bg-black" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-3">
              <button onClick={captureCamera} className="px-5 py-2 bg-emerald-500 text-gray-900 font-bold rounded-lg hover:bg-emerald-400">
                📸 Take Photo
              </button>
              <button onClick={stopCamera} className="px-5 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Selected Image Preview */}
        {image && !showCamera && (
          <div className="flex flex-col items-center bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Selected Item Preview:</h3>
            <img src={image} alt="Selected item" className="max-h-64 rounded-xl object-contain shadow-sm mb-6" />
            <button
              onClick={analyzeImage}
              disabled={loading}
              className="w-full max-w-md py-3.5 px-6 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-bold text-base rounded-xl shadow-md transition-all"
            >
              {loading ? 'Analyzing with AI...' : 'Get Upcycle & Recycle Ideas'}
            </button>
          </div>
        )}

        {/* Errors */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Results display */}
        {result && (
          <div className="mt-8 border-t border-gray-100 pt-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-8">
              <h2 className="text-xl font-bold text-emerald-900 mb-1">
                Item: {result.identifiedItem || 'Identified Item'}
              </h2>
              <p className="text-emerald-800 text-sm">
                <strong>Material:</strong> {result.materialType || 'Plastic / Packaging'} | {' '}
                <strong>Recyclable:</strong> {result.isRecyclable ? 'Yes ✅' : 'No ❌'}
              </p>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              💡 Zero-Cost Upcycle Ideas
            </h3>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {result.upcycleIdeas?.map((idea, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-gray-800 text-base mb-1">{idea.title}</h4>
                  <p className="text-xs font-semibold text-emerald-700 mb-3">
                    Category: {idea.category} | Time required: {idea.timeRequired}
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-gray-600">
                    {idea.steps?.map((step, sIdx) => (
                      <li key={sIdx}>{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            {result.disposalTip && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl text-xs text-amber-900">
                <strong>Disposal & Care Tip:</strong> {result.disposalTip}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcycleStudio;