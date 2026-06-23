import { describe, it, expect } from "vitest"
import { cn } from "./utils"

describe("cn() class merger", () => {
    it("joins multiple class names", () => {
        expect(cn("px-2", "text-white")).toBe("px-2 text-white")
    })

    it("ignores falsy values", () => {
        expect(cn("px-2", false, null, undefined, "text-white")).toBe(
            "px-2 text-white",
        )
    })

    it("lets the last conflicting Tailwind utility win", () => {
        // tailwind-merge should drop the earlier px-2 in favour of px-4
        expect(cn("px-2", "px-4")).toBe("px-4")
    })

    it("supports conditional (object) syntax", () => {
        expect(cn("base", { active: true, hidden: false })).toBe("base active")
    })
})
