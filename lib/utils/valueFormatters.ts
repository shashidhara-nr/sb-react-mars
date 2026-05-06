export const camelCaseToTitleCase = (camelCaseString: string): string => {
    if (!camelCaseString) return '';

    // Insert space before uppercase letters and capitalize first letter
    return camelCaseString
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
};

const BANK_NAME_MAP: Record<string, string> = {
    standardBankSouthAfrica: 'Standard Bank South Africa',
    stanbicBankKenyaLimited: 'Stanbic Bank Kenya Limited',
    nedbankLimited: 'Nedbank Limited',
    firstNationalBank: 'First National Bank',
    capitecBank: 'Capitec Bank',
    standardBankDEAngola: 'Standard Bank DE Angola',
};

export const formatBankName = (bankValue: string): string => {
    return BANK_NAME_MAP[bankValue] || camelCaseToTitleCase(bankValue);
};

export const formatDisplayValue = (value: string): string => {
    return camelCaseToTitleCase(value);
};

export const addDisplayValues = <T extends Record<string, any>>(
    data: T[],
    propertyKey: keyof T,
    formatterFn: (value: string) => string
): Array<T & { [key: string]: any }> => {
    return data.map((item) => ({
        ...item,
        [`${String(propertyKey)}Display`]: formatterFn(String(item[propertyKey])),
    }));
};
