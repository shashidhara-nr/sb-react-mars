import React,{useEffect,useState,useMemo} from 'react';
import { Box, Typography, Avatar, TextField } from '@mui/material';
import { Button } from 'dist/standard-bank-react';
import type { AuditApproveEventRow, AuditApproveMode, RawBeneficiaryAuditEvent } from 'src/utils/auditandapprove';
import { transformRawBeneficiaryAuditEvent } from 'src/utils/auditandapprove';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { buildTestId } from 'src/utils/testIds';
import {
  IcnAccountTile,
  IcnBranch,
  IcnCardQuestion,
  UserAccountNon,
  IconChevronUp,
  IconChevronDown,
  IcnPeopleProfileBlack,
  IcnAccountTileBlue,
  IcnDislikeBlue,
  IcnCheckmarkBlue,
  CloseBlue,
  AvatarAlert,
  AvatarQuestion,
  IcnFormFill
} from 'lib/icons';

import CreateJournyForm, { type CommanField } from 'components/common/CreateJournyForm';
import {
  buildAddressFieldsDebtor,
  buildCollectionFieldsDebtor,
  buildPersonalFieldsDebtorExtended,
  buildBankFieldsDebtorExtended,
} from 'src/utils/DebtorsField';
import {
  buildPersonalFieldsBopThirdParty,
  buildAddressFieldsBopThirdParty,
  buildPostalAddressFieldsBopThirdParty,
  buildPhoneEmailFieldsBopThirdParty,
  buildEntityDetailsFields,
  buildEntityPhoneEmailFields,
} from 'src/utils/BopThirdPartiesField';
import { buildUnpaidOptionDetailsFields } from 'src/utils/UnpaidOptionsField';
import PaymentTypeDetails from '@molecules/PaymentTypeForm/PaymentTypeDetails';
import AuditorsPanel from './AuditorsPanel';
import {
  type CollectionTypeFormState,
  type PaymentTypeFormState,
  FileUploadOptions,
  type FileUploadOptionsState,
  StatementReferencingOptions,
  type StatementReferencingState,
  HostToHostOptions,
  type HostToHostOptionsState,
  UnpaidProcessingOptions,
  type UnpaidProcessingState,
  CollectionModelOptions,
  type CollectionModelState,
  CustomerAgreement,
} from 'components/molecules';
import CollectionTypeDetails from '@molecules/CollectionTypeForm/CollectionTypeDetails';
import TransferTypeDetails from '@molecules/TransferTypeForm/TransferTypeDetails';
import { BillsField } from 'src/utils/BillsField';
import DocumentIcon from 'public/icons/icn_document_up.svg';
import PaymentIcon from 'public/icons/icn_card_question.svg';
import ListIcon from 'public/icons/icn_view_list.svg';
import IcnBellBell from 'public/icons/icn_bell_bell.svg';
import styles from "./styles.module.scss";
import ConfirmationDialog from './ConfirmationDialog';
import {
  EVENT_TYPES,
  EVENT_FUNCTIONS,
  DEFAULTS,
  FILE_UPLOAD_DEFAULTS,
  HOST_TO_HOST_DEFAULTS,
  UNPAID_PROCESSING_DEFAULTS,
  COLLECTION_MODEL_DEFAULTS,
  UNPAID_OPTION_DEFAULTS,
  PLACEHOLDERS,
  ACCOUNT_IDS,
  DEFAULT_STATEMENT_REFERENCES,
  BIC_PLACEHOLDER,
  AUDIT_STATUS_MAPPING_FOR_PAYLOAD,
  APPROVE_STATUS_MAPPING_FOR_PAYLOAD,
  type PanelMode,
} from './constants';
 
export interface NonTransactionalDetailPanelProps {
  open: boolean;
  row: AuditApproveEventRow | RawBeneficiaryAuditEvent | null;
  mode: AuditApproveMode;
  onClose: () => void;
  currentIndex?: number;
  totalRecords?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onAuditSuccess?: (entityKey: number | string | null, entityStatus: string, entityType: string) => void;
  onDeclineSuccess?: (entityKey: number | string | null, entityStatus: string, entityType: string) => void;
  testIdPrefix?: string;
}


const getLastSegment = (value: string) =>
  value.substring(value.lastIndexOf('.') + 1);

const NonTransactionalDetailPanel: React.FC<NonTransactionalDetailPanelProps> = ({
  open,
  row: rawRow,
  mode,
  onClose,
  currentIndex,
  totalRecords,
  onPrev,
  onNext,
  onAuditSuccess,
  onDeclineSuccess,
  testIdPrefix = 'non-transactional-detail-panel',
}) => {
  const t = useTranslations('nonTransactionalAuditApprove');
  const translateLang = useTranslations('debtorsHubData');
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState<boolean>(false);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState<boolean>(false);
  const [declineReason, setDeclineReason] = useState<string>('');
  const [declineError, setDeclineError] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<PanelMode>('details');
  const [showUpdateDetails, setShowUpdateDetails] = useState<boolean>(true);
  const [entityKey, setEntityKey] = useState<number | string | null>(null);
  const [entityStatus, setEntityStatus] = useState<string>('');
  const [entityType, setEntityType] = useState<string>('');

  const row = useMemo<AuditApproveEventRow | null>(() => {
    if (!rawRow) return null;
    const isRawFormat = 'auditEventId' in rawRow && 'auditRecordListTO' in rawRow;
    if (isRawFormat) {
      const rawData = rawRow as RawBeneficiaryAuditEvent;
      return transformRawBeneficiaryAuditEvent(rawData, mode);
    }
    return rawRow as AuditApproveEventRow;
  }, [rawRow, mode]);

  useEffect(() => {
    if (!rawRow) return;
    const isRawFormat = (rawRow as any).details && 'entityKey' in (rawRow as any).details;
    if (isRawFormat) {
      const rawData = rawRow as RawBeneficiaryAuditEvent;
      let entityTypeValue = getLastSegment((rawData as any).details.entityType);
      const actionKey=(rawData as any).details.action;
      setEntityKey((rawData as any).details.entityKey);
      if (mode === 'audit') {
        setEntityStatus(AUDIT_STATUS_MAPPING_FOR_PAYLOAD[entityTypeValue]?.[actionKey] || 'C');
      } else {
        setEntityStatus(APPROVE_STATUS_MAPPING_FOR_PAYLOAD[entityTypeValue]?.[actionKey] || 'U');
      }
      setEntityType(entityTypeValue);
    }
  }, [rawRow, mode]);

  useEffect(() => {
    if (!open) {
      setActiveView('details');
    }
  }, [open]);

  useEffect(() => {
    setActiveView('details');
  }, [row?.id]);


  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [open]);

  if (!row) return null;

  const primaryActionLabel = mode === 'audit' ? t('audit') : t('approve');
  const index = typeof currentIndex === 'number' && currentIndex >= 0 ? currentIndex : 0;
  const total = typeof totalRecords === 'number' && totalRecords > 0 ? totalRecords : 0;
  const atFirst = index <= 0;
  const atLast = total > 0 ? index >= total - 1 : true;

  const isUpdateFlow = (row.eventFunction || '').trim().toLowerCase() === EVENT_FUNCTIONS.UPDATE;
  const details = row.details || {};
  const updateSummary: string[] = (details as any).updateSummary || [];

  const debtorData = (details as any).debtor || {
    counterPartyName: row.entityName,
    counterPartyReference: PLACEHOLDERS.DEBTOR_REF,
    counterPartyAddress: {
      addressLine1: PLACEHOLDERS.ADDRESS_LINE_1,
      addressLine2: PLACEHOLDERS.ADDRESS_LINE_2,
      countryCode: DEFAULTS.COUNTRY_CODE,
    },
    financialInstitutionName: PLACEHOLDERS.BANK_NAME,
    branchName: PLACEHOLDERS.BRANCH_NAME,
    bic: PLACEHOLDERS.BIC,
    branchSortCode: PLACEHOLDERS.BRANCH_SORT_CODE,
    bankCountryCode: DEFAULTS.COUNTRY_CODE,
    accountNumber: PLACEHOLDERS.ACCOUNT_NUMBER,
    iban: PLACEHOLDERS.IBAN,
    currency: DEFAULTS.CURRENCY,
    transactionLimit: DEFAULTS.TRANSACTION_LIMIT,
    transactionLimitCurrency: DEFAULTS.CURRENCY,
    accountType: DEFAULTS.ACCOUNT_TYPE,
    collections: [PLACEHOLDERS.COLLECTION_TYPE_1],
  };

  const debtorFields = buildPersonalFieldsDebtorExtended(debtorData,translateLang);
  const addressFields = buildAddressFieldsDebtor(debtorData,translateLang);
  const bankFields = buildBankFieldsDebtorExtended(debtorData,translateLang,[],false);
  const collectionFields = buildCollectionFieldsDebtor(debtorData,translateLang);

  const unpaidOptionData = (details as any).unpaidOption || {
    unpaidOptionName: row.entityName,
    postingOption: UNPAID_OPTION_DEFAULTS.POSTING_OPTION,
    postingAccount: UNPAID_OPTION_DEFAULTS.POSTING_ACCOUNT,
    selectedNominatedAccount: UNPAID_OPTION_DEFAULTS.SELECTED_NOMINATED_ACCOUNT,
  };

  const bopThirdParty = (details as any).bopThirdParty || {
    thirdPartyName: row.entityName,
    entityType: DEFAULTS.ENTITY_TYPE,
    hasPostalAddress: false,
  };

  const bopEntityTypeRaw = (bopThirdParty as any).entityType || 'Individual';
  const bopEntityType = String(bopEntityTypeRaw).toLowerCase();
  const bopIsCompany = bopEntityType === 'company';
  const bopIsEntity = bopEntityType === 'entity' || bopEntityType === 'company';
  const bopHasPostalAddress = !!(bopThirdParty as any).hasPostalAddress;

  const bopFormData = {
    ...bopThirdParty,
    entityName: (bopThirdParty as any).entityName || (bopThirdParty as any).thirdPartyName || row.entityName,
  };

  const billDetailsRaw = (details as any).bill || {};
  const billFormData = {
    ...billDetailsRaw,
    billerName:
      (billDetailsRaw as any).billerName?.name ||
      (billDetailsRaw as any).billerName ||
      row.entityName,
    billerId: (billDetailsRaw as any).billerId || DEFAULTS.BILLER_ID,
    currency: (billDetailsRaw as any).currency || DEFAULTS.CURRENCY,
    transactionLimit: (billDetailsRaw as any).transactionLimit || DEFAULTS.TRANSACTION_LIMIT_DECIMAL,
    paymentTypes: (billDetailsRaw as any).paymentTypes || [],
    referenceFields: (billDetailsRaw as any).referenceFields || [],
    phoneNumber: (billDetailsRaw as any).phoneNumber || '',
    phoneUsage: (billDetailsRaw as any).phoneUsage || [],
    phoneAlertEnabled:
      (billDetailsRaw as any).phoneAlertEnabled !== undefined
        ? (billDetailsRaw as any).phoneAlertEnabled
        : false,
    emailAddress: (billDetailsRaw as any).emailAddress || '',
    emailUsage: (billDetailsRaw as any).emailUsage || [],
    emailAlertEnabled:
      (billDetailsRaw as any).emailAlertEnabled !== undefined
        ? (billDetailsRaw as any).emailAlertEnabled
        : false,
  };
 
  const renderMiddleContent = () => {
    const eventTypeLower = row.eventType.trim().toLowerCase();
    
    // For update flows, the updated details section is rendered inside the summary card.
    // Omit the middle content entirely.
    if (isUpdateFlow) {
      return null;
    }
 
    if (eventTypeLower === EVENT_TYPES.BENEFICIARIES.replace(/\s+/g, "") || eventTypeLower === EVENT_TYPES.BENEFICIARY.replace(/\s+/g, "")) {
      const beneficiaryDetails = (row.details as any)?.beneficiary || {};

      const beneficiaryTypeFields: CommanField[] = beneficiaryDetails.beneficiaryTypeFields || [
        {
          name: 'residentialStatus',
          label: 'Residential status',
          value: PLACEHOLDERS.RESIDENT_NON_RESIDENT,
          type: 'text',
          disabled: true,
        },
        {
          name: 'beneficiaryType',
          label: 'Beneficiary type',
          value: PLACEHOLDERS.BENEFICIARY_TYPE,
          type: 'text',
          disabled: true,
        },
      ];

      const personalDetailsFields: CommanField[] = beneficiaryDetails.personalDetailsFields || [
        { name: 'firstName', label: 'First name', value: PLACEHOLDERS.FIRST_NAME, type: 'text', disabled: true },
        { name: 'lastName', label: 'Last name', value: PLACEHOLDERS.LAST_NAME, type: 'text', disabled: true },
        { name: 'beneficiaryCode', label: 'Beneficiary code', value: PLACEHOLDERS.BENEFICIARY_CODE, type: 'text', disabled: true },
        { name: 'beneficiaryRef', label: 'Beneficiary ref', value: PLACEHOLDERS.BENEFICIARY_REF, type: 'text', disabled: true },
      ];

      const addressDetailsFields: CommanField[] = beneficiaryDetails.addressDetailsFields || [
        { name: 'address', label: 'Address', value: PLACEHOLDERS.ADDRESS, type: 'text', disabled: true },
        { name: 'postCode', label: 'Post / Zip code', value: PLACEHOLDERS.POST_ZIP_CODE, type: 'text', disabled: true },
        { name: 'region', label: 'Region name, e.g. Province', value: PLACEHOLDERS.REGION_PROVINCE, type: 'text', disabled: true },
        { name: 'country', label: 'Country', value: PLACEHOLDERS.COUNTRY, type: 'text', disabled: true },
      ];

      const paymentTypeFields: CommanField[] = beneficiaryDetails.paymentTypeFields || [
        {
          name: 'paymentType',
          label: 'Payment type',
          value: PLACEHOLDERS.PAYMENT_TYPE_LIST,
          type: 'text',
          disabled: true,
          fullWidth: true,
        },
      ];
 
      return (
        <>
          <CreateJournyForm
            onChange={() => {}}
            mode="review"
            ShowActionBtns={false}
            showAccordion
            sections={[
              {
                title: t('detailPanelBeneficiaryType'),
                titleIcon: IcnAccountTile as any,
                fields: beneficiaryTypeFields,
                ShowActionBtns: false,
              },
              {
                title: t('detailPanelPersonalDetails'),
                titleIcon: IcnAccountTile as any,
                fields: personalDetailsFields,
                ShowActionBtns: false,
              },
              {
                title: t('detailPanelAddressDetails'),
                titleIcon: IcnAccountTile as any,
                fields: addressDetailsFields,
                ShowActionBtns: false,
              },
            ]}
          />
 
          <Box>
            <CreateJournyForm
              title={t('detailPanelPaymentType')}
              titleIcon={IcnCardQuestion as any}
              fields={paymentTypeFields}
              onChange={() => {}}
              mode="review"
              ShowActionBtns={false}
              showAccordion
            />
          </Box>
        </>
      );
    }
 
    const renderPlaceholderPanel = (title: string, description?: string) => (
      <Box
        sx={{
          borderRadius: '16px',
          border: '1px solid #E0E5EB',
          bgcolor: '#FFFFFF',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          minHeight: 160,
        }}
      >
        <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#222E37' }}>{title}</Typography>
        {description && (
          <Typography sx={{ fontSize: '14px', color: '#5C6C80' }}>{description}</Typography>
        )}
      </Box>
    );
 
    // Payment type: reuse the same molecules as the manage page in a read-only layout.
    if (eventTypeLower === EVENT_TYPES.PAYMENT_TYPE.replace(/\s+/g, "")) {
      const paymentDetails = (row.details as any)?.paymentType || {};

      const paymentTypeForm: PaymentTypeFormState = paymentDetails.form || {
        name: row.entityName,
        authorisationProfile: DEFAULTS.AUTHORISATION_PROFILE,
        allowAdHoc: true,
        currency: DEFAULTS.CURRENCY,
        adHocLimit: DEFAULTS.AD_HOC_LIMIT,
        payAlertsAllowed: true,
        hostToHostDefault: false,
        hideBeneficiaryDetails: false,
        enforceAuditing: false,
      };

      const fileUploadOptions: FileUploadOptionsState = paymentDetails.fileUploadOptions || {
        errorRejection: FILE_UPLOAD_DEFAULTS.ERROR_REJECTION,
        cutoffBreach: FILE_UPLOAD_DEFAULTS.CUTOFF_BREACH,
        posting: FILE_UPLOAD_DEFAULTS.POSTING,
        allowEditingAfterUpload: false,
      };

      const statementReferencing: StatementReferencingState = paymentDetails.statementReferencing || {
        debitItemised: {
          selected: true,
          references: DEFAULT_STATEMENT_REFERENCES,
          editableReference: true,
        },
        debitConsolidated: {
          selected: true,
          references: DEFAULT_STATEMENT_REFERENCES,
          editableReference: true,
        },
        creditConsolidated: {
          selected: true,
          references: DEFAULT_STATEMENT_REFERENCES,
          editableReference: true,
        },
      };

      const hostToHostOptions: HostToHostOptionsState = paymentDetails.hostToHostOptions || {
        batchErrorRejection: HOST_TO_HOST_DEFAULTS.BATCH_ERROR_REJECTION,
        cutoffBreach: HOST_TO_HOST_DEFAULTS.CUTOFF_BREACH,
        allowEditingAfterUpload: false,
        defaultFundingOption: HOST_TO_HOST_DEFAULTS.DEFAULT_FUNDING_OPTION,
      };

      const unpaidProcessing: UnpaidProcessingState = paymentDetails.unpaidProcessing || {
        unpaidOptionName: UNPAID_PROCESSING_DEFAULTS.UNPAID_OPTION_NAME,
        rows: [
          { id: 1, name: PLACEHOLDERS.UNPAID_OPTION_NAME, onUs: UNPAID_PROCESSING_DEFAULTS.ON_US, offUs: UNPAID_PROCESSING_DEFAULTS.OFF_US },
          { id: 2, name: PLACEHOLDERS.UNPAID_OPTION_NAME, onUs: UNPAID_PROCESSING_DEFAULTS.ON_US, offUs: UNPAID_PROCESSING_DEFAULTS.OFF_US },
        ],
      };

      const customerAgreement = paymentDetails.customerAgreement || {
        agreementId: PLACEHOLDERS.AGREEMENT_ID,
        agreementName: PLACEHOLDERS.AGREEMENT_NAME,
        selectedAccountId: PLACEHOLDERS.ACCOUNT_ID,
        selectedAccount: {
          id: PLACEHOLDERS.ACCOUNT_ID,
          name: PLACEHOLDERS.ACCOUNT_NAME,
          accNumber: PLACEHOLDERS.ACCOUNT_NUMBER,
          sortCode: PLACEHOLDERS.SORT_CODE,
          bic: PLACEHOLDERS.BIC,
          country: PLACEHOLDERS.COUNTRY,
        },
      };
 
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <PaymentTypeDetails form={paymentTypeForm} reviewMode={true} expandIcon={true} actions={<></>}/>
 
          <Box>
             <CustomerAgreement
                  title={t('detailPanelCustomerAgreement')}
                  reviewMode={true}
                  showAccountDetailsInReview={true}
                  initialAgreementId={customerAgreement.agreementId}
                  initialSelectedAccountId={customerAgreement.selectedAccountId}
                  expandIcon={true}
                  actions={<></>}
                />
          </Box>
 
          <Box>
            <FileUploadOptions
              value={fileUploadOptions}
              onChange={() => {}}
              reviewMode={true}
              expandIcon={true}
              actions={<></>}
            />
          </Box>
 
          <Box>
            <StatementReferencingOptions
              mode="payment-types"
              value={statementReferencing}
              onChange={() => {}}
              reviewMode={true}
              expandIcon={true}
              actions={<></>}
            />
          </Box>
 
          <Box>
            <HostToHostOptions
              value={hostToHostOptions}
              onChange={() => {}}
              reviewMode={true}
              expandIcon={true}
              actions={<></>}
            />
          </Box>
 
          <Box>
            <UnpaidProcessingOptions
              value={unpaidProcessing}
              onChange={() => {}}
              reviewMode={true}
              expandIcon={true}
              actions={<></>}
            />
          </Box>
        </Box>
      );
    }
 
    if (eventTypeLower === EVENT_TYPES.TRANSFER_TYPE.replace(/\s+/g, "")) {
      const transferDetails = (row.details as any)?.transferType || {};

      const transferForm = transferDetails.form || {
        transferTypeName: PLACEHOLDERS.TRANSFER_TYPE_NAME,
        authorisationProfile: PLACEHOLDERS.SELECTED_AUTH_PROFILE,
        enforceAuditing: true,
        payerCustomerAgreement: PLACEHOLDERS.SELECTED_CUSTOMER_AGREEMENT,
        payerAccount: ACCOUNT_IDS.DEFAULT_PAYER,
        paymentCustomerAgreement: PLACEHOLDERS.SELECTED_CUSTOMER_AGREEMENT,
        paymentAccount: ACCOUNT_IDS.DEFAULT_PAYMENT,
      };

      const payerAccounts = transferDetails.payerAccounts || [
        {
          id: ACCOUNT_IDS.DEFAULT_PAYER,
          name: PLACEHOLDERS.ACCOUNT_NAME,
          accNumber: PLACEHOLDERS.ACCOUNT_NUMBER,
          sortCode: PLACEHOLDERS.BRANCH_SORT_CODE,
          bic: BIC_PLACEHOLDER,
          country: PLACEHOLDERS.COUNTRY_REGION,
          currency: PLACEHOLDERS.CURRENCY,
        },
      ];

      const paymentAccounts = transferDetails.paymentAccounts || [
        {
          id: ACCOUNT_IDS.DEFAULT_PAYMENT,
          name: PLACEHOLDERS.ACCOUNT_NAME,
          accNumber: PLACEHOLDERS.ACCOUNT_NUMBER,
          sortCode: PLACEHOLDERS.BRANCH_SORT_CODE,
          bic: BIC_PLACEHOLDER,
          country: PLACEHOLDERS.COUNTRY_REGION,
          currency: PLACEHOLDERS.CURRENCY,
        },
      ];
 
      return (
        <TransferTypeDetails
          form={transferForm}
          reviewMode={true}
          expandIcon={true}
          payerAccounts={payerAccounts}
          paymentAccounts={paymentAccounts}
          actions={<></>}
        />
      );
    }
 
    if (eventTypeLower === EVENT_TYPES.COLLECTION_TYPE.replace(/\s+/g, "")) {
      const collectionDetails = (row.details as any)?.collectionType || {};

      const collectionTypeForm: CollectionTypeFormState = collectionDetails.form || {
        name: row.entityName,
        authorisationProfile: DEFAULTS.AUTHORISATION_PROFILE,
        allowAdHoc: true,
        hostToHostDefault: false,
        currency: DEFAULTS.CURRENCY,
        adHocLimit: DEFAULTS.AD_HOC_LIMIT,
      };

      const collectionFileUploadOptions: FileUploadOptionsState = collectionDetails.fileUploadOptions || {
        errorRejection: FILE_UPLOAD_DEFAULTS.ERROR_REJECTION,
        cutoffBreach: FILE_UPLOAD_DEFAULTS.CUTOFF_BREACH,
        posting: FILE_UPLOAD_DEFAULTS.POSTING,
        allowEditingAfterUpload: false,
      };

   const collectionStatementReferencing: StatementReferencingState = collectionDetails.statementReferencing || {
        creditItemised: {
          selected: true,
          references: DEFAULT_STATEMENT_REFERENCES,
          editableReference: true,
        },
        creditConsolidated: {
          selected: true,
          references: DEFAULT_STATEMENT_REFERENCES,
          editableReference: true,
        },
        debitItemised: {
          selected: true,
          references: DEFAULT_STATEMENT_REFERENCES,
          editableReference: true,
        },
      };

      const collectionHostToHostOptions: HostToHostOptionsState = collectionDetails.hostToHostOptions || {
        batchErrorRejection: HOST_TO_HOST_DEFAULTS.BATCH_ERROR_REJECTION,
        cutoffBreach: HOST_TO_HOST_DEFAULTS.CUTOFF_BREACH,
        allowEditingAfterUpload: false,
        defaultFundingOption: HOST_TO_HOST_DEFAULTS.DEFAULT_FUNDING_OPTION,
      };

      const collectionModel: CollectionModelState = collectionDetails.collectionModel || {
        countryOrRegion: PLACEHOLDERS.COUNTRY_REGION,
        fixedDateValue: true,
        upfrontValue: false,
        valueOfSuccess: true,
        defaultSource: COLLECTION_MODEL_DEFAULTS.DEFAULT_SOURCE,
        batchUploadDefault: COLLECTION_MODEL_DEFAULTS.BATCH_UPLOAD_DEFAULT,
      };

      const collectionCustomerAgreement = collectionDetails.customerAgreement || {
        agreementId: PLACEHOLDERS.AGREEMENT_ID,
        agreementName: PLACEHOLDERS.AGREEMENT_NAME,
        selectedAccountId: PLACEHOLDERS.ACCOUNT_ID,
        selectedAccount: {
          id: PLACEHOLDERS.ACCOUNT_ID,
          name: PLACEHOLDERS.ACCOUNT_NAME,
          accNumber: PLACEHOLDERS.ACCOUNT_NUMBER,
          sortCode: PLACEHOLDERS.SORT_CODE,
          bic: PLACEHOLDERS.BIC,
          country: PLACEHOLDERS.COUNTRY,
        },
      };
 
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
           <CollectionTypeDetails
            form={collectionTypeForm}
            reviewMode={true}
            expandIcon={true}
            actions={<></>}
          />
 
          <Box>
            <CustomerAgreement
              reviewMode={true}
              showAssociatedAccounts={false}
              showAccountDetailsInReview={true}
              initialAgreementId={collectionCustomerAgreement.agreementId}
              initialSelectedAccountId={collectionCustomerAgreement.selectedAccountId}
              useBranchCountry
              expandIcon={true}
              actions={<></>}
            />
          </Box>
 
          <Box>
            <FileUploadOptions
              value={collectionFileUploadOptions}
              onChange={() => {}}
              expandIcon
              reviewMode={true}
              hidePostingOptions
              hideAllowEditing
              actions={<></>}
            />
          </Box>
 
          <Box>
            <StatementReferencingOptions
              mode="collection-types"
              value={collectionStatementReferencing}
              onChange={() => {}}
              reviewMode={true}
              expandIcon={true}
              actions={<></>}
            />
          </Box>
 
         <HostToHostOptions
              value={collectionHostToHostOptions}
              onChange={() => {}}
              reviewMode={true}
              expandIcon={true}
              actions={<></>}
            />
 
          <Box>
            <CollectionModelOptions
              value={collectionModel}
              onChange={() => {}}
              reviewMode={true}
              defaultExpanded={true}
              actions={<></>}
            />
          </Box>
        </Box>
      );
    }
 
    if (eventTypeLower.includes(EVENT_TYPES.AUTHORISATION_PROFILE.replace(/\s+/g, ""))) {
      return renderPlaceholderPanel(t('detailPanelAuthorisationProfile'));
    }
 
    if (eventTypeLower.includes(EVENT_TYPES.THIRD_PARTIES.replace(/\s+/g, ""))) {
      const sections: { title: string; titleIcon: any; fields: CommanField[]; ShowActionBtns: boolean }[] = [];

      if (bopIsEntity) {
        sections.push({
          title: t('detailPanelEntityDetails'),
          titleIcon: IcnAccountTile as any,
          fields: buildEntityDetailsFields(bopFormData, bopIsCompany) as CommanField[],
          ShowActionBtns: false,
        });
      } else {
        sections.push({
          title: t('detailPanelPersonalDetails'),
          titleIcon: IcnAccountTile as any,
          fields: buildPersonalFieldsBopThirdParty(bopFormData) as CommanField[],
          ShowActionBtns: false,
        });
      }

      sections.push({
        title: t('detailPanelAddressDetails'),
        titleIcon: IcnAccountTile as any,
        fields: buildAddressFieldsBopThirdParty(bopFormData) as CommanField[],
        ShowActionBtns: false,
      });

      if (bopHasPostalAddress) {
        sections.push({
          title: t('detailPanelPostalAddressDetails'),
          titleIcon: IcnBranch as any,
          fields: buildPostalAddressFieldsBopThirdParty(bopFormData) as CommanField[],
          ShowActionBtns: false,
        });
      }

      sections.push({
        title: t('detailPanelPhoneEmailDetails'),
        titleIcon: IcnCardQuestion as any,
        fields: (bopIsEntity
          ? buildEntityPhoneEmailFields(bopFormData)
          : buildPhoneEmailFieldsBopThirdParty(bopFormData)) as CommanField[],
        ShowActionBtns: false,
      });

      return (
        <CreateJournyForm
          onChange={() => {}}
          mode="review"
          ShowActionBtns={false}
          showAccordion
          sections={sections}
        />
      );
    }
 
    if (eventTypeLower.includes(EVENT_TYPES.BILL.replace(/\s+/g, ""))) {
      const billerDetailsFields = BillsField.buildBillerDetailsFields(billFormData) as CommanField[];
      const paymentTypeFields = BillsField.buildPaymentTypeFields(billFormData) as CommanField[];
      const referenceFields = BillsField.buildReferenceFields(billFormData, () => {}) as CommanField[];
      const payAlertsFields = BillsField.buildPayAlertsFields(billFormData) as CommanField[];

      return (
        <CreateJournyForm
          onChange={() => {}}
          mode="review"
          ShowActionBtns={false}
          showAccordion
          sections={[
            {
              title: t('detailPanelBillerDetails'),
              titleIcon: DocumentIcon as any,
              fields: billerDetailsFields,
              ShowActionBtns: false,
            },
            {
              title: t('detailPanelPaymentTypes'),
              titleIcon: PaymentIcon as any,
              fields: paymentTypeFields,
              ShowActionBtns: false,
            },
            {
              title: t('detailPanelBillerReference'),
              titleIcon: ListIcon as any,
              fields: referenceFields,
              ShowActionBtns: false,
            },
            {
              title: t('detailPanelPayAlerts'),
              titleIcon: IcnBellBell as any,
              fields: payAlertsFields,
              ShowActionBtns: false,
            },
          ]}
        />
      );
    }
 
    if (eventTypeLower.includes(EVENT_TYPES.UNPAID_OPTION.replace(/\s+/g, ""))) {
      const unpaidOptionFields = buildUnpaidOptionDetailsFields(unpaidOptionData, 'review');
 
      return (
        <CreateJournyForm
          onChange={() => {}}
          mode="review"
          ShowActionBtns={false}
          showAccordion
          sections={[
            {
              title: t('detailPanelUnpaidOptionDetails'),
              titleIcon: IcnFormFill as any,
              fields: unpaidOptionFields,
              ShowActionBtns: false,
            },
          ]}
        />
      );
    }
 
    // Debtors: show debtor layout explicitly
    if (eventTypeLower === EVENT_TYPES.DEBTORS.replace(/\s+/g, "") || eventTypeLower === EVENT_TYPES.DEBTOR.replace(/\s+/g, "")) {
      return (
        <>
          <CreateJournyForm
            onChange={() => {}}
            mode="review"
            ShowActionBtns={false}
            showAccordion
            sections={[
              {
                title: t('detailPanelDebtorDetails'),
                titleIcon: IcnAccountTile as any,
                fields: debtorFields,
                ShowActionBtns: false,
              }
            ]}
          />
 
          <Box>
            <CreateJournyForm
              onChange={() => {}}
              mode="review"
              ShowActionBtns={false}
              showAccordion
              sections={[
                {
                  title: t('detailPanelBankDetails'),
                  titleIcon: IcnBranch as any,
                  fields: bankFields,
                  ShowActionBtns: false,
                },
              ]}
            />
          </Box>
 
          <Box>
            <CreateJournyForm
              title={t('detailPanelCollectionType')}
              titleIcon={IcnCardQuestion as any}
              fields={collectionFields}
              onChange={() => {}}
              mode="review"
              ShowActionBtns={false}
              showAccordion
            />
          </Box>
        </>
      );
    }
 
    // For other entity types, no additional middle content is required
    return null;
  };

  return (
    <>
      {open && (
        <>
          <Box className={styles.overlay} onClick={onClose}/>
          <Box className={styles.panelWindow}>
        {activeView === 'details' ? (
          <>
            {/* Header & summary */}
            <Box className={styles.headerSection}>
              <Box className={styles.headerTop}>
                <Box>
                  <Image src={UserAccountNon} alt={t('altUserAccount')} width={18} height={18} />
                  <Typography className={styles.headerTitle}>{row.userAccountName}</Typography>
                </Box>
                {total > 1 && (
                  <Box className={styles.headerTitle}>
                    <Box
                      className={`${styles.navigationButton} ${atFirst || !onPrev ? styles.disabled : ''}`}
                      onClick={() => {
                        if (!atFirst && onPrev) onPrev();
                      }}
                      data-testid={buildTestId(testIdPrefix, 'button-prev')}
                      role="button"
                      aria-label="Previous item"
                      tabIndex={atFirst || !onPrev ? -1 : 0}
                    >
                      <Image src={IconChevronUp} alt={t('altPrevious')} width={20} height={20} />
                    </Box>
                    <Typography className={styles.pageNumber}>{index + 1}</Typography>
                    {total >= 2 && (
                      <Typography className={styles.defaultText}>
                        {Math.min(index + 2, total)}
                      </Typography>
                    )}
                    <Box
                      className={`${styles.navigationButton} ${atLast || !onNext ? styles.disabled : ''}`}
                      onClick={() => {
                        if (!atLast && onNext) onNext();
                      }}
                      data-testid={buildTestId(testIdPrefix, 'button-next')}
                      role="button"
                      aria-label="Next item"
                      tabIndex={atLast || !onNext ? -1 : 0}
                    >
                      <Image src={IconChevronDown} alt={t('altNext')} width={20} height={20} />
                    </Box>
                    <Typography className={styles.pageInfo}>
                      {t('detailPanelRowOf', { index: index + 1, total })}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Scrollable wrapper containing summary card and body content */}
            <Box className={styles.bodyContent}>
              <Box className={styles.summaryCard}>
                {/* Top row: capturer and user account, evenly split */}
                <Box className={styles.summaryCardRow}>
                  <Box className={styles.topRow}
                  >
                    <Avatar sx={{ width: 28, height: 28, fontSize: '12px' }} src={IcnPeopleProfileBlack} alt={t('altUserAvatar')} />
                    <Box>
                      <Typography className={styles.cardLabel}>{t('detailPanelCapturer')}</Typography>
                      <Typography className={styles.cardValue}>[{row.initiatorUserId}]</Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      px: 3,
                      py: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Image src={IcnAccountTile} alt={t('altUserAccount')} width={22} height={22} />
                    <Box>
                      <Typography className={styles.cardLabel}>{t('detailPanelUserAccount')}</Typography>
                      <Typography className={styles.cardValue}>{row.userAccountName}</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Middle rows: entity and event details, two fields per row */}
                <Box className={styles.middleRow}
                >
                  {/* Row 1: Entity name | Event entity type */}
                  <Box sx={{ display: 'flex', columnGap: 4 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography className={styles.cardLabel}>{t('detailPanelEntityName')}</Typography>
                      <Typography className={styles.cardValue}>{row.entityName}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography className={styles.cardLabel}>{t('detailPanelEventEntityType')}</Typography>
                      <Typography className={styles.cardValue}>{row.eventType}</Typography>
                    </Box>
                  </Box>

                  {/* Row 2: Event function | Date captured */}
                  <Box sx={{ display: 'flex', columnGap: 4 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography className={styles.cardLabel}>{t('detailPanelEventFunction')}</Typography>
                      <Typography className={styles.cardValue}>{row.eventFunction}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography className={styles.cardLabel}>{t('detailPanelDateCaptured')}</Typography>
                      <Typography className={styles.cardValue}>{row.valueDate}</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Bottom row: view auditors */}
                <Box className={styles.bottomRow} onClick={() => setActiveView('auditors')}>
                  <Image src={IcnAccountTileBlue} alt={t('altViewAuditors')} width={24} height={24} />
                  <Typography className={styles.linkText}>
                    {mode === 'audit' ? t('detailPanelViewAuditors') : t('detailPanelViewAuthorisers')} 
                  </Typography>
                </Box>

                {/* Updated details collapsible section for update flows */}
                {isUpdateFlow && (
                  <Box className={styles.updatedDetailsSection}>
                    <Box className={styles.updateDetailsHeaderBox}
                      onClick={() => setShowUpdateDetails((prev) => !prev)}
                    >
                      <Typography className={styles.headerText}>
                        {t('detailPanelUpdatedDetailsHeading')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Image
                          src={showUpdateDetails ? IconChevronUp : IconChevronDown}
                          alt={showUpdateDetails ? t('altCollapse') : t('altExpand')}
                          width={18}
                          height={18}
                        />
                      </Box>
                    </Box>
                    {showUpdateDetails && (
                      <Box
                        component="ol"
                        className={styles.updatedDetailsList}
                      >
                        {updateSummary.length
                          ? updateSummary.map((item, idx) => <li key={idx}>{item}</li>)
                          : <li>{t('detailPanelUpdatedDetailsDefault')}</li>}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              {/* Body sections vary by entity type */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {renderMiddleContent()}
              </Box>
            </Box>

            {/* Footer actions */}
            <Box className={styles.footerActions}>
              <Button
                buttonVariant="tertiary"
                onClick={onClose}
                startIcon={<Image src={CloseBlue} alt={t('altCloseIcon')} width={20} height={20} />}
                data-testid={buildTestId(testIdPrefix, 'button-close')}
                aria-label="Close panel"
              >
                {t('detailPanelClose')}
              </Button>
              <Box className={styles.buttonGroup}>
                <Button
                  buttonVariant="secondary"
                  startIcon={<Image src={IcnDislikeBlue} alt={t('altDecline')} width={20} height={20} />}
                  onClick={() => {
                    setDeclineReason('');
                    setDeclineError(false);
                    setIsDeclineDialogOpen(true);
                  }}
                  data-testid={buildTestId(testIdPrefix, 'button-decline')}
                  aria-label="Decline item"
                >
                  {t('decline')}
                </Button>
                <Button
                  buttonVariant="primary"
                  startIcon={<Image src={IcnCheckmarkBlue} alt={primaryActionLabel} width={20} height={20} />}
                  onClick={() => setIsAuditDialogOpen(true)}
                  data-testid={buildTestId(testIdPrefix, mode === 'audit' ? 'button-audit' : 'button-approve')}
                  aria-label={primaryActionLabel}
                >
                  {primaryActionLabel}
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
            }}
         >
             <AuditorsPanel
              userAccountName={row.userAccountName}
              data={row?.list}
              onBack={() => setActiveView('details')}
              onClose={onClose}
              mode={mode}
            />
          </Box>
        )}
      </Box>
      </>
      )}
 
      {/* Audit request confirmation dialog */}
      <ConfirmationDialog
        open={isAuditDialogOpen}
        onClose={() => setIsAuditDialogOpen(false)}
        title={mode === 'audit' ? t('auditConfirmTitle') : t('approveConfirmTitle')}
        avatarIcon={AvatarQuestion}
        avatarAlt={t('altQuestionIcon')}
        heading={mode === 'audit' ? t('auditConfirmHeading') : t('approveConfirmHeading')}
        message={mode === 'audit' ? t('auditConfirmMessage') : t('approveConfirmMessage')}
        dismissLabel={t('dismiss')}
        confirmLabel={mode === 'audit' ? t('auditConfirmButtonSingle') : t('approveConfirmButtonSingle')}
        onConfirm={() => {
          onAuditSuccess?.(entityKey, entityStatus, entityType);
          setIsAuditDialogOpen(false);
        }}
        dialogTestId={buildTestId(testIdPrefix, 'dialog-audit-confirm')}
        closeTestId={buildTestId(testIdPrefix, 'button-dialog-close-audit')}
        dismissTestId={buildTestId(testIdPrefix, 'button-dismiss-audit')}
        confirmTestId={buildTestId(testIdPrefix, mode === 'audit' ? 'button-confirm-audit' : 'button-confirm-approve')}
      />
 
      {/* Decline dialog - matches "Decline event" design */}
      <ConfirmationDialog
        open={isDeclineDialogOpen}
        onClose={() => setIsDeclineDialogOpen(false)}
        title={t('declineTitle')}
        avatarIcon={AvatarAlert}
        avatarAlt={t('altAlertIcon')}
        heading={t('declineMessage', { count: 1 })}
        message={t('declineMessageSubtext')}
        dismissLabel={t('dismiss')}
        confirmLabel={t('declineMultipleButton', { count: 1 })}
        onConfirm={() => {
          if (!declineReason.trim()) {
            setDeclineError(true);
            return;
          }
          onDeclineSuccess?.(entityKey, entityStatus,entityType);
          setIsDeclineDialogOpen(false);
        }}
        dialogTestId={buildTestId(testIdPrefix, 'dialog-decline')}
        closeTestId={buildTestId(testIdPrefix, 'button-dialog-close-decline')}
        dismissTestId={buildTestId(testIdPrefix, 'button-dismiss-decline')}
        confirmTestId={buildTestId(testIdPrefix, 'button-confirm-decline')}
      >
        <Box sx={{ mt: 2, width: '100%' }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder={t('rejectionReasonPlaceholder')}
            value={declineReason}
            onChange={(e) => {
              setDeclineReason(e.target.value);
              if (declineError && e.target.value.trim()) {
                setDeclineError(false);
              }
            }}
            error={declineError}
            helperText={declineError ? t('rejectionReasonRequired') : ''}
            inputProps={{
              'data-testid': buildTestId(testIdPrefix, 'input-decline-reason')
            }}
          />
        </Box>
      </ConfirmationDialog>
    </>
  );
};
 
export default NonTransactionalDetailPanel;