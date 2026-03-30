import React, { forwardRef } from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';

// A primary-colored button wrapper that keeps all original AntD Button props.
const ButtonPrimary = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    const { style, type = 'primary', ...rest } = props;
    const mergedStyle: React.CSSProperties = {
        backgroundColor: 'var(--color-primary)',
        borderColor: 'var(--color-primary)',
        color: '#fff',
        ...style,
    };

    return <Button ref={ref} type={type} style={mergedStyle} {...rest} />;
});

ButtonPrimary.displayName = 'ButtonPrimary';

export default ButtonPrimary;
