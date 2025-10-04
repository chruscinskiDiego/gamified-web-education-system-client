import { Box, styled } from "@mui/material";

export const RightPanel = styled(Box)(({ theme }) => ({
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6),
}));
