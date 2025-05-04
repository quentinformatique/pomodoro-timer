import {FC} from "react";
import {Timer} from "../Components/Timer/Timer.tsx";
import {BaseLayout} from "../Layouts/BaseLayout.tsx";

export const Home:FC = () => {
    return (
        <BaseLayout>
            <Timer />
        </BaseLayout>
    );
}