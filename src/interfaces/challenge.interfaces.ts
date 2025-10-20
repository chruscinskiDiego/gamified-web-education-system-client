export interface ChallengeSummary {
    title: string;
    active: boolean;
    status: string | null;
    user_sub: boolean;
    id_challenge: number;
    challenge_type: string;
}

export interface ChallengesResponse {
    sub_challenges: ChallengeSummary[];
    all_challenges: ChallengeSummary[];
}
