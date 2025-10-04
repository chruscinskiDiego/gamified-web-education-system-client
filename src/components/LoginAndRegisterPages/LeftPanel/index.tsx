import { Box, styled } from "@mui/material";

export const LeftPanel = styled(Box)(({ theme }) => ({
    flex: 1.1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(180deg,#44c9ff 0%, #6b3df8 100%)",
    padding: theme.spacing(6),
    [theme.breakpoints.down("md")]: {
        display: "none",
    },
}));