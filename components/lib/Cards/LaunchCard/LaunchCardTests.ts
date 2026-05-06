import { userEvent, within, waitFor, expect } from '@storybook/test';

export const launchCard = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const body = canvasElement.ownerDocument.body;
  const canvas = within(body);
  await waitFor(() =>
    expect(body.querySelector('#storybook-root > div > div')).toBeVisible(),
  );
  await waitFor(() =>
    expect(body.querySelector('g > path:nth-of-type(1)')).toBeVisible(),
  );
  await waitFor(() =>
    expect(canvas.queryByRole('heading', { name: 'Spotify' })).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryByRole('link', { name: 'Paragraph text' }),
    ).toBeVisible(),
  );
  await waitFor(() => expect(canvas.queryByRole('button')).toBeVisible());
  await userEvent.click(await canvas.findByRole('button'));
};

export const launchCardLarge = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const body = canvasElement.ownerDocument.body;
  const canvas = within(body);
  await waitFor(() =>
    expect(body.querySelector('#storybook-root > div > div')).toBeVisible(),
  );
  await waitFor(() =>
    expect(body.querySelector('g > path:nth-of-type(1)')).toBeVisible(),
  );
  await waitFor(() =>
    expect(canvas.queryByRole('heading', { name: 'Spotify' })).toBeVisible(),
  );
  await waitFor(() =>
    expect(canvas.queryByText('Paragraph text', { exact: true })).toBeVisible(),
  );
  await waitFor(() =>
    expect(canvas.queryByText('Sub text', { exact: true })).toBeVisible(),
  );
  await waitFor(() => expect(canvas.queryAllByRole('button')[0]).toBeVisible());
  await userEvent.click((await canvas.findAllByRole('button'))[0]);
  await waitFor(() =>
    expect(
      canvas.queryByText(
        'Netflix is a streaming service that offers a wide variety of award-winning TV sh',
        { exact: false },
      ),
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryByText('Watch anywhere. Cancel anytime.', { exact: true }),
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByRole('button', { name: 'action' })[0],
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByRole('button', { name: 'action' })[1],
    ).toBeVisible(),
  );
  await userEvent.click(
    (await canvas.findAllByRole('button', { name: 'action' }))[0],
  );
  await userEvent.click(
    (await canvas.findAllByRole('button', { name: 'action' }))[1],
  );
};
