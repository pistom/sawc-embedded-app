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
    const device = { id: "device", name: "test", outputs: [output], settings: { maxVolumePerOutput: 100, defaultVolume: 100, defaultRatio: 2, calibrateDuration: 2 }};
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Plant device={device} output={output} displayErrors={() => {}} />
      </MemoryRouter>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should start watering when the start button is clicked', () => {
  });

  it('should stop watering when the stop button is clicked', () => {
  });
});