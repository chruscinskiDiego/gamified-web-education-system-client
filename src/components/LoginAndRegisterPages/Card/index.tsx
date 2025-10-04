import { Box, styled } from "@mui/material";

export const Card = styled(Box)(({ theme }) => ({
    width: "100%",
    maxWidth: 520,
    padding: theme.spacing(6),
    [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(3),
        maxWidth: "95%",
    },
}));