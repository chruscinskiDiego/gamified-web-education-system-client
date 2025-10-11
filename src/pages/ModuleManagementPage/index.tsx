import { useParams } from "react-router-dom";

const ModuleManagementPage: React.FC = () => {


    const { courseId, moduleId } = useParams();

    return (

        <>
            <div>
                MANAGEMENTPAGE
            </div>

            <h1>Curso: {courseId}</h1>
            <h1>Módulo: {moduleId}</h1>

        </>
    );

};

export default ModuleManagementPage;