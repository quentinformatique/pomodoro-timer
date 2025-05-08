import {FC} from "react";


type Props = {
    value: number
}

export const DigitalTimer : FC<Props> = ({value}) => {
    return (
        <div className="text-6xl sm:text-8xl">
            {value}
        </div>
    )
}