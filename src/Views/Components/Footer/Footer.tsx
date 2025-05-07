import {FC} from "react";


export const Footer : FC = () => {
    return (<>
            <footer className="flex-none w-full">
                <div className="h-14 bg-[url('/src/assets/wave.svg')] bg-cover bg-no-repeat bg-center">

                </div>
                <div className="bg-light-gray  p-5">
                    <p className="text-center text-xl">
                        @2025 Quentinformatique
                    </p>
                </div>
            </footer>
        </>)
}