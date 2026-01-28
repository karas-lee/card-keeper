"use client";

import { useState, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageViewerProps {
  src: string;
  alt?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

export function ImageViewer({
  src,
  alt = "이미지 뷰어",
  open,
  onOpenChange,
}: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
  }, []);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!value) {
        setZoom(1);
      }
      onOpenChange(value);
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{alt}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 px-6 pb-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label="축소"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[4rem] text-center text-sm text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            aria-label="확대"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            aria-label="원래 크기로"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto px-6 pb-6">
          <div className="flex items-center justify-center min-h-[300px]">
            <img
              src={src}
              alt={alt}
              className="transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
              }}
              draggable={false}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
