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

export type Category = {
    id_category?: number;
    name: string;
    active: boolean;
};

export type CourseModule = {
    order: number;
    title: string;
    id_module?: number;
    created_at?: string;
    description: string;
    id_course ?:string;
};

export type Course = {
    id_course?: string;
    title: string;
    description: string;
    link_thumbnail?: string | null;
    difficulty_level: string;
    created_at?: string;
    active?: boolean;
    id_category?: number | null;
    course_modules?: CourseModule[];
};