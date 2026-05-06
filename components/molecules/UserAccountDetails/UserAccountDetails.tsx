'use client';

import UserCard from '@atoms/UserCard/UserCard';
import Image from 'next/image';
import Person from 'public/icons/icn_people_1_nametag.svg';
import { DatePicker, TextField, Select } from '../../../dist/standard-bank-react';
import { useTranslations } from 'next-intl';
import styles from './UserAccountDetails.module.scss';

function UserAccountDetails() {
  const t = useTranslations();

  return (
    <div>
      <UserCard title={t('userAccountDetails')} icon={<Image src={Person} alt="Person" />}>
        <div className={styles.gridContainer}>
          <div className={styles.textField}>
            <TextField
              defaultValue=""
              label={t('userAccountName')}
              type="text"
              placeholder={t('userAccountName')}
              name="accountName"
            />
          </div>
          <div className={styles.emptySpace}></div>

          <div className={styles.datePicker}>
            <DatePicker
              actions={[
                {
                  label: 'Tertiary Button',
                  onClick: () => {},
                  variant: 'tertiary',
                },
                {
                  label: 'Tertiary Button',
                  onClick: () => {},
                  variant: 'tertiary',
                },
              ]}
              label={t('startDate')}
            />
          </div>
          <div className={styles.datePicker}>
            <DatePicker
              actions={[
                {
                  label: 'Tertiary Button',
                  onClick: () => {},
                  variant: 'tertiary',
                },
                {
                  label: 'Tertiary Button',
                  onClick: () => {},
                  variant: 'tertiary',
                },
              ]}
              label={t('endDate')}
            />
          </div>

          <div className={styles.selectField}>
            <Select
              helperText="This is a helper text"
              options={[
                {
                  label: 'Option 1',
                  value: 'option1',
                },
                {
                  label: 'Option 2',
                  value: 'option2',
                },
              ]}
              selectProps={{
                label: t('authorisationClass'),
                labelId: 'select-label',
              }}
              value={''}
              name={'option1'}
              error={false}
            />
          </div>
          <div className={styles.countrySelect}>
            {/* <CountrySelect
              label="Language"
              onChange={() => {}}
              placeholder="Language"
              disabled={false}
              error={false}
              helperText={''}
            /> */}
          </div>
        </div>
      </UserCard>
    </div>
  );
}

export default UserAccountDetails;
