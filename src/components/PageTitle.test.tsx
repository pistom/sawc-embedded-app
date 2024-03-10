import '@testing-library/jest-dom'
import { render } from "@testing-library/react";
import PageTitle from "./PageTitle";

describe("<PageTitle />", () => {
  it("should render the component with the provided title", () => {
    const title = "Test Title";
    const { getByText } = render(<PageTitle title={title} />);
    const pageTitle = getByText(title);
    expect(pageTitle).toBeInTheDocument();
  });

  it("should render the component with the correct HTML structure", () => {
    const title = "Test Title";
    const { container } = render(<PageTitle title={title} />);
    const headerElement = container.querySelector("header");
    const titleElement = container.querySelector(".text-3xl");
    expect(headerElement).toBeInTheDocument();
    expect(titleElement).toBeInTheDocument();
  });
});