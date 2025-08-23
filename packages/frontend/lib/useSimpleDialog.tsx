"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

interface UseSimpleDialogOptions<TData = unknown> {
  title?: string;
  renderContent: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  closable?: boolean;
  maxWidth?: number;
  onConfirm?: (data: TData) => void;
  onCancel?: (data: TData) => void;
}

interface UseSimpleDialogReturn<TData = undefined> {
  show: (data: TData) => void;
  hide: () => void;
  visible: boolean;
  DialogComponent: React.ComponentType;
}

const EmptySymbol = Symbol("Empty");

export function useSimpleDialog<TData = undefined>({
  title,
  renderContent,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = true,
  closable = true,
  maxWidth = 600,
  onConfirm,
  onCancel,
}: UseSimpleDialogOptions<TData>): UseSimpleDialogReturn<TData> {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<TData | typeof EmptySymbol>(EmptySymbol);

  const show = useCallback((data: TData) => {
    setData(data);
    setVisible(true);
  }, []);
  const hide = useCallback(() => setVisible(false), []);

  const handleConfirm = useCallback(() => {
    onConfirm?.(data === EmptySymbol ? undefined : data);
    hide();
  }, [onConfirm, hide]);

  const handleCancel = useCallback(() => {
    onCancel?.(data === EmptySymbol ? undefined : data);
    hide();
  }, [onCancel, hide]);

  const DialogComponent = useCallback(() => {
    return (
      <Dialog open={visible} onOpenChange={setVisible}>
        <DialogContent style={{ maxWidth: `${maxWidth}px` }}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {renderContent}
          <DialogFooter>
            {showCancel && (
              <Button variant="outline" onClick={handleCancel}>
                {cancelText}
              </Button>
            )}
            <Button className="grow-1" onClick={handleConfirm}>
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }, [
    visible,
    closable,
    renderContent,
    showCancel,
    confirmText,
    cancelText,
    handleConfirm,
    handleCancel,
    title,
    maxWidth,
  ]);

  return {
    show,
    hide,
    visible,
    DialogComponent,
  };
}
