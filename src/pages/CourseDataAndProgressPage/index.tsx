import { useParams } from "react-router-dom";

const CourseDataAndProgressPage: React.FC = () => {

    const {id} = useParams();

    return (
        <>
        <h1>{id}</h1>
        </>
    )
};

export default CourseDataAndProgressPage;