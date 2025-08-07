import { forwardRef } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

type ButtonProps = {
  title: string;
  loading?: boolean;
} & TouchableOpacityProps;

export const Button = forwardRef<View, ButtonProps>(
  ({ title, loading = false, ...touchableProps }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        {...touchableProps}
        disabled={loading || touchableProps.disabled}
        className={`items-center rounded-lg bg-earth-600 py-4 ${touchableProps.className || ''}`}>
        {loading ? (
          <Text className="text-center text-lg font-semibold text-cream-50">Loading...</Text>
        ) : (
          <Text className="text-center text-lg font-semibold text-cream-50">{title}</Text>
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';
