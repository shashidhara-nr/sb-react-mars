import * as React from "react";
import styled from "@emotion/styled";
import {
  AccountVerified,
  Address,
  Add,
  Africa,
  Arrow,
  Bank,
  BankAccount,
  BillingAccountType,
  BillingAccountSelect,
  BillingAccountEnter,
  Cancel,
  CountryFlagSouthAfrica,
  CurrentAccount,
  Delete,
  Edit,
  Filter,
  Folder,
  Globe,
  IconOverflow,
  IconSort,
  Info,
  Locator,
  MagGlass,
  MailBox,
  ManageLimit,
  Next,
  Notes,
  PasswordReset,
  PaymentType,
  Save,
  Search,
  Status,
  Timer,
  Tower,
  User,
  UserAccount,
  Accounts,
  Exclamation,
  BackArrow,
  Download,
  ChevronUp,
  ChevronDown
} from "assets/customIcons";

interface IconWrapperProps {
  mt?: string;
  mr?: string;
  ml?: string;
  width?: string;
  height?: string;
}

const IconWrapper = styled.div<IconWrapperProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${(props) => (props.mr ? `${props.mr}px` : 0)};
  margin-left: ${(props) => (props.ml ? `${props.ml}px` : 0)};
  margin-top: ${(props) => (props.mt ? `${props.mt}px` : 0)};
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  svg {
    display: block;
    width: 100%;
  }
`;

interface IconProps {
  width?: string;
  height?: string;
  mt?: string;
  mr?: string;
  ml?: string;
  className?: string;
  action?: () => void;
  testId?: string;
  bgColor?: string;
  name: string;
}

export const Icon: React.FC<IconProps> = ({
  width = "24px",
  height = "24px",
  mt,
  mr,
  ml,
  className = "",
  action,
  testId = "",
  bgColor,
  name,
  ...props
}) => {
  const components: Record<string, React.ComponentType<any>> = {
    currentAccount: CurrentAccount,
    iconSort: IconSort,
    iconOverflow: IconOverflow,
    info: Info,
    search: Search,
    countryFlagSouthAfrica: CountryFlagSouthAfrica,
    notes: Notes,
    status: Status,
    add: Add,
    timer: Timer,
    folder: Folder,
    magGlass: MagGlass,
    locator: Locator,
    tower: Tower,
    mailBox: MailBox,
    passwordReset: PasswordReset,
    cancel: Cancel,
    save: Save,
    manageLimit: ManageLimit,
    edit: Edit,
    user: User,
    userAccount: UserAccount,
    bankAccount: BankAccount,
    bank: Bank,
    paymentType: PaymentType,
    billingAccountSelect: BillingAccountSelect,
    billingAccountEnter: BillingAccountEnter,
    filter: Filter,
    arrow: Arrow,
    billingAccountType: BillingAccountType,
    next: Next,
    africa: Africa,
    globe: Globe,
    accountVerified: AccountVerified,
    address: Address,
    delete: Delete,
    accounts: Accounts,
    exclamation: Exclamation,
    backArrow: BackArrow,
    download: Download,
    chevronUp: ChevronUp,
    chevronDown: ChevronDown
  };

  const IconComponent = components[name];

  if (!IconComponent) {
    return null;
  }

  return (
    <IconWrapper mt={mt} mr={mr} ml={ml} width={width} height={height} className={className} onClick={action} data-testid={testId}>
      <IconComponent width={width} height={height} bgColor={bgColor} {...props} />
    </IconWrapper>
  );
};