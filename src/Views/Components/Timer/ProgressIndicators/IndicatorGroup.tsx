import {FC} from "react";
import {Indicator} from "./Indicator.tsx";
import {IndicatorState} from "./IndicatorState.tsx";

type Props = {
    indicators: IndicatorList;
}
type IndicatorList = [IndicatorState, IndicatorState, IndicatorState, IndicatorState];

export const IndicatorGroup : FC<Props> = ({indicators}) => {
    return (<>
        <div className="flex gap-2">
            {indicators.map((indicator) => (
                <Indicator state={indicator}/>
            ))}
        </div>
    </>)
}