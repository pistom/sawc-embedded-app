import type { Meta, StoryObj } from '@storybook/react';
import Device from "../Device";

const meta: Meta<typeof Device> = {
  title: "Components/Plant list",
  component: Device,
  decorators: [
  (Story) => (
      <div className='mx-auto max-w-7xl py-6 sm:px-6 lg:px-8'>
        <Story />
      </div>
    ),
  ]
};

export default meta;

type Story = StoryObj<typeof Device>;

export const Primary: Story = {
  name: '3 outputs',
  args: {
    device: {
      id: 'module_1',
      name: 'Living room',
      outputs: [
        {
          pin: 1,
          id: '1',
          name: 'Plant 1',
          defaultVolume: 100,
          ratio: 0.1,
          disabled: false,
          onlinePlantsIds: [],
          sync: true,
        }, 
        {
          pin: 2,
          id: '2',
          name: 'Plant 2',
          defaultVolume: 200,
          ratio: 0.1,
          disabled: false,
          onlinePlantsIds: [],
          sync: true,
        },
        {
          pin: 3,
          id: '3',
          name: 'Plant 3',
          defaultVolume: 500,
          ratio: 0.1,
          disabled: false,
          onlinePlantsIds: [],
          sync: true,
        }
      ],
      settings: {
        defaultVolume: 100,
        defaultRatio: 0.1,
        maxVolumePerOutput: 1000,
        calibrateDuration: 1000,
      },
    },
  },
};