import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Skeleton from "@mui/material/Skeleton";
import { useNavigate } from "react-router-dom";

import logoSeg from "../../assets/logo-seg.png";
import { getXpInfo } from "../../services/XpService";
import { ProfileContext } from "../../contexts/ProfileContext";
import { api } from "../../lib/axios";
import { colors } from "../../theme/colors";
import { logout } from "../../services/AuthService";
import XpDetailsModal from "../XpDetailsModal";

type XpStats = ReturnType<typeof getXpInfo>;

const Navbar: React.FC = () => {
    const profileContext = useContext(ProfileContext)!;
    const { userType, userProfilePic, userXp, setUserXp } = profileContext;

    const avatarUrl = userProfilePic || "";
    const theme = useTheme();
    const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
    const navigate = useNavigate();

    const xpStats: XpStats = useMemo(() => getXpInfo(userXp ?? 0), [userXp]);
    const level = xpStats.level;
    const safeProgress = Math.max(
        0,
        Math.min(100, Math.round(xpStats?.progress ?? 0))
    );
    const safeXpToNext = xpStats?.xpToNext ?? 0;

    const [loadingXp, setLoadingXp] = useState<boolean>(true);
    const [isXpModalOpen, setIsXpModalOpen] = useState(false);

    const getUserXp = useCallback(async () => {
        setLoadingXp(true);
        const controller = new AbortController();
        try {
            const response = await api.get("/user-xp", { signal: controller.signal });
            const points: number = response?.data?.points ?? 0;
            // atualiza apenas o contexto; o restante é derivado
            setUserXp(points);
        } catch (err: any) {
            // se for cancelado, só ignora
            if (err?.name !== "CanceledError" && err?.message !== "canceled") {
                setUserXp(0);
            }
        } finally {
            setLoadingXp(false);
        }
        return () => controller.abort();
    }, [setUserXp]);

    useEffect(() => {
        if (userType === "S") {
            getUserXp();
        } else {

            setLoadingXp(false);
        }
    }, [getUserXp, userType]);


    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const openUserMenu = Boolean(anchorElUser);
    const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) =>
        setAnchorElUser(e.currentTarget);
    const handleUserClose = () => setAnchorElUser(null);

    const handleUserMenuAction = (key: "perfil" | "estudos" | "logout") => {
        handleUserClose();
        if (key === "logout") {
            logout();
        } else if (key === "estudos") {
            navigate("/studies");
        } else if (key === "perfil") {
            navigate("/my-profile");
        }
    };

    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const openNavMenu = Boolean(anchorElNav);
    const handleOpenNav = (e: React.MouseEvent<HTMLElement>) =>
        setAnchorElNav(e.currentTarget);
    const handleCloseNav = () => setAnchorElNav(null);

    const handleNavigate = (route: string) => {
        handleCloseNav();
        navigate(route);
    };

    const handleOpenXpModal = () => setIsXpModalOpen(true);
    const handleCloseXpModal = () => setIsXpModalOpen(false);

    const studentMenu = [
        { menuId: 1, menuName: "Explorar", menuRoute: "/homepage" },
        { menuId: 2, menuName: "Ranking", menuRoute: "/ranking" },
        { menuId: 3, menuName: "Desafios", menuRoute: "/challenges" },
    ];

    const teacherMenu = [
        { menuId: 1, menuName: "Cursos", menuRoute: "/homepage" },
        { menuId: 2, menuName: "Ranking", menuRoute: "/ranking" },
        { menuId: 3, menuName: "Meus Cursos", menuRoute: "/my-courses" },
        { menuId: 4, menuName: "Estatísticas", menuRoute: "/statistics" },
    ];

    const adminMenu = [
        { menuId: 1, menuName: "Cursos", menuRoute: "/homepage" },
        { menuId: 2, menuName: "Recursos", menuRoute: "/ranking" },
        { menuId: 3, menuName: "Categorias", menuRoute: "/manage/categories" },
        { menuId: 4, menuName: "Gamificação", menuRoute: "/manage/gamification-registers" },
    ];

    const renderMenu = userType && userType === "S" ? studentMenu :
        userType && userType === "A" ? adminMenu :
            teacherMenu;

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                background: `linear-gradient(90deg, ${colors.purple} 0%, ${colors.blue} 100%)`,
                minHeight: 80,
                display: "flex",
                justifyContent: "center",
            }}
        >
            <Toolbar
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: 80,
                    px: { xs: 1.5, sm: 2.5, md: 4 },
                    gap: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, md: 3 } }}>
                    <Box
                        component="img"
                        src={logoSeg}
                        alt="SEG logo"
                        sx={{
                            width: { xs: 44, sm: 48, md: 56 },
                            height: { xs: 44, sm: 48, md: 56 },
                            objectFit: "contain",
                        }}
                    />

                    {isSmUp ? (
                        <Box sx={{ display: "flex", gap: { xs: 1.5, md: 4 }, alignItems: "center" }}>
                            {renderMenu.map((menu) => (
                                <Button
                                    key={menu.menuId}
                                    onClick={() => handleNavigate(menu.menuRoute)}
                                    disableRipple
                                    disableFocusRipple
                                    sx={{
                                        color: "#fff",
                                        fontWeight: 700,
                                        fontSize: { xs: 13, md: 20 },
                                        textTransform: "none",
                                        "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
                                        px: 1,
                                        "&:focus": { outline: "none" },
                                        "&.Mui-focusVisible": { outline: "none", boxShadow: "none" },
                                        "&:active": { boxShadow: "none" },
                                    }}
                                >
                                    {menu.menuName}
                                </Button>
                            ))}
                        </Box>
                    ) : (
                        <Box>
                            <IconButton
                                size="large"
                                onClick={handleOpenNav}
                                aria-controls={openNavMenu ? "nav-menu" : undefined}
                                aria-haspopup="true"
                                aria-expanded={openNavMenu ? "true" : undefined}
                                sx={{
                                    color: "#fff",
                                    ml: 0.5,
                                }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="nav-menu"
                                anchorEl={anchorElNav}
                                open={openNavMenu}
                                onClose={handleCloseNav}
                                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                transformOrigin={{ vertical: "top", horizontal: "left" }}
                                disableScrollLock
                            >
                                {renderMenu.map((menu) => (
                                    <MenuItem key={menu.menuId} onClick={() => handleNavigate(menu.menuRoute)}>
                                        {menu.menuName}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    )}
                </Box>

                {/* XP + avatar */}
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
                    {userType === "S" && (
                        <Tooltip
                            title={`Nível ${level} — ${safeProgress}% • ${safeXpToNext} XP para o próximo nível`}
                            arrow
                            placement="bottom"
                        >
                            <Box
                                role="button"
                                tabIndex={0}
                                onClick={handleOpenXpModal}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        handleOpenXpModal();
                                    }
                                }}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    minWidth: { xs: 90, sm: 140, md: 180 },
                                    gap: 0.5,
                                    cursor: "pointer",
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#fff",
                                        opacity: 0.95,
                                        fontWeight: 600,
                                        fontSize: 13,
                                        lineHeight: "16px",
                                        display: { xs: "none", sm: "block" },
                                    }}
                                >
                                    {loadingXp ? (
                                        <Skeleton
                                            variant="text"
                                            width={60}
                                            sx={{ bgcolor: "rgba(255,255,255,0.12)" }}
                                        />
                                    ) : (
                                        `Nível ${level}`
                                    )}
                                </Typography>

                                <Box
                                    sx={{
                                        width: { xs: 90, sm: 140, md: 180 },
                                        height: 10,
                                        background: "rgba(255,255,255,0.22)",
                                        borderRadius: 999,
                                        padding: "2px",
                                        boxSizing: "border-box",
                                        position: "relative",
                                        overflow: "hidden",
                                        transition: "transform 120ms ease",
                                        "&:hover": { transform: "translateY(-1px) scale(1.02)" },
                                    }}
                                    aria-hidden
                                >
                                    <Box
                                        sx={{
                                            height: "100%",
                                            borderRadius: 999,
                                            background: "linear-gradient(90deg, #7b61ff 0%, #caa9ff 100%)",
                                            boxShadow: "0 2px 6px rgba(75, 0, 255, 0.15)",
                                            transition: "width 360ms ease",
                                            width: `${loadingXp ? 0 : safeProgress}%`,
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Tooltip>
                    )}

                    {/* Avatar */}
                    <IconButton
                        size="large"
                        onClick={handleAvatarClick}
                        aria-controls={openUserMenu ? "user-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={openUserMenu ? "true" : undefined}
                        sx={{ ml: { xs: 0.5, md: 1 } }}
                    >
                        <Avatar
                            src={avatarUrl}
                            alt="Usuário"
                            sx={{
                                width: { xs: 38, sm: 42, md: 44 },
                                height: { xs: 38, sm: 42, md: 44 },
                                bgcolor: "#fff",
                                color: "#000",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                            }}
                        >
                            {!avatarUrl && <PersonIcon />}
                        </Avatar>
                    </IconButton>

                    <Menu
                        id="user-menu"
                        anchorEl={anchorElUser}
                        open={openUserMenu}
                        onClose={handleUserClose}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                        disableScrollLock
                    >
                        <MenuItem onClick={() => handleUserMenuAction("perfil")}>Meu perfil</MenuItem>

                        {userType === "S"&& <MenuItem onClick={() => handleUserMenuAction("estudos")}>Meus estudos</MenuItem>}

                        <MenuItem onClick={() => handleUserMenuAction("logout")}>Sair</MenuItem>
                        
                    </Menu>
                </Box>
            </Toolbar>

            <XpDetailsModal
                open={isXpModalOpen}
                onClose={handleCloseXpModal}
                loadingXp={loadingXp}
                xpInfo={xpStats}
                totalXp={userXp ?? 0}
            />
        </AppBar>
    );
};

export default Navbar;
