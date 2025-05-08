import {FC} from "react";
import {IndicatorState} from "./IndicatorState.tsx";

type Props = {
    state: IndicatorState
}

export const Indicator : FC<Props> = ({state}) => {

    const colors = {
        0: "bg-green-light w-6 h-6",
        1: "bg-green-light w-11 h-6",
        2: "bg-green-dark  w-6 h-6",
    };

    return (<>
        <div className={`rounded-full ${colors[state]}`}></div>
    </>)
}