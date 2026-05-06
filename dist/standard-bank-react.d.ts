import { Box } from '@mui/material';
import { ButtonProps as ButtonProps_2 } from '@mui/material';
import { ChangeEvent } from 'react';
import { default as default_2 } from 'react';
import { FileWithPath } from 'react-dropzone';
import { FormControlProps } from '@mui/material';
import { ForwardRefExoticComponent } from 'react';
import { JSX } from 'react/jsx-runtime';
import { MouseEvent as MouseEvent_2 } from 'react';
import { MUIStyledCommonProps } from '@mui/system';
import { MuiTelInputCountry } from 'mui-tel-input';
import { RadioGroupProps as RadioGroupProps_2 } from '@mui/material';
import * as React_2 from 'react';
import { RefAttributes } from 'react';
import { SelectChangeEvent } from '@mui/material';
import { SelectProps as SelectProps_2 } from '@mui/material';
import { StepperProps } from '@mui/material';
import { StyledComponent } from '@emotion/styled';
import { SxProps } from '@mui/material';
import { SxProps as SxProps_2 } from '@mui/material/styles';
import { TextFieldProps } from '@mui/material';
import { Theme as Theme_2 } from '@mui/material';
import { Typography } from '@mui/material';

export declare function AccountDetailsCard({ cards }: CardProps): JSX.Element;

declare interface AccountInfoProps {
    variant: 'account' | 'balance';
    cardIcon?: default_2.ReactElement<{
        style?: default_2.CSSProperties;
    }>;
    cardTitle?: string;
    cardSubheader?: number | string;
    cardCells?: InfoCells[];
}

export declare function AccountTile({ icon, accountName, accountNumber, buttons, overflowButtonIcon, balanceCards, overflowButtonOnClick, }: AccountTileProps): JSX.Element;

declare interface AccountTileProps {
    icon: default_2.ReactElement<{
        style?: default_2.CSSProperties;
    }>;
    accountName: string;
    accountNumber: number;
    balanceCards?: default_2.ReactElement<typeof BalanceCard>[];
    buttons: default_2.ReactElement<typeof Button>[];
    overflowButtonIcon?: default_2.ReactElement;
    overflowButtonOnClick?: () => void;
}

export declare function AlertAvatar({ icon, size, variant, notification, notificationIcon, }: AlertAvatarProps): JSX.Element;

declare type AlertAvatarProps = {
    icon?: default_2.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'error';
    size?: 'large' | 'medium' | 'small' | 'extraSmall';
    notification?: boolean;
    notificationIcon?: default_2.ReactNode;
};

export declare const Amount: ({ label, showHidden, disabled, handleChangeCurrency, handleChangeValue, required, value, currency, sx, currencyOptions, error, helperText, }: AmountProps) => JSX.Element;

declare interface AmountProps {
    label: string;
    required?: boolean;
    disabled?: boolean;
    value: string;
    handleChangeValue: (value: string) => void;
    showHidden?: boolean;
    handleChangeCurrency: (value: string) => void;
    currency?: string;
    currencyOptions?: Record<string, string>[];
    sx?: SxProps;
    error?: boolean;
    helperText?: string;
}

export declare function Autocomplete({ label, sx, options, onInputChange, onHighlightChange, disabled, error, helperText, }: AutocompleteProps): JSX.Element;

declare type AutocompleteProps = {
    /** The label for the component. */
    label: string;
    /** Optional material UI styling properties. */
    sx?: SxProps;
    /** Thee available options as an array of strings. */
    options: Array<string | {
        label: string;
        id: string;
    }>;
    disabled?: boolean;
    helperText?: string;
    error: boolean;
    /** Input change handler. */
    onInputChange: (event: React.SyntheticEvent, value: string) => void;
    onHighlightChange: (event: React.SyntheticEvent, option: string | null, reason: string) => void;
};

export declare function BalanceCard({ balanceTitle, currencySymbol, balance, }: BalanceCardProps): JSX.Element;

declare interface BalanceCardProps {
    balanceTitle: string;
    currencySymbol?: string;
    balance?: number | string;
}

export declare type BreadcrumbItem = {
    label: string;
    href?: string;
};

declare type BreadCrumbProps = {
    links: BreadcrumbItem[];
};

/** This is effectively a wrapper for the MUI Button component. You can use all the props and the component will apply
 * the Design System styles on it.
 */
export declare function Button({ buttonVariant, small, isLoading, disabled, children, iconOnly, toggleButton, toggleValue, onClick, upperCaseText, ...rest }: ButtonProps): JSX.Element;

/** A compponent for laying Buttons horizontally. */
export declare function ButtonBar({ children, align }: ButtonBarProps): JSX.Element;

declare type ButtonBarProps = {
    /** Optioanl property to align the buttons to the start or end of the bar. Values are `start` or `end`. Defaults to `end`. */
    align?: 'start' | 'end';
    /** These should be Button components but there is no real restriction. */
    children: default_2.ReactNode;
};

declare type ButtonProps = {
    buttonVariant?: 'primary' | 'primary-header-menu' | 'primary-on-colour' | 'secondary' | 'secondary-on-colour' | 'tertiary' | 'tertiary-on-colour' | 'text' | 'error' | 'error-secondary' | 'error-tertiary';
    small?: boolean;
    isLoading?: boolean;
    disabled?: boolean;
    iconOnly?: boolean;
    children?: default_2.ReactNode;
    toggleButton?: boolean;
    toggleValue?: string;
    upperCaseText?: boolean;
    onClick?: default_2.MouseEventHandler<HTMLButtonElement>;
    icon?: string;
    imageSrc?: string;
    iconPosition?: 'start' | 'end';
} & ButtonProps_2;

declare interface CardProps {
    cards: AccountInfoProps[];
}

export declare function CardWrapper({ cards, cardVariant, desktopCardsPerRow, }: CardWrapperProps): JSX.Element;

declare interface CardWrapperProps {
    cardVariant?: 'direction' | 'image';
    cards: React.ReactNode[];
    desktopCardsPerRow: 2 | 3 | 4;
}

export declare function CheckBox({ variant, disabled, defaultChecked, label, indeterminate, handleChange, }: CustomCheckboxProps): JSX.Element;

export declare function Chip({ labelText, avatarIcon, disabled, onClick, onDelete, deleteIcon, backgroundColor, // NEW
    textColor, }: ChipProps): JSX.Element;

declare interface ChipProps {
    labelText?: string;
    deleteIcon?: default_2.ReactElement;
    avatarIcon?: default_2.ReactElement;
    disabled: boolean;
    onClick?: () => void;
    onDelete?: () => void;
    backgroundColor?: string;
    textColor?: string;
}

export declare function CircularProgress({ currentStep, circularProgressSize, circularProgressThickness, steps, }: OverallProgressCircleProps): JSX.Element;

export declare function ContentSlotCard({ component, padding, }: ContentSlotCardProps): JSX.Element;

declare interface ContentSlotCardProps {
    component: React.ReactElement;
    padding: 0 | 16 | 24 | 32 | 40 | 64 | 80;
}

export declare function CountrySelect({ label, onChange, placeholder, disabled, error, helperText, }: CountrySelectProps): JSX.Element;

declare interface CountrySelectProps {
    label: string;
    onChange: (value: CountryType) => void;
    placeholder: string;
    disabled: boolean;
    error: boolean;
    helperText: string;
}

declare interface CountryType {
    code: string;
    label: string;
    phone?: string;
    suggested?: boolean;
}

declare interface cta {
    ctaText: string;
    ctaAction: () => void;
    fullWidth?: boolean;
}

declare interface cta_2 {
    ctaText: string;
    ctaAction: () => void;
    fullWidth?: boolean;
}

declare interface CustomCheckboxProps {
    variant: 'error' | 'primary';
    label: string;
    disabled?: boolean;
    defaultChecked?: boolean;
    checked?: boolean;
    handleChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    indeterminate?: boolean;
}

declare function CustomizedBreadcrumbs({ links }: BreadCrumbProps): JSX.Element;
export { CustomizedBreadcrumbs as Breadcrumb }
export { CustomizedBreadcrumbs as Breadcrumbs }

declare interface CustomPaginationProps {
    rows: unknown[];
    page: number;
    rowsPerPage: 5 | 15 | 30 | 50 | 100;
    onPageChange: (_: ChangeEvent<unknown>, newPage: number) => void;
    onRowsPerPageChange: (newRowsPerPage: number) => void;
    serverSidePagination?: boolean;
    totalRecords?: number;
}

export declare function DataCard({ dataCards, buttonClick, buttonIcon, }: DataCardProps): JSX.Element;

declare function DataCard({ dataCards, buttonClick, buttonIcon, }: DataCardProps): JSX.Element;

declare interface DataCard_2 {
    cardTitle?: string;
    labels?: DataCardLabel[];
}

declare interface DataCardLabel {
    label: string;
    labelDescription: string;
}

declare interface DataCardProps {
    buttonIcon: React.ReactElement;
    buttonClick: () => void;
    dataCards?: DataCard_2[];
}

export declare function DataTable({ columns, rows, rowsPerPage, rowVariant, rowButton, headCells, accountIcon, selectedRows: externalSelectedRows, onPageChange, onPerPageChange, onRowClick, onCheckboxClick, onSelectAll, onQuickLinkClick, onMoreButtonClick, onRowDropdownClick, isFilterApplied, sx, style, emptyStateContent, emptyStateTitle, emptyStateSubtitle, emptyStateActionLabel, onEmptyStateAction, emptyStateIcon, serverSidePagination, totalRecords, page: externalPage, serverSideSorting, onSort, externalOrder, externalOrderBy, hideHeaderCheckbox, singleSelect, }: DataTableProps): JSX.Element;

declare type DataTableColumn = string | {
    key: string;
    type?: 'account' | 'normal' | 'link' | 'status' | 'chip' | 'button' | 'more' | undefined;
};

export declare interface DataTableProps {
    tableTitle?: string;
    columns: DataTableColumn[];
    headCells: HeadCell[];
    rows: unknown[];
    rowsPerPage: 5 | 15 | 30 | 50 | 100;
    rowVariant?: 'default' | 'dropdown' | 'checkbox';
    rowButton?: boolean;
    statusColumn?: boolean;
    accountIcon?: default_2.ReactElement;
    selectedRows?: any[];
    onPageChange?: (newPage: number) => void;
    onPerPageChange?: (newPerPage: number) => void;
    onRowClick?: (row: any, index: number) => void;
    onCheckboxClick?: (row: any, index: number) => void;
    onFilterClick?: (filter: any, index: number) => void;
    onQuickLinkClick?: (row: any, index: number, link: any) => void;
    onMoreButtonClick?: () => void;
    onRowDropdownClick?: (expanded: boolean) => void;
    /** Called when header checkbox toggles select-all. Provides array of selected rows and checked state */
    onSelectAll?: (selectedRows: any[], checked: boolean) => void;
    isFilterApplied?: boolean;
    sx?: any;
    style?: default_2.CSSProperties;
    /**
     * Custom content to render when there are no records.
     * If provided, this takes precedence over the title/subtitle/action props.
     */
    emptyStateContent?: default_2.ReactNode;
    /** Title shown in the empty state when there are no records */
    emptyStateTitle?: string;
    /** Subtitle shown in the empty state when there are no records */
    emptyStateSubtitle?: string;
    /** Label for the empty state action button */
    emptyStateActionLabel?: string;
    /** Click handler for the empty state action button */
    onEmptyStateAction?: () => void;
    /** Optional icon to display above the empty state title */
    emptyStateIcon?: default_2.ReactNode;
    serverSidePagination?: boolean;
    totalRecords?: number;
    page?: number;
    serverSideSorting?: boolean;
    onSort?: (columnKey: string, order: 'asc' | 'desc') => void;
    externalOrder?: 'asc' | 'desc';
    externalOrderBy?: string | number;
    hideHeaderCheckbox?: boolean;
    singleSelect?: boolean;
}

declare interface DataTableRowProps<T = Record<string, unknown>> {
    row: T;
    columns: (string | {
        key: string;
        type?: 'account' | 'normal' | 'link' | 'status' | 'chip' | 'button' | 'more' | undefined;
    })[];
    variant: 'default' | 'dropdown' | 'checkbox';
    isSelected?: boolean;
    onSelect?: () => void;
    showMoreButton?: boolean;
    onButtonClick?: () => void;
    onRowClick?: () => void;
    onQuickLinkClick?: (link: any) => void;
    onMoreButtonClick?: () => void;
    onRowDropdownClick?: (expanded: boolean) => void;
    statusLabel?: string;
    statusTheme?: 'primary' | 'success' | 'warning' | 'error' | 'info';
    accountIcon?: React.ReactElement;
    className?: string;
    style?: React.CSSProperties;
}

export declare const DatePicker: React_2.FC<DatePickerProps>;

declare interface DatePickerButton {
    label: string;
    variant?: 'primary' | 'secondary' | 'tertiary';
    onClick?: () => void;
}

declare interface DatePickerProps {
    label?: string;
    onChange?: (date: unknown) => void;
    value?: unknown;
    actions?: DatePickerButton[];
    placeholder?: string;
    width?: string | number;
    height?: string | number;
    fullWidth?: boolean;
    onClose?: () => void;
}

export declare function Dialog({ name, title, titleBackgroundColor, content, open, primaryCTALabel, secondaryCTALabel, tertiaryCTALabel, onClose, onPrimaryCTA, primaryCTALoading, primaryCTADisabled, onSecondaryCTA, secondaryCTALoading, secondaryCTADisabled, onTertiaryCTA, tertiaryCTALoading, iconOnlyPrimaryCTA, iconOnlySecondaryCTA, iconOnlyTertiaryCTA, loading, maxWidth, primaryCTAStartIcon, primaryCTAEndIcon, primaryCTASize, primaryCTAWidth, primaryCTAHeight, primaryCTAStyle, secondaryCTAStartIcon, secondaryCTAEndIcon, secondaryCTASize, secondaryCTAWidth, secondaryCTAHeight, secondaryCTAStyle, tertiryCTAStartIcon, tertiaryCTAEndIcon, tertiaryCTASize, tertiaryCTAWidth, tertiaryCTAHeight, tertiaryCTAStyle, }: DialogProps): JSX.Element;

declare interface DialogCardProps {
    variant?: 'alert' | 'text';
    cardTitle?: string;
    icon?: default_2.ReactNode;
    alertIconTheme?: 'primary' | 'secondary' | 'success' | 'error';
    alertIconSize: 'large' | 'medium' | 'small' | 'extraSmall';
    cardBodyText?: string[];
}

export declare function DialogInfoCard({ variant, cardTitle, icon, cardBodyText, alertIconSize, alertIconTheme, }: DialogCardProps): JSX.Element;

declare interface DialogProps {
    /** Used for aria labels and form controls */
    name: string;
    /** The title of the modal */
    title: string;
    titleBackgroundColor?: 'primary' | 'white';
    /** The content */
    content: default_2.ReactNode;
    /** Show/hide the modal */
    open: boolean;
    /** If supplied an X buton to close will be added */
    onClose?: () => void;
    /** If supplied an Accept primary buton will be added */
    onPrimaryCTA?: () => void;
    /** If supplied a Decline secondary buton will be added */
    primaryCTALoading?: boolean;
    primaryCTADisabled?: boolean;
    iconOnlyPrimaryCTA?: boolean;
    primaryCTAStartIcon?: default_2.ReactNode;
    primaryCTAEndIcon?: default_2.ReactNode;
    primaryCTASize?: 'small' | 'medium' | 'large';
    primaryCTAWidth?: string | number;
    primaryCTAHeight?: string | number;
    primaryCTAStyle?: default_2.CSSProperties;
    onSecondaryCTA?: () => void;
    /** Label for the optional accept button */
    secondaryCTALoading?: boolean;
    secondaryCTADisabled?: boolean;
    iconOnlySecondaryCTA?: boolean;
    secondaryCTAStartIcon?: default_2.ReactNode;
    secondaryCTAEndIcon?: default_2.ReactNode;
    secondaryCTASize?: 'small' | 'medium' | 'large';
    secondaryCTAWidth?: string | number;
    secondaryCTAHeight?: string | number;
    secondaryCTAStyle?: default_2.CSSProperties;
    onTertiaryCTA?: () => void;
    tertiaryCTALoading?: boolean;
    iconOnlyTertiaryCTA?: boolean;
    tertiryCTAStartIcon?: default_2.ReactNode;
    tertiaryCTAEndIcon?: default_2.ReactNode;
    tertiaryCTASize?: 'small' | 'medium' | 'large';
    tertiaryCTAWidth?: string | number;
    tertiaryCTAHeight?: string | number;
    tertiaryCTAStyle?: default_2.CSSProperties;
    primaryCTALabel?: string;
    /** Label for the optional decline button */
    secondaryCTALabel?: string;
    /** When true a loading animation is played on the accept button */
    tertiaryCTALabel?: string;
    loading?: boolean;
    /** Optional max width property for the modal */
    maxWidth?: string;
}

export declare function DirectionCard({ cardIcon, cardHeader, cardSubheader, paragraphText, alternate, endCard, }: DirectionCardProps): JSX.Element;

declare interface DirectionCardProps {
    cardIcon?: React.ReactElement;
    cardHeader?: string;
    cardSubheader?: string;
    paragraphText?: string;
    alternate?: boolean;
    endCard?: boolean;
}

export declare function Download({ exportOptions, sortOptions, dialogTitle, titleSx, }: DownloadDialogProps): JSX.Element;

declare interface DownloadDialogProps {
    exportOptions?: {
        value: string;
        label: string;
    }[];
    sortOptions?: {
        value: string;
        label: string;
    }[];
    dialogTitle?: string;
    titleSx?: object;
}

export declare function dropdown({ label, value, defaultValue, disabled, options, handleChange, fullWidth, startIcon, }: DropDownProps): JSX.Element;

declare type DropDownOption = {
    label: string;
    value: string;
};

declare type DropDownProps = {
    label: string;
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    options?: DropDownOption[];
    handleChange?: (event: SelectChangeEvent<string>) => void;
    fullWidth?: boolean;
    startIcon?: default_2.ReactNode;
};

export declare type Fields = {
    type: string;
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    defaultValue?: string;
    heading?: string;
    nolabels?: boolean;
    hasBorder?: boolean;
    value?: string;
    options?: SelectType_2[];
    errorText?: string;
    fornSubmitted?: boolean;
    params?: TextFieldProps;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    sx?: SxProps;
    onChange?: (event: ChangeEvent) => void;
};

declare type Fields_2 = {
    type: string;
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    defaultValue?: string;
    heading?: string;
    nolabels?: boolean;
    hasBorder?: boolean;
    value?: string;
    options?: SelectType_2[];
    errorText?: string;
    fornSubmitted?: boolean;
    params?: TextFieldProps;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    sx?: SxProps;
    onChange?: (event: ChangeEvent) => void;
};

export declare const Filter: default_2.FC<FilterProps>;

declare interface FilterProps {
    open: boolean;
    onClose: () => void;
    header?: string;
    subHeaders: FilterSubHeader[];
    children?: default_2.ReactNode;
    titleSx?: object;
}

declare interface FilterSubHeader {
    subHeader: string;
    fields: {
        label: string;
        value: string;
    }[];
}

export declare const Footer: default_2.FC<FooterProps>;

declare interface FooterProps {
    socialIcons?: FooterSocialIcon[];
    description?: string;
    links?: string[];
}

declare interface FooterSocialIcon {
    icon: string;
    label: string;
    href: string;
}

export declare const Form: ({ mainHeading, isEditMode, fields, onClose, onSubmit, cancelLabel, submitLabel, }: FormCreatorProps) => JSX.Element;

declare interface FormCreatorProps {
    mainHeading: string;
    isEditMode?: boolean;
    onClose?: () => void;
    fields: Fields[];
    onSubmit: (formData: Record<string, string>) => void;
    cancelLabel?: string;
    submitLabel?: string;
}

declare interface HeadCell {
    id: string;
    label: string;
    numeric: boolean;
    icon?: default_2.ReactElement;
}

export declare const Header: default_2.FC<HeaderProps>;

declare interface HeaderProps {
    bankLogo?: default_2.ReactNode;
    bankTitle?: default_2.ReactNode;
    children?: default_2.ReactNode;
}

export declare const Heading: default_2.FC<HeadingProps>;

declare interface HeadingProps extends default_2.HTMLAttributes<HTMLElement> {
    as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'legend' | 'label';
    children: default_2.ReactNode;
    subtitle?: string;
    subtitleColor?: string;
    padding?: string;
    margin?: string;
    lineHeight?: string;
    fontSize?: string | number;
    dark?: boolean;
    hasBorder?: boolean;
}

export declare const Icons: default_2.FC<IconWithTextProps>;

declare interface IconWithTextProps {
    icon?: default_2.ReactNode;
    text?: string;
    iconSize?: number | string;
    textProps?: default_2.ComponentProps<typeof Typography>;
    boxProps?: default_2.ComponentProps<typeof Box>;
}

export declare function ImageCard({ clickable, cardHeading, paragraphText, imageUrl, imageAltText, labelText, subText, ctas, ctaRightAlign, ctaLeftAlign, singleCard, }: ImageCardProps): JSX.Element;

declare interface ImageCardProps {
    clickable: boolean;
    labelText?: string;
    imageUrl?: string;
    imageAltText?: string;
    cardHeading: string;
    paragraphText?: string;
    subText?: string;
    ctas?: [cta, cta?, cta?];
    ctaRightAlign?: boolean;
    ctaLeftAlign?: boolean;
    singleCard?: boolean;
}

declare interface InfoBlockProps {
    title: string;
    description: string;
    color?: string;
    width?: string;
    backgroundColor?: string;
    alertIconStyle: 'circle' | 'triangle';
}

declare interface InfoCells {
    title: string;
    value?: number | string;
}

export declare const Inforblock: ({ title, description, color, width, backgroundColor, alertIconStyle, }: InfoBlockProps) => JSX.Element;

export declare const Label: ({ children, htmlFor, label, }: LabelProps_2 & {
    /** The id of the input element */
    htmlFor: string;
}) => JSX.Element;

declare interface LabelProps {
    text: string;
    paletteColor?: 'primary' | 'error' | 'warning' | 'info' | 'success' | undefined;
}

declare interface LabelProps_2 {
    /** The text to display */
    children: default_2.ReactNode;
    /** The id of the input element */
    htmlFor: string;
    label: string;
}

export declare function LaunchCard({ variant, avatarIcon, actionButtonIcon, actionButtonAction, cardHeading, subHeader, cardLinkText, cardLink, subTextHeader, paragraphText, cardSubText, ctas, }: LaunchCardProps): JSX.Element;

declare interface LaunchCardProps {
    variant: 'Launch-Card' | 'Avatar-Container';
    avatarIcon?: React.ReactElement;
    actionButtonIcon?: React.ReactElement;
    actionButtonAction?: () => void;
    cardHeading: string;
    subHeader?: string;
    subTextHeader?: string;
    cardLinkText?: string;
    cardLink?: string;
    paragraphText?: string;
    cardSubText?: string;
    ctas?: [cta_2, cta_2?, cta_2?];
}

export declare const Loader: ({ children, loaded, size, color, inheritColor, backgroundColor, hideText, }: LoaderProps & {
    children?: default_2.ReactNode;
}) => JSX.Element;

declare interface LoaderProps {
    children?: default_2.ReactNode;
    loaded?: boolean;
    size?: number;
    backgroundColor?: string;
    hideText?: boolean;
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
    inheritColor?: string;
}

export declare function MultipleSelectChip({ label, options, placeholder, OnChange, disabled, selected: selectedProp, error, helperText, sx, }: MultSelectProps): JSX.Element;

declare interface MultSelectProps {
    label: string;
    options: Record<string, string>[];
    OnChange: (items: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    selected?: Record<string, string>[];
    error: boolean;
    helperText: string;
    sx?: SxProps_2;
}

export declare type Order = 'asc' | 'desc';

declare interface OverallProgressCircleProps {
    currentStep?: number;
    circularProgressSize?: number;
    circularProgressThickness?: number;
    steps: string[];
}

export declare const Password: ForwardRefExoticComponent<PasswordProps & RefAttributes<HTMLInputElement>>;

declare interface PasswordProps {
    label: string;
    required: boolean;
    disabled: boolean;
    placeholder: string;
    type: string;
    error: boolean;
    helperText: string;
    sx?: SxProps;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export declare function PaymentCard({ icon, title, subtitle, minWidth, selected: selectedProp, onSelect, selectedIcon, }: PaymentCardProps): JSX.Element;

declare interface PaymentCardProps {
    icon: default_2.ReactElement<{
        style?: default_2.CSSProperties;
    }>;
    title: string;
    subtitle: string;
    selected?: boolean;
    onSelect?: (selected: boolean) => void;
    selectedIcon?: default_2.ReactElement<{
        style?: default_2.CSSProperties;
    }>;
    minWidth?: number | string;
}

export declare const PhoneNumber: ({ label, disabled, defaultValue, onChange, defaultCountry, error, helperText, value: controlledValue, }: PhoneNumberProps & {
    value?: string;
}) => JSX.Element;

declare interface PhoneNumberProps {
    label?: string;
    disabled?: boolean;
    defaultValue?: string;
    onChange: (value: string) => void;
    defaultCountry: MuiTelInputCountry;
    error: boolean;
    helperText: string;
}

declare interface primaryCTA {
    ctaClick: () => void;
    icon?: default_2.ReactElement;
    ctaMessage: default_2.ReactNode;
    iconOnly?: boolean;
}

export declare function RadioButton({ value, label, disabled, defaultChecked, handleChange, }: RadioButtonProps): JSX.Element;

declare interface RadioButtonProps {
    value: unknown;
    label: string;
    disabled?: boolean;
    defaultChecked?: boolean;
    handleChange?: (event: default_2.ChangeEvent<HTMLInputElement>) => void;
}

export declare function RadioGroup({ options, label, id, radioProps, name, direction, helperText, value, disabled, defaultValue, onChange, }: RadioGroupProps): JSX.Element;

declare interface RadioGroupProps {
    /** The available options. Each options is a `{ value:string, label: string }` object. */
    options: RadioType[];
    /** Label for the group */
    label: string;
    /** Group ID */
    id: string;
    /** Optional pass through MUI RadioGroupProps. */
    radioProps?: RadioGroupProps_2;
    /** The name, generally this can match the ID. Used for referencing when in forms. */
    name: string;
    /** Direction of laying the radio buttons, can be `horizontal` or `vertical`. Defaults to `horizontal`. */
    direction?: 'horizontal' | 'vertical';
    /** Optional helper text. */
    helperText?: string;
    /** Set the value for controlled components. */
    value?: string;
    /** Disables the component. */
    disabled?: boolean;
    /** Optional default value. This should be the `value` of one of the `option` objects. */
    defaultValue?: string;
    /** Change handler. */
    onChange?: (event: default_2.ChangeEvent<HTMLInputElement>) => void;
}

export declare type RadioType = {
    value: string;
    label: string;
};

export declare function Search<T>({ label, placeholder, disabled, data, getLabel, onSelect, error, helperText, }: SearchProps<T>): JSX.Element;

declare interface SearchProps<T> {
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    data: T[];
    getLabel: (item: T) => string;
    onSelect: (item: T) => void;
    error?: boolean;
    helperText?: string;
}

export declare function Select({ formOptions, selectProps, options, rounded, helperText, value: controlledValue, name, error, height, // default height
    width, }: SelectProps & {
    value?: string;
}): JSX.Element;

declare interface SelectProps {
    formOptions?: FormControlProps;
    selectProps?: SelectProps_2;
    options: SelectType[];
    rounded?: boolean;
    helperText?: string;
    value: string;
    name: string;
    error: boolean;
    height?: string | number;
    width?: string | number;
}

export declare type SelectType = {
    value: string;
    label: string;
};

declare type SelectType_2 = {
    value: string;
    label: string;
};

export declare const SideBar: default_2.FC<SideBarProps>;

declare interface SideBarProps {
    menuItems?: Array<{
        label: string;
        icon: string;
        selected?: boolean;
        divider?: boolean;
        submenu?: Array<{
            label: string;
            icon: string;
        }>;
    }>;
    externalItems?: Array<{
        label: string;
        icon: string;
    }>;
}

export declare function Snackbar({ snackbarTheme, snackBarMessage, buttons, variant, hideIcon, }: SnackbarProps): JSX.Element;

declare interface SnackbarProps {
    snackbarTheme: SnackbarTheme;
    snackBarMessage: string;
    buttons: primaryCTA[];
    variant?: 'default' | 'bordered';
    hideIcon?: boolean;
}

declare enum SnackbarTheme {
    Info = "info",
    Warning = "warning",
    Success = "success"
}

export declare function StatusLabel({ text, paletteColor, }: LabelProps): JSX.Element;

export declare function Stepper(props: StepperPropsExt): JSX.Element;

declare interface StepperPropsExt extends StepperProps {
    steps: StepperStep[];
    activeStepProp?: number;
    stepCompleted: {
        [k: number]: boolean;
    };
    blockViewSteps?: boolean;
    orientation?: 'horizontal' | 'vertical';
}

export declare type StepperStep = {
    label: string;
    description?: string;
    stepFailed?: boolean;
    optional?: boolean;
    skipped?: boolean;
    stepContent: default_2.ReactNode;
};

export declare function Switch({ name, label, checked, disabled, onChange, defaultValue, }: SwitchProps): JSX.Element;

declare interface SwitchProps {
    name: string;
    label: string;
    checked?: boolean;
    disabled?: boolean;
    onChange?: (event: default_2.ChangeEvent<HTMLInputElement>) => void;
    defaultValue?: boolean;
}

export declare function TableHead<T>(props: TableHeaderProps<T> & {
    isSmallScreen?: boolean;
}): JSX.Element;

declare interface TableHeaderProps<T> {
    headCells: HeadCell[];
    numSelected: number;
    onSelectAllClick: (event: ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: keyof T;
    onRequestSort: (event: MouseEvent_2<unknown>, property: keyof T) => void;
    rowCount: number;
    columns?: string[];
    checkbox?: boolean;
    dropdown?: boolean;
    rowButton?: boolean;
    hideHeaderCheckbox?: boolean;
}

export declare function TablePagination({ rows, page, rowsPerPage, onPageChange, onRowsPerPageChange, serverSidePagination, totalRecords, }: CustomPaginationProps): JSX.Element;

export declare function TableRow<T = Record<string, unknown>>({ row, columns, variant, isSelected, onSelect, showMoreButton, onRowClick, onMoreButtonClick, onRowDropdownClick, onQuickLinkClick, className, style, accountIcon, isSmallScreen, }: DataTableRowProps<T> & {
    isSmallScreen?: boolean;
}): JSX.Element;

export declare function TableWrapper({ dataSets, filterButtons, tableIndex, onRowClick, onCheckboxClick, onSelectAll, onQuickLinkClick, onMoreButtonClick, onRowDropdownClick, isFilterApplied, selectedRows, rightPanelContent, sx, style, emptyStateContent, emptyStateTitle, emptyStateSubtitle, emptyStateActionLabel, onEmptyStateAction, emptyStateIcon, onPageChange, onPerPageChange, serverSidePagination, totalRecords, page: externalPage, rowsPerPage: externalRowsPerPage, serverSideSorting, onSort, externalOrder, externalOrderBy, }: TableWrapperProps): JSX.Element;

export declare interface TableWrapperProps {
    dataSets: DataTableProps[];
    filterButtons?: ButtonProps[];
    tableIndex?: number | string;
    onRowClick?: (row: unknown, index: number) => void;
    onCheckboxClick?: (rows: unknown[] | unknown, index: number) => void;
    onSelectAll?: (selectedRows: unknown[], checked: boolean) => void;
    onQuickLinkClick?: (row: unknown, index: number, link: unknown) => void;
    onMoreButtonClick?: () => void;
    onRowDropdownClick?: (expanded: boolean) => void;
    className?: string;
    isFilterApplied?: boolean;
    setIsFilterApplied?: (applied: boolean) => void;
    selectedRows?: unknown[];
    rightPanelContent?: React.ReactNode;
    sx?: SxProps;
    style?: React.CSSProperties;
    emptyStateContent?: React.ReactNode;
    emptyStateTitle?: string;
    emptyStateSubtitle?: string;
    emptyStateActionLabel?: string;
    onEmptyStateAction?: () => void;
    emptyStateIcon?: React.ReactNode;
    onPageChange?: (newPage: number) => void;
    onPerPageChange?: (newPerPage: number) => void;
    serverSidePagination?: boolean;
    totalRecords?: number;
    page?: number;
    rowsPerPage?: number;
    serverSideSorting?: boolean;
    onSort?: (columnKey: string, order: 'asc' | 'desc') => void;
    externalOrder?: 'asc' | 'desc';
    externalOrderBy?: string | number;
}

/**
 * The TextField component is used for normal text inputs.
 */
export declare const TextField: StyledComponent<Fields_2 & MUIStyledCommonProps<Theme_2>, {}, {}>;

export declare const Theme: Theme_2;

declare type ToggleButtonGroupProps = {
    onChange?: (event: default_2.MouseEvent<HTMLElement>, newAlignment: string | null) => void;
    fullWidth?: boolean;
    buttons?: {
        children: default_2.ReactNode;
        toggleValue?: string;
    }[];
    initialSelected?: number;
};

declare function ToggleButtons({ fullWidth, buttons, initialSelected, onChange, }: ToggleButtonGroupProps): JSX.Element;
export { ToggleButtons as ButtonToggle }
export { ToggleButtons }

export declare const Uploader: ({ onChange, onUploadComplete, sx, disabled, error, helperText, maxFiles, }: UploaderProps) => JSX.Element;

declare interface UploaderProps {
    onChange: (files: FileWithPath[]) => void;
    onUploadComplete?: () => void;
    sx?: SxProps;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    maxFiles?: number;
}

export { }


declare module '@mui/material/styles' {
    interface PaletteColor {
        lighter?: string;
        disabledLight?: string;
        disabledDark?: string;
    }
    interface SimplePaletteColorOptions {
        lighter?: string;
        disabledLight?: string;
        disabledDark?: string;
    }
}


declare module '@mui/material/styles' {
    interface TypographyVariants {
        xxsRegular: React.CSSProperties;
        xxsMedium: React.CSSProperties;
        xxsBold: React.CSSProperties;
        xsRegular: React.CSSProperties;
        xsMedium: React.CSSProperties;
        xsBold: React.CSSProperties;
        sRegular: React.CSSProperties;
        sMedium: React.CSSProperties;
        sBold: React.CSSProperties;
        mRegular: React.CSSProperties;
        mMedium: React.CSSProperties;
        mBold: React.CSSProperties;
        lRegular: React.CSSProperties;
        lMedium: React.CSSProperties;
        lBold: React.CSSProperties;
        xlRegular: React.CSSProperties;
        xlMedium: React.CSSProperties;
        xlBold: React.CSSProperties;
        xxlRegular: React.CSSProperties;
        xxlMedium: React.CSSProperties;
        xxlBold: React.CSSProperties;
        xxxxlRegular: React.CSSProperties;
    }
    interface TypographyVariantsOptions {
        xxsRegular?: React.CSSProperties;
        xxsMedium?: React.CSSProperties;
        xxsBold?: React.CSSProperties;
        xsRegular?: React.CSSProperties;
        xsMedium?: React.CSSProperties;
        xsBold?: React.CSSProperties;
        sRegular?: React.CSSProperties;
        sMedium?: React.CSSProperties;
        sBold?: React.CSSProperties;
        mRegular?: React.CSSProperties;
        mMedium?: React.CSSProperties;
        mBold?: React.CSSProperties;
        lRegular?: React.CSSProperties;
        lMedium?: React.CSSProperties;
        lBold?: React.CSSProperties;
        xlRegular?: React.CSSProperties;
        xlMedium?: React.CSSProperties;
        xlBold?: React.CSSProperties;
        xxlRegular?: React.CSSProperties;
        xxlMedium?: React.CSSProperties;
        xxlBold?: React.CSSProperties;
        xxxxlRegular?: React.CSSProperties;
    }
}

declare module '@mui/material/styles' {
    interface Palette {
        tertiary: Palette['primary'];
    }
    interface PaletteOptions {
        tertiary?: PaletteOptions['primary'];
    }
}


declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        tertiary: true;
    }
}
