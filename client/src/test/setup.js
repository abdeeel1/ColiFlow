// Adds custom jest-dom matchers (toBeInTheDocument, toHaveTextContent, …)
// and cleans up the DOM between tests automatically.
import "@testing-library/jest-dom"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

afterEach(() => {
    cleanup()
})
