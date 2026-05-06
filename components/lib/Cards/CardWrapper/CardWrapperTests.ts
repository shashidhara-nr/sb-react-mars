import { within, waitFor, expect, userEvent } from '@storybook/test';

export const imageCardsPlay = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement.ownerDocument.body);

  for (let i = 0; i < 4; i++) {
    await waitFor(() =>
      expect(
        canvas.queryAllByText('label 2', { exact: true })[i],
      ).toBeVisible(),
    );
    await waitFor(() =>
      expect(
        canvas.queryAllByRole('img', { name: 'alt text' })[i],
      ).toBeVisible(),
    );
    await waitFor(() =>
      expect(
        canvas.queryAllByText('header 2', { exact: true })[i],
      ).toBeVisible(),
    );
    await waitFor(() =>
      expect(
        canvas.queryAllByText(
          'Use this if you have large text that you’d like to emphasise in your card. Use t',
          { exact: false },
        )[i],
      ).toBeVisible(),
    );
    await waitFor(() =>
      expect(
        canvas.queryAllByRole('button', { name: 'action' })[i],
      ).toBeVisible(),
    );
    await userEvent.click(
      (await canvas.findAllByRole('button', { name: 'action' }))[i],
    );
  }
};

export const stepsCardsPlay = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const body = canvasElement.ownerDocument.body;
  const canvas = within(body);
  await waitFor(() =>
    expect(
      body.querySelector(
        'div:nth-of-type(1) > div > div > div:nth-of-type(1) > div:nth-of-type(1)',
      ),
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      body.querySelector('div:nth-of-type(1) > div > svg > path'),
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(canvas.queryAllByText('Step #', { exact: true })[0]).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByText(
        'Keep me short and sweet. Try not go beyond 4 lines of copy. You’ll need to adjus',
        { exact: false },
      )[0],
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      body.querySelector('div:nth-of-type(1) > div > div:nth-of-type(2) > div'),
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(body.querySelector('div:nth-of-type(2) svg')).toBeVisible(),
  );
  await waitFor(() =>
    expect(canvas.queryAllByText('Step #', { exact: true })[1]).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByText(
        'Keep me short and sweet. Try not go beyond 4 lines of copy. You’ll need to adjus',
        { exact: false },
      )[1],
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(body.querySelector('div > div:nth-of-type(3) > div')).toBeVisible(),
  );
  await waitFor(() =>
    expect(body.querySelector('div:nth-of-type(3) path')).toBeVisible(),
  );
  await waitFor(() =>
    expect(canvas.queryAllByText('Step #', { exact: true })[2]).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByText(
        'Keep me short and sweet. Try not go beyond 4 lines of copy. You’ll need to adjus',
        { exact: false },
      )[2],
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(body.querySelector('div:nth-of-type(4) svg')).toBeVisible(),
  );
  await waitFor(() =>
    expect(canvas.queryAllByText('Step #', { exact: true })[3]).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByText(
        'Keep me short and sweet. Try not go beyond 4 lines of copy. You’ll need to adjus',
        { exact: false },
      )[3],
    ).toBeVisible(),
  );
};

export const imageClickablePlay = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement.ownerDocument.body);
  await waitFor(() =>
    expect(canvas.queryAllByText('label 2', { exact: true })[0]).toBeVisible(),
  );
  await userEvent.click(
    (
      await canvas.findAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })
    )[0],
  );
  await userEvent.click(
    (
      await canvas.findAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })
    )[0],
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })[0],
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(canvas.queryAllByText('label 2', { exact: true })[1]).toBeVisible(),
  );
  await userEvent.click(
    (
      await canvas.findAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })
    )[1],
  );
  await userEvent.click(
    (
      await canvas.findAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })
    )[1],
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })[1],
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(canvas.queryAllByText('label 2', { exact: true })[2]).toBeVisible(),
  );
  await userEvent.dblClick(
    (
      await canvas.findAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })
    )[2],
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })[2],
    ).toBeVisible(),
  );
  await waitFor(() =>
    expect(canvas.queryAllByText('label 2', { exact: true })[3]).toBeVisible(),
  );
  await userEvent.click(
    (
      await canvas.findAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })
    )[3],
  );
  await userEvent.click(
    (
      await canvas.findAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })
    )[3],
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })[3],
    ).toBeVisible(),
  );
};

export const clickableNoImage = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement.ownerDocument.body);
  await waitFor(() =>
    expect(canvas.queryAllByText('label 2', { exact: true })[0]).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })[0],
    ).toBeVisible(),
  );
  await userEvent.click(
    (
      await canvas.findAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })
    )[0],
  );
  await userEvent.click(
    (
      await canvas.findAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })
    )[0],
  );
  await waitFor(() =>
    expect(canvas.queryAllByText('label 2', { exact: true })[1]).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })[1],
    ).toBeVisible(),
  );
  await userEvent.click(
    (
      await canvas.findAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })
    )[1],
  );
  await userEvent.click(
    (
      await canvas.findAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })
    )[1],
  );
  await waitFor(() =>
    expect(canvas.queryAllByText('label 2', { exact: true })[2]).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })[2],
    ).toBeVisible(),
  );
  await userEvent.click(
    (
      await canvas.findAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })
    )[2],
  );
  await userEvent.click(
    (
      await canvas.findAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })
    )[2],
  );
  await waitFor(() =>
    expect(canvas.queryAllByText('label 2', { exact: true })[3]).toBeVisible(),
  );
  await waitFor(() =>
    expect(
      canvas.queryAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })[3],
    ).toBeVisible(),
  );
  await userEvent.click(
    (
      await canvas.findAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })
    )[3],
  );
  await userEvent.click(
    (
      await canvas.findAllByRole('button', {
        name: 'header 2 Use this if you have large text that you’d like to emphasise in your card. Use this as an alternative to the standard heading size, should the card require greater affordance.',
      })
    )[3],
  );
};
