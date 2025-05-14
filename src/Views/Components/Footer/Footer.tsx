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
                        { /* Github link */}
                        <a href="https://github.com/quentinformatique" 
                           target="_blank" rel="noopener noreferrer"
                           className="hover:cursor-pointer text-center flex items-center transition-colors rounded-lg hover:bg-green-dark/20 p-1 text-sm sm:text-xl">
                            ©2025 COSTES Quentin
                        </a>
                        { /* Repository link */}
                        <span className="text-sm sm:text-xl">|</span>
                        <a href="https://github.com/quentinformatique/pomodoro-timer" 
                           target="_blank" rel="noopener noreferrer"
                           className="hover:cursor-pointer flex items-center transition-colors rounded-lg hover:bg-green-dark/20 p-1">
                            <Icon code="folder_code" fill={false} className="text-md" />
                        </a>
                        { /* Guide link */}
                        <span className="text-sm sm:text-xl">|</span>
                        <button
                            onClick={() => navigate("/guide")}
                            className="flex items-center gap-2 text-green-light hover:text-green-light p-1 transition-colors rounded-lg hover:bg-green-dark/20">
                            <Icon code="help_outline" fill={false} className="text-xl" />
                            <span className="text-sm sm:text-xl">Guide</span>
                        </button>
                    </div>
                </div>
            </footer>
        </>)
}