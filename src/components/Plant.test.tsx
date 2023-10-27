import  socket  from '../socket.ts';
import { MemoryRouter } from 'react-router-dom';

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
    const output = { id: "output", name: "test", image: "test", defaultVolume: 5, pin: 3};
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Plant deviceDefaultVolume={50} device="device" output={output} />
      </MemoryRouter>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should call socket on message when component is rendered', () => {
    const output = { id: "output", name: "test", image: "test", defaultVolume: 5, pin: 3};
    render(
      <MemoryRouter initialEntries={['/']}>
        <Plant deviceDefaultVolume={100} device="device" output={output} />
      </MemoryRouter>
    );
    expect(socket.on).toHaveBeenCalledWith("message", expect.any(Function));
  });

  it('should start watering when the start button is clicked', () => {
  });

  it('should stop watering when the stop button is clicked', () => {
  });
});