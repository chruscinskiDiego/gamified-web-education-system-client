export type GetCourse = {
    id_course: string;
    title: string;
    description: string;
    link_thumbnail: string | null;
    difficulty_level: string;
    module_count: string | number;
    active?: boolean;
    created_at?: string; 
};