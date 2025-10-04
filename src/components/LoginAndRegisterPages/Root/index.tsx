import { Box, styled } from "@mui/material";

export const Root = styled(Box)(({ theme }) => ({
    minHeight: "100vh",
    display: "flex",
    alignItems: "stretch",
    background: theme.palette.background.default,
}));