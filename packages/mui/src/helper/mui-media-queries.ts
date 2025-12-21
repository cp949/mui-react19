import type { Breakpoint } from '@mui/material';
import type { AliasesCSSProperties, StandardCSSProperties } from '@mui/system';

type THEME = {
  breakpoints: {
    down: (breakpoint: Breakpoint) => string;
    up: (breakpoint: Breakpoint) => string;
  };
};

export function xsOrDown(theme: THEME, css: AliasesCSSProperties | StandardCSSProperties) {
  return {
    // max-width: 600
    [theme.breakpoints.down('sm')]: css,
  };
}

export function smOrDown(theme: THEME, css: AliasesCSSProperties | StandardCSSProperties) {
  return {
    // max-width: 900
    [theme.breakpoints.down('md')]: css,
  };
}

export function mdOrDown(theme: THEME, css: AliasesCSSProperties | StandardCSSProperties) {
  return {
    // max-width: 1200
    [theme.breakpoints.down('lg')]: css,
  };
}

export function lgOrDown(theme: THEME, css: AliasesCSSProperties | StandardCSSProperties) {
  return {
    // max-width: 1536
    [theme.breakpoints.down('xl')]: css,
  };
}

export function smOrUp(theme: THEME, css: AliasesCSSProperties | StandardCSSProperties) {
  return {
    // min-width: 600
    [theme.breakpoints.up('sm')]: css,
  };
}

export function mdOrUp(theme: THEME, css: AliasesCSSProperties | StandardCSSProperties) {
  return {
    // min-width: 900
    [theme.breakpoints.up('md')]: css,
  };
}

export function lgOrUp(theme: THEME, css: AliasesCSSProperties | StandardCSSProperties) {
  return {
    // min-width: 1200
    [theme.breakpoints.up('lg')]: css,
  };
}

export function xlOrUp(theme: THEME, css: AliasesCSSProperties | StandardCSSProperties) {
  return {
    // min-width: 1500
    [theme.breakpoints.up('xl')]: css,
  };
}
