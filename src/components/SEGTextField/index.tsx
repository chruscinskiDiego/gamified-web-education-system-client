import React, { useMemo, useState } from "react";
import {
    TextField,
    Typography,
    InputAdornment,
    IconButton,
    Box,
    type TextFieldProps,
    styled,
    type SxProps,
    type Theme,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { colors } from "../../theme/colors";

export interface SEGTextFieldProps extends Omit<TextFieldProps, "variant" | "size"> {
    /** Texto do label (se omitido você pode renderar externamente) */
    label?: string;
    /** define pequenas variações visuais via sx predefinido */
    colorTheme?: "default" | "faded" | "surface";
    /** ícone no início (renderizado como startAdornment) */
    startIcon?: React.ReactNode;
    /** se true e type="password" adiciona botão para mostrar/ocultar senha */
    showPasswordToggle?: boolean;
    sx?: SxProps<Theme>;
}

const Styled = styled(TextField)(() => ({
  borderRadius: 10,
  "& .MuiFilledInput-root": {
    borderRadius: 3,
    paddingLeft: 8,
    paddingRight: 8,
  },
  "& .MuiInputBase-input": {
    paddingTop: 12,
    paddingBottom: 12,
  },

  "& .MuiFilledInput-root textarea": {
    maxHeight: 273,
    minHeight: 80,
    resize: "vertical",
    overflow: "auto",
    padding: 12,

    // Firefox: largura / cor do scrollbar
    scrollbarWidth: "thin", // 'auto' | 'thin' | 'none'
    scrollbarColor: "rgba(0,0,0,0.22) transparent",

    // WebKit (Chrome, Edge, Safari)
    "&::-webkit-scrollbar": {
      width: 8,
      height: 8,
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: 999,
      border: "2px solid transparent",
      backgroundClip: "content-box",
      backgroundColor: "rgba(0,0,0,0.18)",
    },
    // foco/hover no thumb
    "&:hover::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,0.28)",
    },
  },
}));

const SEGTextField: React.FC<SEGTextFieldProps> = ({
    label,
    startIcon,
    showPasswordToggle = false,
    colorTheme = "default",
    type,
    sx,
    InputProps,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleToggle = () => setShowPassword((s) => !s);

    const mergedInputProps = useMemo(() => {
        const user = InputProps || {};

        const startAdornment =
            user.startAdornment ??
            (startIcon ? <InputAdornment position="start">{startIcon}</InputAdornment> : undefined);

        const userEnd = user.endAdornment;
        const endAdornment =
            userEnd ??
            (showPasswordToggle ? (
                <InputAdornment position="end">
                    <IconButton
                        onClick={handleToggle}
                        edge="end"
                        size="small"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                </InputAdornment>
            ) : undefined);

        return {
            ...user,
            startAdornment,
            endAdornment,
        } as typeof user;

    }, [InputProps, startIcon, showPasswordToggle, showPassword]);

    return (
        <Box>
            {label && (
                <Typography variant="subtitle2" sx={{ color: colors.strongGray, mb: 1, fontWeight: 600 }}>
                    {label}
                </Typography>
            )}

            <Styled
                variant="filled"
                fullWidth
                type={showPassword ? "text" : type}
                InputProps={mergedInputProps}
                sx={{
                    mb: 3,
                    "& .MuiFilledInput-root": {
                        borderRadius: 3,
                        backgroundColor: "#f4efef",
                    },
                }}
                {...props}
            />
        </Box>
    );
};

export default SEGTextField;
