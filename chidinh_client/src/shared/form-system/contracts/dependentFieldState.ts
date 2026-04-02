export type DependentFieldState<TValue = string> = {
  visible: boolean;
  value: TValue | null;
  error: string | null;
  touched: boolean;
};

export function reconcileDependentFieldState<TValue>(
  state: DependentFieldState<TValue>,
): DependentFieldState<TValue> {
  if (state.visible) {
    return state;
  }

  return {
    ...state,
    value: null,
    error: null,
    touched: false,
  };
}
