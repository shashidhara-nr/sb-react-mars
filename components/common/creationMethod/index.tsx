'use client';

import React, { useMemo, useCallback } from 'react';
import Image, { StaticImageData } from 'next/image';
import { CardWrapper, PaymentCard } from 'dist/standard-bank-react';
import { Grid } from "@mui/material";
import { buildTestId } from 'src/utils/testIds';
import africaIcon from '../../../public/icons/africa.svg';
import globIcon from '../../../public/icons/globe.svg';
import styles from './CardSelection.module.scss';

export interface CardSelectionOption {
    value: string;
    label: string;
    description?: string;
    icon: StaticImageData | string;
    iconSelected?: StaticImageData | string;
}

interface CardSelectionProps {
    options: CardSelectionOption[];
    selectedValue: string | null;
    onSelect: (value: string) => void;
    testIdPrefix?: string;
}

const resolveIconSource = (icon: StaticImageData | string): StaticImageData | string => {
    if (typeof icon === 'string') {
        if (icon === 'africa') return africaIcon;
        if (icon === 'globe') return globIcon;
    }
    return icon;
};

export const CardSelection = ({
    options,
    selectedValue,
    onSelect,
    testIdPrefix = 'card-selection',
}: CardSelectionProps) => {

    const cardsPerRow = useMemo((): 2 | 3 | 4 => {
        const length = options.length;
        if (length === 2) return 2;
        if (length >= 4) return 4;
        return 3; // default for 1, 3
    }, [options.length]);

    const handleSelect = useCallback((value: string) => {
        onSelect(value);
    }, [onSelect]);


    const cardElements = useMemo(() =>
        options.map((option) => {
            const isSelected = selectedValue === option.value;
            const iconSrc = resolveIconSource(option.icon);

            return (
                <Grid
                    className={styles.cardGridItem}
                    key={option.value}
                    data-testid={buildTestId(testIdPrefix, 'option', option.value)}
                >
                    <PaymentCard
                        icon={
                            <Image
                                src={iconSrc}
                                alt={option.label}
                                width={40}
                                height={40}
                                unoptimized={typeof iconSrc === 'string' && !iconSrc.startsWith('/')}
                                className={isSelected ? styles.iconSelected : undefined}
                            />
                        }
                        minWidth="max(100%, 360px)"
                        onSelect={() => handleSelect(option.value)}
                        subtitle={option.description || "Optional concise description."}
                        title={option.label}
                        selected={isSelected}
                    />
                </Grid>
            );
        }),
        [options, selectedValue, handleSelect, testIdPrefix]
    );

    return (
        <Grid size={12} data-testid={buildTestId(testIdPrefix, 'container')}>
            <CardWrapper
                cardVariant="image"
                desktopCardsPerRow={cardsPerRow}
                cards={cardElements}
            />
        </Grid>
    );
};

export default CardSelection;
