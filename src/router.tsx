import { createBrowserRouter } from "react-router-dom";
import { Timer } from "./Views/Components/Timer/Timer";
import { Settings } from "./Views/Components/Settings/Settings";
import { Guide } from "./Views/Components/Guide/Guide";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Timer />,
    },
    {
        path: "/settings",
        element: <Settings />,
    },
    {
        path: "/guide",
        element: <Guide />,
    },
]); 