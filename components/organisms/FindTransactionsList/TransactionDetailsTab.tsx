'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import JournyForm from 'components/common/JournyForm';
import { useForm } from 'react-hook-form';
import { Icon } from '@atoms/index';
import styles from './TransactionDetails.module.scss';
import { useSelector } from 'react-redux';
import { buildCollectionFields, buildInstructionDetailsFields, buildPayFromFields, buildPaymentFields, buildPaymentScheduleFields, buildTransferFields } from 'src/utils/Transaction';
import { Box, Typography } from '@mui/material';
import TransactionDetailsBatch from './TransactionDetailsBatch';
import { useSearchParams } from 'next/navigation';

const TransactionDetailsTab = () => {
  const t = useTranslations('findTransaction');
  const searchParams = useSearchParams();
  const transactionType = searchParams?.get('transactionType');
  const transactionDetails = useSelector((state: RootState) => state.transactionDetails); 
  let paymentFields, transferFields, collectionFields, instructionsFields, payFromFields, scheduleFields;

  paymentFields = useMemo(() => buildPaymentFields(t, transactionDetails), [t, transactionDetails]);
  transferFields = useMemo(() => buildTransferFields(t, transactionDetails), [t, transactionDetails]);
  collectionFields = useMemo(() => buildCollectionFields(t, transactionDetails), [t, transactionDetails]);
  instructionsFields = useMemo(() => buildInstructionDetailsFields(t, transactionDetails), [t, transactionDetails]);
  payFromFields = useMemo(() => buildPayFromFields(t, transactionDetails), [t, transactionDetails]);
  scheduleFields = useMemo(() => buildPaymentScheduleFields(t, transactionDetails), [t, transactionDetails]);

  const detailsDefaultValues = {} as const;

  const methodsDetails = useForm({ mode: 'onTouched', defaultValues: detailsDefaultValues });
  const detailsValues = methodsDetails.getValues();

  const applyOverrides = (fieldsArr: any[], overrides: Record<string, any>) =>
    fieldsArr?.map((f: any) => {
      const nf: any = { ...f };
      if (f.type === 'multiChip') {
        const tname = f.multiTargetFieldName || f.name;
        const raw = overrides?.[tname];
        if (Array.isArray(raw)) nf.multiSelectedValues = raw;
        else if (typeof raw === 'string')
          nf.multiSelectedValues = raw.split(',').map((s: string) => s.trim()).filter(Boolean);
        return nf;
      }
      if (Object.prototype.hasOwnProperty.call(overrides || {}, f.name)) nf.value = overrides[f.name];
      if (f.type === 'amount') {
        const currencyName = f.amountCurrencyTargetName || `${f.name}Currency`;
        if (Object.prototype.hasOwnProperty.call(overrides || {}, currencyName))
          nf.amountCurrency = overrides[currencyName];
      }
      return nf;
    });

  const paymentFieldsOv = applyOverrides(paymentFields as any[], detailsValues as any);
  const transferFieldsOv = applyOverrides(transferFields as any[], detailsValues as any);
  const collectionFieldsOv = applyOverrides(collectionFields as any[], detailsValues as any);
  const instructionsFieldsOv = applyOverrides(instructionsFields as any[], detailsValues as any);
  const payFromFieldsOv = applyOverrides(payFromFields as any[], detailsValues as any);
  const scheduleFieldsOv = applyOverrides(scheduleFields as any[], detailsValues as any);
  let transactionFieldsOv = paymentFieldsOv;
  if (transactionType === 'collection') {
    transactionFieldsOv = collectionFieldsOv;
  } else if (transactionType === 'transfer') {
    transactionFieldsOv = transferFieldsOv;
  }

  return (
    <section className={styles.container}>
      <JournyForm
        onChange={() => {}}
        mode="review"
        ShowActionBtns={false}
        renderWithRHF
        formMethods={methodsDetails}
        syncOnChange={false}
        sections={[
          {
            title: t('paymentBatchTitle'),
            titleIconEelement: (
              <Icon name="notes" width="20" height="20" bgColor="#222E37" />
            ),
            fields: transactionFieldsOv as any,
            readOnly: true,
          },
        ]}
      />

      <JournyForm
        onChange={() => {}}
        mode="review"
        ShowActionBtns={false}
        renderWithRHF
        formMethods={methodsDetails}
        syncOnChange={false}
        sections={[
          {
            title: t('instructionDetailsTitle'),
            titleIconEelement: (
              <Icon name="locator" width="24" height="24" bgColor="#222E37" />
            ),
            fields: instructionsFieldsOv as any,
            readOnly: true,
          },
        ]}
      />
      <section className={styles.transferBatchContainer}>
        <JournyForm
          onChange={() => {}}
          mode="review"
          ShowActionBtns={false}
          renderWithRHF
          formMethods={methodsDetails}
          syncOnChange={false}
          sections={[
            {
              title: t('payFromTitle'),
              titleIconEelement: (
                <Icon name="mailBox" width="20" height="20" bgColor="#222E37" />
              ),
              fields: payFromFieldsOv as any,
              readOnly: true,
            },
          ]}
        />

        <Box className={styles.transferToSection}>
          <Box className={styles.transferToHeader}>
            <Icon name="transfer" width="20" height="20" bgColor="#222E37" />
            <Typography variant="h6">{t('transferToTitle')}</Typography>
          </Box>
          <TransactionDetailsBatch edit={false} />
        </Box>
        <JournyForm
          onChange={() => {}}
          mode="review"
          ShowActionBtns={false}
          renderWithRHF
          formMethods={methodsDetails}
          syncOnChange={false}
          sections={[
            {
              title: t('paymentScheduleTitle'),
              titleIconEelement: (
                <Icon name="mailBox" width="20" height="20" bgColor="#222E37" />
              ),
              fields: scheduleFieldsOv as any,
              readOnly: true,
            },
          ]}
        />
      </section>
    </section>
  );
};

export default TransactionDetailsTab;