import {FC} from "react";
import {Icon} from "../Utilities/Icon.tsx";

export const Header : FC = () => {
    return (<>
            <header className="flex-none flex">
                <div className="flex mt-8">
                    <div className="flex gap-14">
                        <div className="hidden sm:block">
                            <Icon code="schedule" fill={false} className="text-3xl! sm:text-4xl! md:text-5xl!"/>
                        </div>
                        <p className="text-3xl md:text-4xl lg:text-5xl">
                            Pomodoro Timer
                        </p>
                    </div>
                </div>
                <div className="fixed top-9 right-4 sm:right-9 hover:cursor-pointer">
                    <Icon code="settings" fill={false} className="text-3xl! sm:text-4xl! md:text-5xl! lg:text-6xl!"/>
                </div>
            </header>
        </>)
}