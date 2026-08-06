import { createContext } from "react";

export type ToastVariant = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

export type ToastApi = {
  push: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  /** Chuẩn CRUD / gửi mail */
  created: (entity?: string) => void;
  updated: (entity?: string) => void;
  deleted: (entity?: string) => void;
  sent: (count?: number) => void;
};

export const ToastContext = createContext<ToastApi | null>(null);
