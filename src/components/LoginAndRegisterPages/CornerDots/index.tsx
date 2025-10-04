import { Box, styled } from "@mui/material";

export const CornerDots = styled(Box)(({ theme }) => ({
    position: "absolute",
    top: theme.spacing(3),
    left: theme.spacing(4),
    display: "flex",
    gap: theme.spacing(1.2),
    zIndex: 2,
    [theme.breakpoints.down("sm")]: {
        display: "none",
    },
}));