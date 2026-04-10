'use client';

import type { BoxProps, LinkProps, SxProps } from '@mui/material';
import { Box, Link, styled } from '@mui/material';
import clsx from 'clsx';
import type { CSSProperties, ReactNode } from 'react';
import { forwardRef } from 'react';
import { useElementSize } from '../hooks/useElementSize.js';
import { useId } from '../hooks/useId.js';
import { useUncontrolled } from '../hooks/useUncontrolled.js';

export interface SpoilerProps {
  sx?: SxProps;

  className?: string;

  style?: CSSProperties;

  id?: string;

  /** Maximum height of the visible content, when this point is reached spoiler appears, `100` by default */
  maxHeight?: number;

  /** Label for close spoiler action */
  hideLabel: React.ReactNode;

  /** Label for open spoiler action */
  showLabel: React.ReactNode;

  /** Get ref of spoiler toggle button */
  controlRef?: React.ForwardedRef<HTMLButtonElement>;

  /** Initial spoiler state, true to wrap content in spoiler, false to show content without spoiler, opened state is updated on mount */
  initialState?: boolean;

  /** Controlled expanded state value */
  expanded?: boolean;

  /** Called when expanded state changes (when spoiler visibility is toggled by the user) */
  onExpandedChange?: (expanded: boolean) => void;

  /** Spoiler reveal transition duration in ms, set 0 or null to turn off animation, `200` by default */
  transitionDuration?: number;

  children?: ReactNode;
}

export const Spoiler = forwardRef<HTMLElement, SpoilerProps>((props, ref) => {
  const {
    sx,
    className,
    style,
    id,
    initialState,
    maxHeight = 100,
    hideLabel,
    showLabel,
    expanded,
    onExpandedChange,
    controlRef,
    children,
    transitionDuration = 100,
    ...restProps
  } = props;

  const _id = useId(id);
  const regionId = `${_id}-region`;
  const [show, setShowState] = useUncontrolled({
    value: expanded,
    defaultValue: initialState,
    finalValue: false,
    onChange: onExpandedChange,
  });
  const { ref: contentRef, height } = useElementSize<HTMLDivElement>();

  const spoilerMoreContent = show ? hideLabel : showLabel;
  const hasSpoiler = spoilerMoreContent !== null && maxHeight < height;

  return (
    <RootBox
      className={clsx('Spoiler-root', className)}
      sx={[sx, ...(Array.isArray(sx) ? sx : [sx ?? false])]}
      style={style}
      id={_id}
      ref={ref}
      data-has-spoiler={hasSpoiler}
      {...restProps}
    >
      {hasSpoiler && (
        <StyledMoreButton
          component='button'
          ref={controlRef}
          onClick={() => {
            setShowState(!show);
          }}
          aria-expanded={show}
          aria-controls={regionId}
        >
          {spoilerMoreContent}
        </StyledMoreButton>
      )}
      <StyledContent
        data-reduce-motion
        role='region'
        id={regionId}
        transitionDuration={transitionDuration}
        style={{
          maxHeight: !show ? maxHeight : (height ?? undefined),
        }}
      >
        <div ref={contentRef}>{children}</div>
      </StyledContent>
    </RootBox>
  );
});

Spoiler.displayName = 'Spoiler';

const RootBox = styled(Box)<BoxProps>(() => ({
  position: 'relative',
  '&:where([data-has-spoiler="true"])': {
    marginBottom: 24,
  },
}));

const StyledMoreButton = styled(Link<'button'>)<LinkProps<'button'>>(() => ({
  position: 'absolute',
  insetInlineStart: 0,
  top: '100%',
  height: 32,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const StyledContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'transitionDuration',
})<
  BoxProps & {
    transitionDuration?: number;
  }
>(({ transitionDuration = 200 }) => ({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  transition: `max-height ${transitionDuration}ms ease`,
}));
