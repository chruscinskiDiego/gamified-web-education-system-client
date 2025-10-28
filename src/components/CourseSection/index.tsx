import { Box, Grid, Icon, Stack, Typography, useTheme } from "@mui/material";
import type { CourseSummary } from "../../interfaces/course.interfaces";
import { CourseCard } from "../CourseCard";
import BookIcon from '@mui/icons-material/Book';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import StarsIcon from '@mui/icons-material/Stars';
import { colors } from "../../theme/colors";

export const CourseSection = ({
    title,
    description,
    courses,
    type,
    onNavigate,
}: {
    title: string;
    description: string;
    courses: CourseSummary[];
    type: 'registered' | 'highlighted';
    onNavigate: (id: string) => void;
}) => {
    const theme = useTheme();

    return (
        <Stack spacing={2.5} component="section">
            <Stack spacing={1}>
                <Box display="flex">
                    <Typography variant="h4" sx={{ fontWeight: 800, color: colors.blue }}>
                        {title}
                    </Typography>
                    <Icon sx={{mt: 1, ml: 0.5, color: colors.purple}}>
                        {type === 'highlighted' ? <WhatshotIcon /> : <StarsIcon />}
                    </Icon>
                </Box>

                <Box display="flex">
                    <Typography variant="body2" sx={{ color: theme.palette.grey[600], maxWidth: 520 }}>
                        {description}
                    </Typography>
                </Box>
            </Stack>

            <Box
                sx={{
                    borderRadius: 4,
                    background: "#ffffff",
                    boxShadow: "0px 16px 40px rgba(33, 33, 52, 0.12)",
                    p: { xs: 2.5, md: 4 },
                }}
            >
                {courses.length === 0 ? (
                    <Box
                        sx={{
                            py: { xs: 6, md: 8 },
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            color: theme.palette.grey[500],
                        }}
                    >
                        <BookIcon sx={{ fontSize: "80px", color: colors.purple }}/>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: colors.purple }}>
                            { type === 'registered' ? 'Você não tem cursos em progresso' : 'Nada por aqui ainda'}
                        </Typography>
                        <Typography variant="body2" sx={{ maxWidth: 360 }}>
                            { type === 'registered' ? 'Assim que você se matricular em cursos, eles aparecerão nesta seção': 'Assim que novos cursos estiverem disponíveis, eles aparecerão nesta seção'}
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {courses.map((course) => (
                            <Grid item xs={12} sm={6} md={4} key={course.id_course}>
                                <CourseCard
                                    course={course}
                                    onClick={() => onNavigate(course.id_course)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Stack>
    );
};
