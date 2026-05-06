'use client';

import UserCard from '@atoms/UserCard/UserCard';
import Image from 'next/image';
import Person_Profile from 'public/icons/icn_people_profile.svg';
import { useTranslations } from 'next-intl';
import styles from './AssignedUserAndRoles.module.scss';
import { Select } from 'components/lib/Forms';

function AssignedUserAndRoles() {
  const t = useTranslations();

  return (
    <div>
      <UserCard 
        title={t('assignedUserAndRoles')} 
        icon={<Image src={Person_Profile} alt="Person" />}
      >
        <div className={styles.gridContainer}>
          <div className={styles.fullWidth}>
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
                label: t('selectUserToAssign'),
                labelId: 'select-label',
              }}
              value={''}
              name={''}
              error={false}
            />
          </div>

          <div className={styles.halfWidth}>
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
                label: t('rolesAssignedToUser'),
                labelId: 'select-label',
              }}
              value={''}
              name={''}
              error={false}
            />
          </div>
        </div>
      </UserCard>
    </div>
  );
}

export default AssignedUserAndRoles;