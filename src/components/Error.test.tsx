import '@testing-library/jest-dom'
import ErrorComponent from "./Error";
import { render } from '@testing-library/react';

describe('<Error />', () => {

  it('should render the error message', () => {
    const error = new Error('Test error');
    const { getByText } = render(<ErrorComponent error={error} />);
    const errorMessage = getByText('Test error');
    expect(errorMessage).toBeInTheDocument();
  });

  it('should render the home page link', () => {
    const error = new Error('Test error');
    const { getByText } = render(<ErrorComponent error={error} />);
    const homePageLink = getByText('Home page');
    expect(homePageLink).toBeInTheDocument();
    expect(homePageLink).toHaveAttribute('href', '/');
  });
});