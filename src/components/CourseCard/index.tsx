import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Chip,
    Rating,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { mapDifficulty } from "../../helpers/DifficultyLevel";
import type { CourseSummary } from "../../interfaces/course.interfaces";

export const CourseCard = ({
    course,
    onClick,
}: {
    course: CourseSummary & { category_name?: string | null };
    onClick: () => void;
}) => {
    const theme = useTheme();

    const difficulty = mapDifficulty(course.difficulty_level ?? "M");
    const ratingValue = course.avaliation_average ?? 0;
    const hasRating = course.avaliation_average !== null && course.avaliation_average !== undefined;
    const categoryName = course.category_name ?? null;

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                height: "100%",
                background: "#ffffff",
                boxShadow: "0px 10px 30px rgba(33, 33, 52, 0.08)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                display: "flex",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0px 18px 40px rgba(33, 33, 52, 0.18)",
                },
            }}
        >
            <CardActionArea
                onClick={onClick}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    height: "100%",
                }}
            >
                {course.link_thumbnail ? (
                    <CardMedia
                        component="img"
                        height="160"
                        image={course.link_thumbnail}
                        alt={`Capa do curso ${course.title}`}
                        sx={{ objectFit: "cover", flexShrink: 0 }}
                    />
                ) : (
                    <Box
                        sx={{
                            height: 160,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: theme.palette.grey[100],
                            color: theme.palette.grey[500],
                        }}
                    >
                        <ImageIcon fontSize="large" />
                    </Box>
                )}

                <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Stack spacing={2}>
                        <Stack
                            direction="row"
                            alignItems="flex-start"
                            justifyContent="space-between"
                            spacing={1.5}
                        >
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {categoryName && (
                                    <Chip
                                        icon={<LocalOfferOutlinedIcon sx={{ fontSize: 16 }} />}
                                        label={categoryName}
                                        size="small"
                                        sx={{
                                            background: "rgba(73, 160, 251, 0.16)",
                                            color: "#1a4dd8",
                                            fontWeight: 600,
                                            letterSpacing: 0.2,
                                        }}
                                    />
                                )}

                                <Chip
                                    label={difficulty}
                                    size="small"
                                    sx={{
                                        background: "rgba(77, 103, 246, 0.14)",
                                        color: "#5560ff",
                                        fontWeight: 600,
                                        letterSpacing: 0.2,
                                    }}
                                />
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                {hasRating ? (
                                    <>
                                        <Rating
                                            value={ratingValue}
                                            precision={0.5}
                                            readOnly
                                            size="small"
                                            sx={{ color: "#ffb400" }}
                                        />
                                        <Typography variant="body2" sx={{ color: theme.palette.grey[600], fontWeight: 600 }}>
                                            {ratingValue.toFixed(1)}
                                        </Typography>
                                    </>
                                ) : (
                                    <Typography variant="body2" sx={{ color: theme.palette.grey[500] }}>
                                        Sem avaliações
                                    </Typography>
                                )}
                            </Stack>
                        </Stack>

                        <Stack spacing={1}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontSize: "1.05rem",
                                    fontWeight: 700,
                                    color: theme.palette.text.primary,
                                    minHeight: 56,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                }}
                            >
                                {course.title}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "#5560ff", fontWeight: 600 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Ver detalhes
                                </Typography>
                                <ArrowForwardIcon sx={{ fontSize: 18 }} />
                            </Stack>
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};