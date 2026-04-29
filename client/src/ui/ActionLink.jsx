import { Link } from "@heroui/react"

const ActionLink = ({ text, link }) => {
    return (
        <Link className={"no-underline text-[10px] md:text-[15px]"} href={link}>
            <div>
                {text}
                <Link.Icon />
            </div>
        </Link>
    )
}

export default ActionLink
