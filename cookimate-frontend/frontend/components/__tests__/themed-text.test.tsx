import React from "react";
import { render } from "@testing-library/react-native";
import { ThemedText } from "../themed-text";

describe("ThemedText Component", () => {
    test("renders correctly", () => {
        const { getByText } = render(<ThemedText>Hello</ThemedText>);
        expect(getByText("Hello")).toBeTruthy();
    });
});
