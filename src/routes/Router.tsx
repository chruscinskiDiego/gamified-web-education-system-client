import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import { HomePage } from "../pages/HomePage";
import { useContext } from "react";
import { ProfileContext } from "../contexts/ProfileContext";
import { ProtectedLayout } from "../layouts/ProtectedLayout";
import RankingPage from "../pages/RankingPage";
import ChallengesPage from "../pages/ChallengesPage";
import StatisticsByTeacherPage from "../pages/StatisticsByTeacherPage";
import CoursesByTeacherPage from "../pages/CoursesByTeacherPage";
import NewCoursePage from "../pages/NewCoursePage";
import CourseManagementPage from "../pages/CourseManagementPage";
import ModuleManagementPage from "../pages/ModuleManagementPage";
import CoursesResume from "../pages/CourseResume";
import CourseDataAndProgressPage from "../pages/CourseDataAndProgressPage";
import GamificationRegisters from "../pages/GamificationRegisters";
import CategoriesPage from "../pages/CategoriesPage";
import ChallengeSubPage from "../pages/ChallengeSubPage";
import PasswordRecoveryPage from "../pages/PasswordRecoveryPage";
import ProfilePage from "../pages/ProfilePage";
import StudiesPage from "../pages/StudiesPage";
import AllCoursesPage from "../pages/AllCoursesPage";
import InsigniasPage from "../pages/InsigniasPage";
import UsersManagementPage from "../pages/UsersManagementPage";

export const Router: React.FC = () => {

    const { isAuthenticated } = useContext(ProfileContext)!;

    return (
        <Routes>

            {!isAuthenticated && (
                <>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/signin" element={<LoginPage />} />
                    <Route path="/signup" element={<RegisterPage />} />
                    <Route path="/password-recovery" element={<PasswordRecoveryPage/>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </>
            )}

            {isAuthenticated && (
                <>
                    <Route element={<ProtectedLayout />}>

                        <Route path="/" element={<HomePage />} />
                        <Route path="/homepage" element={<HomePage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />

                        <Route path="/ranking" element={<RankingPage />} />
                        <Route path="/challenges" element={<ChallengesPage />} />
                        <Route path="/challenges/:id" element={<ChallengeSubPage/>}/>

                        {/*TEACHER */}
                        <Route path="/statistics" element={<StatisticsByTeacherPage />} />
                        <Route path="/my-courses" element={<CoursesByTeacherPage />} />
                        <Route path="/new-course" element={<NewCoursePage/>}/>
                        <Route path="/course-management/:id" element={<CourseManagementPage/>}/>
                        <Route path="/course-management/:courseId/module/:moduleId" element={<ModuleManagementPage/>}/>

                        {/*GENERAL*/}
                        <Route path="/all-courses" element={<AllCoursesPage/>}/>
                        <Route path="/course/resume/:id" element={<CoursesResume/>}/>
                        <Route path="/course/:id" element={<CourseDataAndProgressPage/>}/>

                        <Route path="/my-profile" element={<ProfilePage/>}/>
                        <Route path="/my-studies" element={<StudiesPage/>}/>
                        <Route path="/my-insignias" element={<InsigniasPage/>}/>
                        
                        {/* ADMIN */}

                        <Route path="/manage/gamification-registers" element={<GamificationRegisters/>}/>
                        <Route path="/manage/categories" element={<CategoriesPage/>}/>
                        <Route path="/manage/users" element={<UsersManagementPage/>}/>

                    </Route>
                </>
            )}

        </Routes>

    )
}
