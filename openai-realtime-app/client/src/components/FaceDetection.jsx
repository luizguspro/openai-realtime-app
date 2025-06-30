import React, { useEffect, useRef } from 'react';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

// ==========================================
// PARÂMETROS ARQUITETURAIS AJUSTÁVEIS
// Estes são os "botões" que podemos girar para calibrar a experiência.
// ==========================================

// Com que frequência vamos verificar um rosto? (em milissegundos)
// 250ms = 4x por segundo. Ótimo equilíbrio entre performance e tempo de resposta.
const DETECTION_INTERVAL_MS = 250; 

// Quantas detecções SEGUIDAS são necessárias para confirmar um usuário?
// 4 detecções * 250ms = 1 segundo de atenção contínua. Robusto contra "passantes".
const FRAMES_NEEDED_FOR_ACTIVATION = 4;

// Qual a confiança mínima para o modelo considerar algo como um rosto? (0.1 a 1.0)
const MIN_DETECTION_CONFIDENCE = 0.5;

// Quantos segundos sem um rosto para considerar que o usuário foi embora?
const SECONDS_TO_CONSIDER_LOST = 5;

// ==========================================
// COMPONENTE FINAL COM MODO DE DEPURAÇÃO
// ==========================================

const FaceDetection = ({ onFaceDetected, onFaceLost, isActive, debugMode = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const consecutiveDetectionsRef = useRef(0);
  const facePresentRef = useRef(false);
  const lastSeenRef = useRef(0);

  useEffect(() => {
    const initialize = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
        detectorRef.current = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
            delegate: 'GPU',
          },
          minDetectionConfidence: MIN_DETECTION_CONFIDENCE,
          runningMode: 'VIDEO',
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            startDetectionLoop();
          };
        }
      } catch (err) {
        console.error('[FaceDetection] Erro ao inicializar:', err);
      }
    };

    const startDetectionLoop = () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

      detectionIntervalRef.current = setInterval(async () => {
        if (detectorRef.current && videoRef.current && videoRef.current.readyState >= 3) {
          try {
            const result = detectorRef.current.detectForVideo(videoRef.current, Date.now());

            if (debugMode && canvasRef.current) {
              drawBoundingBoxes(result.detections);
            }

            if (result.detections.length > 0) {
              handleFacePresent();
            } else {
              handleFaceAbsent();
            }
          } catch (err) {
            console.error('[FaceDetection] Erro na detecção:', err);
          }
        }
      }, DETECTION_INTERVAL_MS);
    };

    const drawBoundingBoxes = (detections) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      if (detections && detections.length > 0) {
        for (const detection of detections) {
          const bbox = detection.boundingBox;
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 4;
          ctx.fillStyle = '#00FF00';
          ctx.font = '18px Arial';
          ctx.strokeRect(bbox.originX, bbox.originY, bbox.width, bbox.height);
          const confidence = (detection.categories[0].score * 100).toFixed(1);
          ctx.fillText(`${confidence}%`, bbox.originX, bbox.originY - 10);
        }
      }
      ctx.restore();
    };
    
    const handleFacePresent = () => {
      lastSeenRef.current = Date.now();
      consecutiveDetectionsRef.current++;
      
      if (!facePresentRef.current && consecutiveDetectionsRef.current >= FRAMES_NEEDED_FOR_ACTIVATION) {
        console.log('[FaceDetection] Rosto detectado - ativando conversa');
        facePresentRef.current = true;
        onFaceDetected();
      }
    };

    const handleFaceAbsent = () => {
      consecutiveDetectionsRef.current = 0;
      
      if (facePresentRef.current && (Date.now() - lastSeenRef.current) > (SECONDS_TO_CONSIDER_LOST * 1000)) {
        console.log('[FaceDetection] Rosto perdido - desativando conversa');
        facePresentRef.current = false;
        onFaceLost();
      }
    };

    if (isActive) {
      initialize();
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (detectorRef.current) {
        detectorRef.current.close();
      }
    };
  }, [isActive, onFaceDetected, onFaceLost, debugMode]);

  return (
    <div className={debugMode ? 'fixed top-4 left-4 w-[320px] h-[240px] border-2 border-red-500 z-50' : 'hidden'}>
      <video 
        ref={videoRef}
        className="w-full h-full transform scale-x-[-1]"
        autoPlay
        playsInline
        muted
      />
      {debugMode && (
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          width="640"
          height="480"
        />
      )}
    </div>
  );
};

export default FaceDetection;