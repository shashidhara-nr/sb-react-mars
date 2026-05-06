'use client';

import { Footer, SideBar } from 'dist/standard-bank-react';
import styles from '@styles/layout.module.scss';
import { ReactNode, useState } from 'react';
import Image from 'next/image';
import SignoutButton from '@atoms/SignoutButton/SignoutButton';
import SideBarN from 'components/common/nav/SideBarN';
import CustomHeader from 'components/common/Header/Header';
import UserDetailsDialog from 'components/common/Header/UserManagement/UserDetails';
import { IconContainer } from '@lib/icons';
import ChangePasswordDialog from 'components/common/Header/UserManagement/ChangePassword';

import BankSupportContactDetails from
  'components/common/Header/UserManagement/BankSupportContactDetails'
import SwitchUserAccount from 'components/common/Header/UserManagement/SwitchUserAccount';


export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState<boolean>(false);

  const [userDetailsAnchor, setUserDetailsAnchor] =
    useState<HTMLElement | null>(null);
  const [changePasswordAnchor, setChangePasswordAnchor] =
    useState<HTMLElement | null>(null);

  const [bankSupportOpen, setBankSupportOpen] = useState<boolean>(false);
  const [bankSupportAnchor, setBankSupportAnchor] =
    useState<HTMLElement | null>(null);


  const [switchUserOpen, setSwitchUserOpen] = useState(false);
  const [switchUserAnchor, setSwitchUserAnchor] =
    useState<HTMLElement | null>(null);


  /**
   * Handles header menu item selection and opens the corresponding popper dialog.
   * 
   * @param index - Index of the selected menu item
   * @param anchorEl - HTML element used to anchor the popper
   */


  const handleMenuItemClick = (index: number, anchorEl: HTMLElement) => {
    if (index === 0) {
      setUserDetailsAnchor(anchorEl);
      setUserDetailsOpen(true);

    } else if (index === 1) {
      setChangePasswordAnchor(anchorEl);
      setChangePasswordOpen(true);

    } else if (index === 2) {

      setSwitchUserAnchor(anchorEl);
      setSwitchUserOpen(true);

    } else if (index === 3) {

      setBankSupportAnchor(anchorEl);
      setBankSupportOpen(true);
    }
  };



  return (
    <div className={styles.layoutContainer}>
      <div className={styles.mainContent}>
        <SideBarN />

        <div className={styles.rightSection}>
          <CustomHeader
            bankLogo={
              <Image alt="Logo" src={IconContainer} height={40} width={120} />
            }
            username="Username"
            userAvatar="/icons/icn_people_profile.svg"
            menuItems={[
              'My details',
              'Change password',
              'Switch user account',
              'Bank support contact details',
            ]}
            onMenuItemClick={handleMenuItemClick}
          >
            <SignoutButton />
          </CustomHeader>

          <main className={styles.contentWrapper}>
            <div className={styles.content}>{children}</div>
          </main>
        </div>
      </div>

      <Footer />

      {/* GLOBAL POPPER for User Details from header*/}
      <UserDetailsDialog
        open={userDetailsOpen}
        anchorEl={userDetailsAnchor}
        onClose={() => setUserDetailsOpen(false)}
        onApply={() => setUserDetailsOpen(false)}
      />

      <ChangePasswordDialog
        open={changePasswordOpen}
        anchorEl={changePasswordAnchor}
        onClose={() => setChangePasswordOpen(false)}
        onApply={(values) => {
          setChangePasswordOpen(false);
        }}
      />
      <BankSupportContactDetails
        open={bankSupportOpen}
        anchorEl={bankSupportAnchor}
        onClose={() => {
          setBankSupportOpen(false);
          setBankSupportAnchor(null);
        }}
        onApply={() => {
          setBankSupportOpen(false);
          setBankSupportAnchor(null);
        }}
      />
      <SwitchUserAccount
        open={switchUserOpen}
        anchorEl={switchUserAnchor}
        onClose={() => {
          setSwitchUserOpen(false);
          setSwitchUserAnchor(null);
        }}
        onApply={(row) => {
          setSwitchUserOpen(false);
          setSwitchUserAnchor(null);
        }}
      />
    </div>
  );
}