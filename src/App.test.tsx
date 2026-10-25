import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('Elastic Home interactions', () => {
  it('uses the icon for the primary action without opening details', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Turn off Ceiling lights' }));
    expect(screen.getByRole('button', { name: 'Turn on Ceiling lights' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens accessible details from the tile surface', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Open Ceiling lights details' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: 'Ceiling lights' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close details' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('updates light brightness directly', () => {
    render(<App />);
    const slider = screen.getByRole('slider', { name: 'Ceiling lights brightness' });
    fireEvent.change(slider, { target: { value: '35' } });
    expect(slider).toHaveValue('35');
    expect(screen.getByText('35% brightness')).toBeInTheDocument();
  });

  it('expands a widget and exposes secondary media controls', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Expand Television' }));
    expect(screen.getByRole('button', { name: 'Collapse Television' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Television volume' })).toBeInTheDocument();
    expect(screen.getByTestId('device-living-tv')).toHaveClass('is-expanded');
  });

  it('configures and starts the dishwasher', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Dishwasher program' }), 'Intensive 70°');
    await user.click(screen.getByRole('button', { name: 'Start dishwasher' }));
    expect(screen.getByRole('progressbar', { name: 'Dishwasher cycle progress' })).toHaveValue(1);
    expect(screen.getByRole('button', { name: 'Stop dishwasher' })).toBeInTheDocument();
  });
});
