"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, SwitchCamera, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

type FacingMode = "user" | "environment";

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(
    async (facing: FacingMode) => {
      try {
        stopStream();
        setIsReady(false);
        setError(null);

        if (!navigator.mediaDevices) {
          setError("카메라를 사용할 수 없습니다. HTTPS 환경에서 접속해주세요.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsReady(true);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // play() was interrupted by a new stream load - safe to ignore
          return;
        }
        console.error("Camera access error:", err);
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setError("카메라 접근 권한이 필요합니다. 브라우저 설정에서 카메라 권한을 허용해주세요.");
        } else if (err instanceof DOMException && err.name === "NotFoundError") {
          setError("카메라를 찾을 수 없습니다.");
        } else {
          setError("카메라를 시작할 수 없습니다.");
        }
      }
    },
    [stopStream],
  );

  // Check for multiple cameras
  useEffect(() => {
    if (!navigator.mediaDevices) return;

    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoDevices.length > 1);
      })
      .catch(() => {
        // Silently fail - we just won't show the switch button
      });
  }, []);

  // Start camera on mount and when facing mode changes
  useEffect(() => {
    startCamera(facingMode);

    return () => {
      stopStream();
    };
  }, [facingMode, startCamera, stopStream]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `scan-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          onCapture(file);
        }
      },
      "image/jpeg",
      0.92,
    );
  }, [onCapture]);

  const handleSwitchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  return (
    <div className="relative overflow-hidden rounded-lg bg-black">
      {/* Close button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute right-3 top-3 z-20 text-white hover:bg-white/20"
        aria-label="카메라 닫기"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Video preview */}
      <div className="relative aspect-[16/10] w-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "h-full w-full object-cover",
            !isReady && "invisible",
          )}
        />

        {/* Card frame overlay guide */}
        {isReady && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[55%] w-[75%] rounded-lg border-2 border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]" />
          </div>
        )}

        {/* Loading / error state */}
        {!isReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <p className="text-sm">카메라를 시작하는 중...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center text-white">
              <Camera className="mx-auto mb-3 h-10 w-10 opacity-60" />
              <p className="text-sm">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => startCamera(facingMode)}
                className="mt-4 border-white/40 text-white hover:bg-white/20"
              >
                다시 시도
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 bg-black px-4 py-5">
        {/* Spacer for centering */}
        <div className="w-10" />

        {/* Capture button */}
        <button
          type="button"
          onClick={handleCapture}
          disabled={!isReady}
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full border-4 border-white transition-all",
            isReady
              ? "bg-white hover:scale-105 active:scale-95 active:bg-gray-200"
              : "cursor-not-allowed opacity-40",
          )}
          aria-label="사진 촬영"
        >
          <div className="h-12 w-12 rounded-full bg-white" />
        </button>

        {/* Switch camera button */}
        {hasMultipleCameras ? (
          <button
            type="button"
            onClick={handleSwitchCamera}
            disabled={!isReady}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors",
              isReady
                ? "hover:bg-white/20 active:bg-white/30"
                : "cursor-not-allowed opacity-40",
            )}
            aria-label="카메라 전환"
          >
            <SwitchCamera className="h-6 w-6" />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
