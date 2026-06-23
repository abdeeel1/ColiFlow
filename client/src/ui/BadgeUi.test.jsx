import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import BadgeUi from "./BadgeUi"

describe("<BadgeUi />", () => {
    it("renders the text passed via props", () => {
        render(<BadgeUi text="étape 1" />)
        expect(screen.getByText("étape 1")).toBeInTheDocument()
    })

    it("renders different text for different props", () => {
        render(<BadgeUi text="étape 2" />)
        expect(screen.getByText("étape 2")).toBeInTheDocument()
        expect(screen.queryByText("étape 1")).not.toBeInTheDocument()
    })
})
