import { Box, styled } from "@mui/material";

export const BottomDots = styled(Box)(({ theme }) => ({
    position: "absolute",
    bottom: theme.spacing(3),
    right: theme.spacing(4),
    display: "flex",
    gap: theme.spacing(1.2),
    zIndex: 2,
    [theme.breakpoints.down("sm")]: {
        display: "none",
    },
}));
