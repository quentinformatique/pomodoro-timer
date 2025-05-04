import {FC} from "react";
import {Icon} from "../Utilities/Icon.tsx";

export const Header : FC = () => {
    return (<>
            <header className="flex-none flex">
                <div className="flex">
                    <Icon code="schedule" fill={false} />
                    <h1>
                        Pomodoro Timer
                    </h1>
                </div>
                <div className="fixed top-6 right-6 ">
                    <Icon code="settings" fill={false} className="text-5xl!"/>
                </div>
            </header>
        </>)
}