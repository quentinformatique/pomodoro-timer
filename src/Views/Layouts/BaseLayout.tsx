import {FC, ReactNode} from "react";
import {Header} from "../Components/Header/Header.tsx";
import {Footer} from "../Components/Footer/Footer.tsx";

type props =  {
    children: ReactNode;
}

export const BaseLayout:FC<props> = ({children}) => {
    return (
        <div className="bg-gray text-green-light w-screen h-screen flex flex-col items-center overflow-hidden cursor-default">
            <Header/>
            {children}
            <Footer/>
        </div>
    );
}