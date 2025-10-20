import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Stack, Typography, alpha, Alert } from "@mui/material";

import { api } from "../../lib/axios";
import { ChallengeSection } from "../../components/ChallengeSection";
import type { ChallengeSummary, ChallengesResponse } from "../../interfaces/challenge.interfaces";

const INITIAL_STATE: ChallengesResponse = {
    sub_challenges: [],
    all_challenges: [],
};

const ChallengesPage: React.FC = () => {
    const navigate = useNavigate();

    const [challenges, setChallenges] = useState<ChallengesResponse>(INITIAL_STATE);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getChallenges = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get<ChallengesResponse>("/challenge/student-view/all");

            if (response.status === 200 && response.data) {
                setChallenges({
                    sub_challenges: response.data.sub_challenges ?? [],
                    all_challenges: response.data.all_challenges ?? [],
                });
            }
        } catch (err) {
            setError("Não foi possível carregar os desafios agora. Tente novamente em instantes.");
            setChallenges(INITIAL_STATE);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void getChallenges();
    }, []);

    const handleNavigate = (challenge: ChallengeSummary) => {
        navigate(`/challenges/${challenge.id_challenge}`);
    };

    return (
        <Box
            sx={{
                minHeight: "calc(100vh - 64px)",
                background: "linear-gradient(180deg, rgba(93,112,246,0.08) 0%, rgba(255,255,255,1) 40%)",
                py: { xs: 6, md: 8 },
            }}
        >
            <Container maxWidth="lg">
                <Stack spacing={{ xs: 5, md: 7 }}>
                    <Box
                        sx={{
                            borderRadius: 4,
                            px: { xs: 3, md: 6 },
                            py: { xs: 5, md: 7 },
                            background: "linear-gradient(135deg, rgba(93,112,246,0.95) 0%, rgba(73,160,251,0.92) 100%)",
                            color: "#fff",
                            boxShadow: "0px 20px 48px rgba(73,160,251,0.35)",
                        }}
                    >
                        <Stack spacing={2} alignItems={{ xs: "flex-start", md: "center" }} textAlign={{ xs: "left", md: "center" }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    letterSpacing: 1.2,
                                }}
                            >
                                Desafios épicos
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    maxWidth: 620,
                                    color: alpha("#fff", 0.9),
                                }}
                            >
                                Participe de jornadas gamificadas, conquiste XP extra e desbloqueie novas recompensas enquanto avança nos estudos.
                            </Typography>
                        </Stack>
                    </Box>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                borderRadius: 3,
                                background: alpha("#ff4d4d", 0.08),
                                color: "#d32f2f",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 2,
                            }}
                            action={
                                <Button color="error" size="small" onClick={() => void getChallenges()}>
                                    Tentar novamente
                                </Button>
                            }
                        >
                            {error}
                        </Alert>
                    )}

                    <ChallengeSection
                        title="Meus desafios"
                        description="Acompanhe os desafios que você já está enfrentando e mantenha sua streak de XP em dia."
                        challenges={challenges.sub_challenges}
                        loading={loading}
                        emptyTitle="Você ainda não se inscreveu em nenhum desafio"
                        emptyDescription="Explore os desafios disponíveis abaixo e encontre uma jornada para chamar de sua."
                        variant="subscribed"
                        onNavigate={handleNavigate}
                    />

                    <ChallengeSection
                        title="Todos os desafios"
                        description="Descubra novas experiências gamificadas e acelere sua evolução." 
                        challenges={challenges.all_challenges}
                        loading={loading}
                        emptyTitle="Nenhum desafio disponível no momento"
                        emptyDescription="Assim que novos desafios forem lançados eles aparecerão aqui. Fique de olho!"
                        variant="all"
                        onNavigate={handleNavigate}
                    />
                </Stack>
            </Container>
        </Box>
    );
};

export default ChallengesPage;
