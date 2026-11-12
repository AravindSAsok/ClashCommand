"use client";

import * as React from "react";

type ToastActionElement = React.ReactElement;
type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & { id: string };

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;
type Action =
  | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
  | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
  | { type: ActionType["DISMISS_TOAST"]; toastId?: string }
  | { type: ActionType["REMOVE_TOAST"]; toastId?: string };

interface State { toasts: ToasterToast[] }

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
let dispatchFn: (action: Action) => void;

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return;
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatchFn({ type: "REMOVE_TOAST", toastId });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case actionTypes.UPDATE_TOAST:
      return { ...state, toasts: state.toasts.map((toast) => toast.id === action.toast.id ? { ...toast, ...action.toast } : toast) };
    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;
      if (toastId) addToRemoveQueue(toastId);
      else state.toasts.forEach((toast) => addToRemoveQueue(toast.id));
      return { ...state, toasts: state.toasts.map((toast) => toast.id === toastId || toastId === undefined ? { ...toast, open: false } : toast) };
    }
    case actionTypes.REMOVE_TOAST:
      return { ...state, toasts: action.toastId === undefined ? [] : state.toasts.filter((toast) => toast.id !== action.toastId) };
  }
};

function dispatch(action: Action) { dispatchFn(action); }

type Toast = Omit<ToasterToast, "id">;

function useToast() {
  const [state, localDispatch] = React.useReducer(reducer, { toasts: [] });
  React.useEffect(() => { dispatchFn = localDispatch; }, [localDispatch]);

  const createToast = (props: Toast) => {
    const id = genId();
    const update = (newProps: Partial<ToasterToast>) => localDispatch({ type: "UPDATE_TOAST", toast: { ...newProps, id } });
    const dismiss = () => localDispatch({ type: "DISMISS_TOAST", toastId: id });
    localDispatch({
      type: "ADD_TOAST",
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open: boolean) => { if (!open) dismiss(); },
      },
    });
    return { id, dismiss, update };
  };

  return {
    ...state,
    toasts: state.toasts,
    toast: createToast,
    dismiss: (toastId?: string) => localDispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, type Toast, type ToastActionElement };
