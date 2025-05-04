import {CSSProperties, FC} from "react";

type Props = {
    code: string,
    fill: boolean,
    className?: string,
}

export const Icon: FC<Props> = ({ code, fill, className }) => {
    const style: CSSProperties = {
        fontVariationSettings:
            `
                'FILL' ${fill ? 1 : 0}
            `
    };

    return (
        <span className={`material-symbols-outlined ${className}`} style={style}>
            {code}
        </span>
    )
};