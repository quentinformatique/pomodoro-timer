import {FC} from "react";
import {DigitalTimer} from "./DigitalTimer.tsx";
import {IndicatorGroup} from "./ProgressIndicators/IndicatorGroup.tsx";
import {IndicatorState} from "./ProgressIndicators/IndicatorState.tsx";
import {Icon} from "../Utilities/Icon.tsx";

export const Timer : FC = () => {
    return (<>
            <div className="flex-1 flex flex-col justify-center">
                    <div className="flex flex-col gap-10 sm:gap-15 items-center justify-center border-14 border-green-dark p-10 rounded-full w-[320px] h-[320px] sm:w-[450px] sm:h-[450px]">
                        <div className="flex flex-col gap-3 sm:gap-5 items-center">
                            <DigitalTimer value={10.43}/>
                            <IndicatorGroup indicators={[IndicatorState.Completed, IndicatorState.InProgress, IndicatorState.NotStarted, IndicatorState.NotStarted]}/>
                        </div>
                        <div className="hover:cursor-pointer">
                            <Icon code="play_arrow" fill={false} className="text-5xl! sm:text-7xl!"/>
                        </div>
                    </div>
            </div>
        </>)
}