import { describe, it, expect } from "vitest"
import en from "../../public/locales/en/translation.json"
import ar from "../../public/locales/ar/translation.json"

describe("i18n translation resources", () => {
    it("English and Arabic expose exactly the same keys", () => {
        // If a key is added to one locale but forgotten in the other, this fails.
        expect(Object.keys(en).sort()).toEqual(Object.keys(ar).sort())
    })

    it("translates the home page keys in both locales", () => {
        const keys = [
            "Comment ça marche ?",
            "Questions fréquentes",
            "Une interface intuitive pour tous",
            "Voir la Démo",
        ]

        for (const key of keys) {
            expect(en[key]).toBeTruthy()
            expect(ar[key]).toBeTruthy()
            // A real translation differs from the French source key.
            expect(en[key]).not.toBe(key)
            expect(ar[key]).not.toBe(key)
        }
    })

    it("has no empty string translations at the top level", () => {
        for (const [key, value] of Object.entries(en)) {
            if (typeof value === "string") {
                expect(value.trim(), `EN "${key}" is empty`).not.toBe("")
            }
        }
    })
})
