import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../Utilities/Icon";


export const Footer : FC = () => {
    const navigate = useNavigate();
    return (<>
            <footer className="flex-none w-full">
                <div className="h-14 bg-[url('/src/assets/wave.svg')] bg-cover bg-no-repeat bg-center" />
                <div className="flex w-full justify-center items-center">
                    <div className="bg-light-gray p-5 flex justify-center items-center w-full gap-4">
                        <p className="text-sm sm:text-xl">
                            ©2025 Quentinformatique
                        </p>
                        <button
                            onClick={() => navigate("/guide")}
                            className="flex items-center gap-2 text-green-light/70 hover:text-green-light transition-colors rounded-lg hover:bg-green-dark/20">
                            <Icon code="help_outline" fill={false} className="text-xl" />
                            <span className="text-sm sm:text-xl">Guide</span>
                        </button>
                    </div>
                </div>
            </footer>
        </>)
}