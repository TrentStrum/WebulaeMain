'use client';

import * as React from 'react';

import type { ToastActionElement, ToastProps } from '@/src/components/ui/toast';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 3000;

type ToasterToast = ToastProps & {
	id: string;
	title?: React.ReactNode;
	description?: React.ReactNode;
	action?: ToastActionElement;
};

const actionTypes = {
	ADD_TOAST: 'ADD_TOAST',
	UPDATE_TOAST: 'UPDATE_TOAST',
	DISMISS_TOAST: 'DISMISS_TOAST',
	REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

type ActionType = typeof actionTypes;

type Action =
	| { type: ActionType['ADD_TOAST']; toast: ToasterToast }
	| { type: ActionType['UPDATE_TOAST']; toast: Partial<ToasterToast> }
	| { type: ActionType['DISMISS_TOAST']; toastId?: string }
	| { type: ActionType['REMOVE_TOAST']; toastId?: string };

interface State {
	toasts: ToasterToast[];
}

let count = 0;

function genId(): string {
	count = (count + 1) % Number.MAX_SAFE_INTEGER;
	return count.toString();
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function addToRemoveQueue(toastId: string): void {
	if (toastTimeouts.has(toastId)) return;

	const timeout = setTimeout(() => {
		toastTimeouts.delete(toastId);
		dispatch({ type: 'REMOVE_TOAST', toastId });
	}, TOAST_REMOVE_DELAY);

	toastTimeouts.set(toastId, timeout);
}

let memoryState: State = { toasts: [] };

const listeners: Array<(state: State) => void> = [];

function dispatch(action: Action): void {
	memoryState = reducer(memoryState, action);
	listeners.forEach((listener) => listener(memoryState));
}

export function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'ADD_TOAST':
			return {
				...state,
				toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
			};

		case 'UPDATE_TOAST':
			return {
				...state,
				toasts: state.toasts.map((t) =>
					t.id === action.toast.id ? { ...t, ...action.toast } : t
				),
			};

		case 'DISMISS_TOAST': {
			const { toastId } = action;

			if (toastId) {
				addToRemoveQueue(toastId);
			} else {
				state.toasts.forEach((toast) => {
					addToRemoveQueue(toast.id);
				});
			}

			return {
				...state,
				toasts: state.toasts.map((t) =>
					t.id === toastId || toastId === undefined
						? { ...t, open: false }
						: t
				),
			};
		}

		case 'REMOVE_TOAST':
			if (action.toastId === undefined) {
				return { ...state, toasts: [] };
			}
			return {
				...state,
				toasts: state.toasts.filter((t) => t.id !== action.toastId),
			};
	}
}

function toast(props: Omit<ToasterToast, 'id'>): {
	id: string;
	dismiss: () => void;
	update: (props: ToasterToast) => void;
} {
	const id = genId();

	const update = (props: ToasterToast): void =>
		dispatch({
			type: 'UPDATE_TOAST',
			toast: { ...props, id },
		});

	const dismiss = (): void => dispatch({ type: 'DISMISS_TOAST', toastId: id });

	dispatch({
		type: 'ADD_TOAST',
		toast: {
			...props,
			id,
			open: true,
			onOpenChange: (open: boolean) => {
				if (!open) dismiss();
			},
		},
	});

	return {
		id,
		dismiss,
		update,
	};
}

function useToast(): {
	toasts: ToasterToast[];
	toast: typeof toast;
	dismiss: (toastId?: string) => void;
} {
	const [state, setState] = React.useState<State>(memoryState);

	React.useEffect(() => {
		listeners.push(setState);
		return () => {
			const index = listeners.indexOf(setState);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		};
	}, [state]);

	return {
		...state,
		toast,
		dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
	};
}

export { toast, useToast };
