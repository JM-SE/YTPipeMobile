import { render, screen } from '@testing-library/react-native';
import { ScreenShell } from '../components/ScreenShell';

describe('Phase 0 app shell', () => {
  it('renders a placeholder screen shell', async () => {
    render(<ScreenShell title="YTPipe Mobile" subtitle="Phase 0 smoke test" />);

    expect(await screen.findByText('YTPipe Mobile')).toBeTruthy();
    expect(await screen.findByText('Phase 0 smoke test')).toBeTruthy();
  });
});
