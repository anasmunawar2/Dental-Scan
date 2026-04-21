"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Upload, RefreshCw, Menu, X } from "lucide-react";
import { useCallback } from "react";
import MessagingSidebar from "@/app/components/MessagingSidebar";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "@/apiclients/notificationsApi.client";
import { Status } from "@/types/Status";
import { ScanningFlowProps } from "@/types/scanningFlowProps";
import { Notification } from "@/types/notification";
import NotificationsPanel from "./NotificationsPanel";
import { uploadScan } from "@/apiclients/scanApi.client";

export default function SmartDentalCapture({
  threadId,
  patientId,
  sender,
}: ScanningFlowProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceMeshRef = useRef<any>(null);
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [faceReady, setFaceReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [status, setStatus] = useState<Status>({
    level: "poor",
    message: "Initializing camera...",
    color: "red",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const VIEWS = [
    "Front View",
    "Left View",
    "Right View",
    "Upper Teeth",
    "Lower Teeth",
  ];

  const fetchNotificationsCallback = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      const list = data.notifications || [];
      setNotifications(data.notifications || []);
      return list;
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      return [];
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchNotificationsCallback, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchNotificationsCallback();
  }, [fetchNotificationsCallback]);

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      fetchNotificationsCallback();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const startCamera = async () => {
    try {
      setStatus({
        level: "poor",
        message: "Requesting camera access...",
        color: "red",
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      if (!videoRef.current) return;

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setCameraReady(true);

      setStatus({
        level: "fair",
        message: "Camera ready",
        color: "orange",
      });
    } catch (err: any) {
      console.error("Camera error:", err);
      let message = "Camera error";

      if (err.name === "NotAllowedError") {
        message = "Permission denied";
      } else if (err.name === "NotFoundError") {
        message = "No camera found";
      }

      setStatus({
        level: "poor",
        message,
        color: "red",
      });
    }
  };

  useEffect(() => {
    async function initCamera() {
      try {
        setStatus({
          level: "poor",
          message: "Requesting camera access...",
          color: "red",
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });

        if (!videoRef.current) return;

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        setCameraReady(true);

        setStatus({
          level: "fair",
          message: "Camera ready",
          color: "orange",
        });
      } catch (err: any) {
        console.error("Camera error:", err);
        let message = "Camera error";

        if (err.name === "NotAllowedError") {
          message = "Permission denied";
        } else if (err.name === "NotFoundError") {
          message = "No camera found";
        }

        setStatus({
          level: "poor",
          message,
          color: "red",
        });
      }
    }

    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, []);

  // FaceMesh Init
  useEffect(() => {
    const initFaceMesh = async () => {
      try {
        const { FaceMesh } = await import("@mediapipe/face_mesh");

        const faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          selfieMode: true,
        });

        faceMesh.onResults((results: any) => {
          if (!results.multiFaceLandmarks?.length) {
            setStatus({
              level: "poor",
              message: "No face detected",
              color: "red",
            });
            return;
          }

          const lm = results.multiFaceLandmarks[0];
          const left = lm[61];
          const right = lm[291];
          const top = lm[13];
          const bottom = lm[14];

          const width = Math.hypot(right.x - left.x, right.y - left.y);
          const height = Math.abs(bottom.y - top.y);

          if (width < 0.05) {
            setStatus({ level: "poor", message: "Move closer", color: "red" });
            return;
          }
          if (width > 0.25) {
            setStatus({ level: "poor", message: "Move farther", color: "red" });
            return;
          }

          if (height < 0.02) {
            setStatus({
              level: "fair",
              message: "Open your mouth",
              color: "orange",
            });
            return;
          }

          setStatus({
            level: "good",
            message: "Perfect - hold still",
            color: "green",
          });
        });

        faceMeshRef.current = faceMesh;
        setFaceReady(true);
      } catch (err) {
        console.error("FaceMesh error:", err);
        setStatus({
          level: "poor",
          message: "Face detection failed",
          color: "red",
        });
      }
    };

    initFaceMesh();
  }, []);

  useEffect(() => {
    let raf: number;

    const loop = async () => {
      if (videoRef.current && faceMeshRef.current && faceReady && cameraReady) {
        try {
          await faceMeshRef.current.send({
            image: videoRef.current,
          });
        } catch (e) {
          console.warn("Frame processing skipped");
        }
      }
      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(raf);
  }, [faceReady, cameraReady]);

  function isBadImage(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")!;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      brightness += data[i];
    }

    const avg = brightness / (data.length / 4);
    return avg < 40;
  }

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    if (images.length >= 5) {
      setStatus({
        level: "poor",
        message: "All images captured! Click Submit to upload.",
        color: "green",
      });
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    if (isBadImage(canvas)) {
      setStatus({
        level: "poor",
        message: "Too dark / blurry",
        color: "red",
      });
      return;
    }

    const img = canvas.toDataURL("image/jpeg");
    setImages((prev) => {
      if (prev.length >= 5) return prev;
      const newImages = [...prev, img];
      return newImages;
    });

    if (currentStep < 4) {
      setCurrentStep((s) => s + 1);
    }

    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (images.length >= 5) return;

    if (status.level === "good") {
      if (!captureTimeoutRef.current) {
        captureTimeoutRef.current = setTimeout(() => {
          capture();
          captureTimeoutRef.current = null;
        }, 800);
      }
    } else {
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
        captureTimeoutRef.current = null;
      }
    }
  }, [status.level, images.length]);

  async function handleSubmit() {
    if (images.length !== 5) {
      setStatus({
        level: "poor",
        message: `Please capture all 5 images (${images.length}/5 captured)`,
        color: "red",
      });
      return;
    }

    setIsUploading(true);
    setStatus({
      level: "fair",
      message: "Uploading scan...",
      color: "orange",
    });

    try {
      const data = await uploadScan(images);

      if (data.error) throw new Error(data.error);

      setStatus({
        level: "good",
        message: "Scan uploaded successfully!",
        color: "green",
      });

      // await fetchNotifications();
      setImages([]);
      setCurrentStep(0);
      setStatus({
        level: "fair",
        message: "Ready to capture again.",
        color: "orange",
      });
      startCamera();

      console.log("Scan uploaded:", data);
    } catch (err) {
      console.error("Scan upload error:", err);
      setStatus({
        level: "poor",
        message: "Upload failed. Please try again.",
        color: "red",
      });
    } finally {
      setIsUploading(false);
    }
  }

  function handleReset() {
    if (confirm("Are you sure you want to reset all captured images?")) {
      setImages([]);
      setCurrentStep(0);
      setStatus({
        level: "fair",
        message: "Reset complete. Ready to capture again.",
        color: "orange",
      });
    }
  }

  function handleRetakeCurrent() {
    if (images.length > 0) {
      const newImages = [...images];
      newImages.pop();
      setImages(newImages);
      setCurrentStep(Math.max(0, currentStep - 1));
      setStatus({
        level: "fair",
        message: `Retake ${VIEWS[currentStep - 1] || VIEWS[0]}`,
        color: "orange",
      });
    }
  }

  return (
    <div className="flex flex-row bg-black text-white min-h-screen w-full relative">
      <div className="flex flex-col flex-1 items-center">
        <div className="p-4 w-full flex justify-between bg-zinc-900">
          <h1 className="text-blue-400 font-bold">DentalScan AI</h1>
          <span className="text-xs">{images.length}/5 Captured</span>
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 bg-blue-700 rounded text-xs"
              onClick={() => setShowNotifications((v) => !v)}
            >
              Notifications ({notifications.filter((n) => !n.isRead).length})
            </button>
            <button
              className="ml-2 p-2 rounded bg-zinc-800 hover:bg-zinc-700"
              onClick={() => setShowChat(true)}
              aria-label="Open chat"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {showNotifications && (
          <NotificationsPanel
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onMarkAsRead={markAsRead}
            fetchNotifications={fetchNotificationsCallback}
          />
        )}

        <div className="relative w-full max-w-md aspect-[3/4] bg-black">
          {images.length < 5 ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover opacity-80"
              />

              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ zIndex: 2 }}
              >
                <div
                  style={{
                    width: "40vw",
                    maxWidth: 220,
                    minWidth: 120,
                    aspectRatio: "4/3",
                    border: `5px solid ${status.color}`,
                    borderRadius: "50%",
                    transition: "border-color 0.3s",
                    boxSizing: "border-box",
                    background: "rgba(0,0,0,0.0)",
                  }}
                />
              </div>

              <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded text-xs">
                {status.message}
              </div>

              <div className="absolute bottom-6 w-full text-center text-sm">
                {VIEWS[Math.min(currentStep, 4)]}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <CheckCircle2 className="text-green-500 mb-3" size={50} />
              <p>All Images Captured!</p>
              <p className="text-sm text-gray-400 mt-2">
                Click Submit to upload
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-4 overflow-x-auto w-full">
          {VIEWS.map((view, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 h-20 border rounded overflow-hidden">
                {images[i] && (
                  <img
                    src={images[i]}
                    className="w-full h-full object-cover"
                    alt={view}
                  />
                )}
              </div>
              <span className="text-xs mt-1 text-gray-400">{view}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-4 mb-8">
          {images.length < 5 ? (
            <>
              <button
                onClick={capture}
                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition"
                disabled={images.length >= 5}
              >
                <Camera />
              </button>
              {images.length > 0 && (
                <button
                  onClick={handleRetakeCurrent}
                  className="px-4 py-2 bg-red-600 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
                >
                  <RefreshCw size={18} />
                  Retake Last
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="px-6 py-3 bg-green-600 rounded-lg flex items-center gap-2 hover:bg-green-700 transition disabled:opacity-50"
              >
                <Upload size={20} />
                {isUploading ? "Uploading..." : "Submit Scan"}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition"
              >
                <RefreshCw size={20} />
                Reset All
              </button>
            </>
          )}
        </div>
      </div>

      {showChat && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setShowChat(false)}
          />
          <div className="relative h-full w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col z-50">
            <button
              className="absolute top-2 right-2 p-2 rounded hover:bg-zinc-800"
              onClick={() => setShowChat(false)}
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
            <MessagingSidebar
              threadId={threadId}
              patientId={patientId}
              sender={sender}
            />
          </div>
        </div>
      )}
    </div>
  );
}
