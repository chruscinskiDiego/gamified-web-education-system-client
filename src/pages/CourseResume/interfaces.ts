export type EvaluationMetric = {
    note: number | null;
    id_avaliation: number | null;
};

export interface CourseEvaluationCommentary {
    id_avaliation: number | null;
    comment?: string | null;
    note?: number | string | null;
    [key: string]: unknown;
}

export interface CourseEvaluationNotes {
    didatics?: EvaluationMetric;
    material_quality?: EvaluationMetric;
    teaching_methodology?: EvaluationMetric;
    commentary?: CourseEvaluationCommentary | null;
}

export interface CourseEvaluation {
    avg: number | null;
    notes: CourseEvaluationNotes;
    commentary?: CourseEvaluationCommentary | null;
    student_id: string | null;
    student_full_name: string | null;
    student_profile_picture: string | null;
    last_avaliation_id: number | null;
}

export interface CourseResumeData {
    id_course: string | null;
    title: string | null;
    description: string | null;
    link_thumbnail: string | null;
    difficulty_level: string | null;
    created_at: string | null;
    registration_state: "S" | "F" | null;
    teacher_full_name?: string | null;
    teacher_profile_picture?: string | null;
    category?: string | null;
    modules_count: string | number | null;
    overall_rating: {
        avg: number | null;
        count: number;
    };
    user_rated: boolean;
    evaluations_by_user: CourseEvaluation[];
}

export type CourseResumeApiResponse = Omit<CourseResumeData, "overall_rating" | "evaluations_by_user"> & {
    overall_rating?: {
        avg: number | null;
        count: number | null;
    } | null;
    evaluations_by_user?: Array<(
        Omit<CourseEvaluation, "notes" | "commentary"> & {
            notes?: {
                didatics?: EvaluationMetric | null;
                material_quality?: EvaluationMetric | null;
                teaching_methodology?: EvaluationMetric | null;
                commentary?: CourseEvaluationCommentary | null;
            } | null;
            commentary?: CourseEvaluationCommentary | null;
        }
    ) | null> | null;
};

export interface RatingFormValues {
    materialQualityNote: number;
    didaticsNote: number;
    teachingMethodologyNote: number;
    commentary: string;
}

export interface CreateEvaluationPayload {
    materialQualityNote: number;
    didaticsNote: number;
    teachingMethodologyNote: number;
    commentary: string;
    id_course: string;
}

export interface UpdateEvaluationPayload {
    materialQualityAvaliationId: number | null | undefined;
    materialQualityNote: number;
    didaticsAvaliationId: number | null | undefined;
    didaticsNote: number;
    teachingMethodologyAvaliationId: number | null | undefined;
    teachingMethodologyNote: number;
    commentaryId: number | null | undefined;
    commentary: string;
}

export interface DeleteEvaluationPayload {
    avaliations: Array<{
        avaliation_type: "didatics" | "material_quality" | "teaching_methodology" | "commentary";
        delete_avaliation_id: number;
    }>;
}
