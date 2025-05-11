import {FC, ReactNode} from "react";
import {Header} from "../Components/Header/Header.tsx";
import {Footer} from "../Components/Footer/Footer.tsx";

type props =  {
    children: ReactNode;
}

export const BaseLayout:FC<props> = ({children}) => {
    return (
        <div className="bg-gray text-green-light w-screen fixed inset-0 flex flex-col space items-center overflow-hidden cursor-default select-none">
            <Header/>
            {children}
            <Footer/>
        </div>
    );
}