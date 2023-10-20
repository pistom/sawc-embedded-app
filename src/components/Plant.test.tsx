import  socket  from '../socket.ts';
jest.mock('../socket.ts', () => {
  return {
    __esModule: true,
    default: {on: jest.fn(() => 42)},
  };
});
import { render } from "@testing-library/react";
import Plant from "./Plant";

describe('<Plant></Plant>', () => {
  it('should render the component', () => {
    const { container } = render(<Plant device="device" output="output" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should call socket on message when component is rendered', () => {
    render(<Plant device="device" output="output" />);
    expect(socket.on).toHaveBeenCalledWith("message", expect.any(Function));
  });

  it('should start watering when the start button is clicked', () => {
  });

  it('should stop watering when the stop button is clicked', () => {
  });
});