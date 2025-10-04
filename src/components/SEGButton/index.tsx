import React from "react";
import Button, { type ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material";
import { colors } from "../../theme/colors";

interface SEGButtonProps extends ButtonProps {
  colorTheme?: "blue" | "purple" | "gradient";
  loading?: boolean;
}

const Styled = styled(Button)(({ theme }) => ({
  paddingBlock: "14.4px",
  borderRadius: 10,
  fontWeight: 700,
  letterSpacing: "0.6px",
  textTransform: "uppercase",
  marginBottom: theme.spacing(2),
}));

const variants: Record<
  NonNullable<SEGButtonProps["colorTheme"]>,
  SxProps<Theme>
> = {
  gradient: {
    background: colors.horizontalGradient,
    boxShadow: "0 8px 20px rgba(95,177,255,0.2)",
    "&:hover": { filter: "brightness(0.95)" },
    "&.Mui-disabled": {
      opacity: 0.6,
      boxShadow: "none",
    },
  },
  blue: {
    background: colors.blue,
    boxShadow: "0 8px 20px rgba(78,140,255,0.18)",
    "&:hover": { filter: "brightness(0.95)" },
    "&.Mui-disabled": {
      opacity: 0.6,
      boxShadow: "none",
    },
  },
  purple: {
    background: colors.purple,
    boxShadow: "0 8px 20px rgba(122,92,255,0.18)",
    "&:hover": { filter: "brightness(0.95)" },
    "&.Mui-disabled": {
      opacity: 0.6,
      boxShadow: "none",
    },
  },
};

const SEGButton: React.FC<SEGButtonProps> = ({
  colorTheme = "gradient",
  loading = false,
  startIcon,
  children,
  sx,
  ...props
}) => {
  const themeSx = variants[colorTheme] ?? variants.gradient;

  const mergedSx: SxProps<Theme> = Array.isArray(sx)
    ? [themeSx, ...sx]
    : [themeSx, sx];

  return (
    <Styled
      variant={props.variant ?? "contained"}
      fullWidth={props.fullWidth ?? true}
      startIcon={loading ? undefined : startIcon}
      disabled={loading || props.disabled}
      sx={mergedSx}
      {...props}
    >
      {loading ? <CircularProgress size={20} /> : children}
    </Styled>
  );
};

export default SEGButton;
