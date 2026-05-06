import { userEvent, within, waitFor, expect } from '@storybook/test';

export const imageCardPlay = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const body = canvasElement.ownerDocument.body;
  const canvas = within(body);
  await waitFor(() =>
    expect(canvas.queryByText('Label Text', { exact: true })).toBeVisible(),
  );
  await waitFor(() =>
    expect(canvas.queryByRole('img', { name: 'alt text' })).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      body.querySelector('div:nth-of-type(2) > div:nth-of-type(2)'),
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryByText('Card Heading Here', { exact: true }),
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryByText(
        'Use this if you have large text that you’d like to emphasise in your card. Use t',
        { exact: false },
      ),
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryByText(
        'Add additional information that isn’t very important, using sub-text',
        { exact: true },
      ),
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(canvas.queryByRole('button', { name: 'action' })).toBeVisible(),
  );
  await userEvent.click(await canvas.findByRole('button', { name: 'action' }));
};

export const imageCardTwoCtas = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const body = canvasElement.ownerDocument.body;
  const canvas = within(body);
  await waitFor(() =>
    expect(canvas.queryByText('Label Text', { exact: true })).toBeVisible(),
  );
  await waitFor(() =>
    expect(canvas.queryByRole('img', { name: 'alt text' })).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      body.querySelector('div:nth-of-type(2) > div:nth-of-type(2)'),
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryByText('Card Heading Here', { exact: true }),
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryByText(
        'Use this if you have large text that you’d like to emphasise in your card. Use t',
        { exact: false },
      ),
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryByText(
        'Add additional information that isn’t very important, using sub-text',
        { exact: true },
      ),
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

export const clickableImageCard = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement.ownerDocument.body);
  await waitFor(() =>
    expect(canvas.queryByText('Label Text', { exact: true })).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryByRole('button', {
        name: 'Card Heading Here Use this if you have .',
      }),
    ).toBeVisible(),
  );
  await userEvent.click(
    await canvas.findByRole('button', {
      name: 'Card Heading Here Use this if you have .',
    }),
  );
  await userEvent.click(
    await canvas.findByRole('button', {
      name: 'Card Heading Here Use this if you have .',
    }),
  );
};

export const clickableNoImage = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement.ownerDocument.body);
  await waitFor(() =>
    expect(canvas.queryByText('Label Text', { exact: true })).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryByRole('button', {
        name: 'Card Heading Here Use this if you have .',
      }),
    ).toBeVisible(),
  );
  await userEvent.click(
    await canvas.findByRole('button', {
      name: 'Card Heading Here Use this if you have .',
    }),
  );
  await userEvent.click(
    await canvas.findByRole('button', {
      name: 'Card Heading Here Use this if you have .',
    }),
  );
};

export const imageCardthreeCtas = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const body = canvasElement.ownerDocument.body;
  const canvas = within(body);
  await waitFor(() =>
    expect(canvas.queryByText('Label Text', { exact: true })).toBeVisible(),
  );
  await waitFor(() =>
    expect(canvas.queryByRole('img', { name: 'alt text' })).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryByText('Card Heading Here', { exact: true }),
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      body.querySelector('div:nth-of-type(2) > div:nth-of-type(2)'),
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryByText(
        'Use this if you have large text that you’d like to emphasise in your card. Use t',
        { exact: false },
      ),
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryByText(
        'Add additional information that isn’t very important, using sub-text',
        { exact: true },
      ),
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
  await waitFor(() =>
    expect(
      canvas.queryAllByRole('button', { name: 'action' })[2],
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByRole('button', { name: 'action' })[0],
    ).toBeEnabled(),
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByRole('button', { name: 'action' })[1],
    ).toBeEnabled(),
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByRole('button', { name: 'action' })[2],
    ).toBeEnabled(),
  );
  await userEvent.click(
    (await canvas.findAllByRole('button', { name: 'action' }))[0],
  );
  await userEvent.click(
    (await canvas.findAllByRole('button', { name: 'action' }))[1],
  );
  await userEvent.click(
    (await canvas.findAllByRole('button', { name: 'action' }))[2],
  );
};
