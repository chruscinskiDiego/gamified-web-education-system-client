import { useEffect, useState } from "react";
import { api } from "../../lib/axios";

const CategoriesPage: React.FC = () => {

    const [categories, setCategories] = useState();

    const getCategories = async () => {

        const response = await api.get("/category/view-all");

        if (response.status === 200) {

            setCategories(response.data);

        }

    }

    useEffect(() => {

        getCategories();

    }, []);

    console.log('Categories: ' + JSON.stringify(categories));

    return (

        <>
            <h1>categories</h1>
        </>

    )

}

export default CategoriesPage;