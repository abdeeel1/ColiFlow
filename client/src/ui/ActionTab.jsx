import { Tabs } from "@heroui/react"
import BadgeUi from "./BadgeUi"
import { Check } from "lucide-react"

export default function ActionTab({ expediteurData, voyageurData }) {
    return (
        <Tabs className="w-full">
            <Tabs.ListContainer className="w-full">
                <Tabs.List className="w-full flex" aria-label="Options">
                    <Tabs.Tab className="flex-1 justify-center text-center font-bold" id="overview">
                        Je suis Expéditeur
                        <Tabs.Indicator />
                    </Tabs.Tab>

                    <Tabs.Tab className="flex-1 justify-center text-center font-bold" id="reports">
                        Je suis Voyageur
                        <Tabs.Indicator />
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs.ListContainer>
            <Tabs.Panel className="py-20" id="overview">
                <div className="grid w-full grid-cols-1 lg:grid-cols-3 items-stretch justify-center gap-10">
                    {expediteurData.map((item) => (
                        <div
                            key={item.id}
                            className="card w-full shadow-sm relative overflow-hidden bg-white border border-gray-100 rounded-3xl"
                        >
                            <div
                                className="absolute top-0 right-0 h-[60%] w-[50%] bg-linear-to-br from-blue-400 to-blue-600 opacity-90 z-0 pointer-events-none"
                                style={{
                                    clipPath:
                                        "polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)",
                                    filter: "blur(1px)",
                                }}
                            ></div>

                            <div className="card-body relative z-10 p-8">
                                <BadgeUi text={item.etape} />
                                <h2 className="card-title text-2xl font-bold mt-4">
                                    {item.title}
                                </h2>
                                <p className="text-slate-600 mt-2">
                                    {item.description}
                                </p>

                                <ul className="flex flex-col gap-3 py-6">
                                    {item.feutures.map((f, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-2 items-center"
                                        >
                                            <Check
                                                size={14}
                                                className="text-slate-500"
                                            />
                                            <li className="text-[14px] text-slate-700 underline decoration-slate-200 underline-offset-4">
                                                {f}
                                            </li>
                                        </div>
                                    ))}
                                </ul>
                            </div>

                            <figure className="relative z-10 px-0 mt-auto">
                                <img
                                    src={item.picture}
                                    className="w-full object-cover rounded-t-[2rem]"
                                    alt={item.title}
                                    loading="lazy"
                                />
                            </figure>
                        </div>
                    ))}
                </div>
            </Tabs.Panel>

            <Tabs.Panel className="py-20" id="reports">
                <div className="grid max-w-full grid-cols-1 lg:grid-cols-3 items-stretch justify-between gap-10">
                    {voyageurData.map((item) => (
                        <div
                            key={item.id}
                            className="card w-full shadow-sm relative overflow-hidden bg-white border border-gray-100 rounded-3xl"
                        >
                            <div
                                className="absolute top-0 right-0 h-[60%] w-[50%] bg-linear-to-br from-blue-400 to-blue-600 opacity-90 z-0"
                                style={{
                                    clipPath:
                                        "polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)",
                                    filter: "blur(1px)",
                                }}
                            ></div>

                            <div className="card-body relative z-10 p-8">
                                <BadgeUi text={item.etape} />
                                <h2 className="card-title text-2xl font-bold mt-4">
                                    {item.title}
                                </h2>
                                <p className="text-slate-600 mt-2">
                                    {item.description}
                                </p>

                                <ul className="flex flex-col gap-3 py-6">
                                    {item.feutures.map((f, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-2 items-center"
                                        >
                                            <Check
                                                size={14}
                                                className="text-slate-500"
                                            />
                                            <li className="text-[14px] text-slate-700 underline decoration-slate-200 underline-offset-4">
                                                {f}
                                            </li>
                                        </div>
                                    ))}
                                </ul>
                            </div>

                            <figure className="relative z-10 px-0 mt-auto">
                                <img
                                    src={item.picture}
                                    className="w-full object-cover rounded-t-[2rem]"
                                    alt={item.title}
                                />
                            </figure>
                        </div>
                    ))}
                </div>
            </Tabs.Panel>
        </Tabs>
    )
}
