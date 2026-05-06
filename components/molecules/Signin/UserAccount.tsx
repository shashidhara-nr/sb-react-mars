'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useSelector, useDispatch } from 'react-redux'
import { DataTable, Dialog } from 'dist/standard-bank-react'
import type { RootState } from '../../../store'
import type { UserData } from 'lib/api/authApi'
import { setSelectedCustomerKey, fetchUserByKey } from '../../../store/slices/authSlice'
import type { AppDispatch } from '../../../store'
import { clearSessionCookies } from 'lib/utils/cookieUtils';

const columns = [
  { key: 'customerName', type: 'normal' as const },
  { key: 'customerUserName', type: 'normal' as const },
  { key: 'lastAccessedOn', type: 'normal' as const },
]

interface UserAccountRow {
  id: number
  customerName: string
  customerUserName: string
  lastAccessedOn: string
  userKey: number
  customerKey: number
  isDisabled: boolean
}

function UserAccount() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const t = useTranslations('signinHub')
  const userList = useSelector((state: RootState) => state.auth.userList) as UserData[]
  const loading = useSelector((state: RootState) => state.auth.loading)
  const error = useSelector((state: RootState) => state.auth.error)
  
  const [tableState, setTableState] = useState({
    page: 1,
    rowsPerPage: 5 as 5 | 15 | 30 | 50 | 100,
    selectedRows: [] as number[],
  })

  const [uiState, setUiState] = useState({
    dialogOpen: true,
    isSubmitting: false,
  })

  const formatLastAccessedOn = (timestamp: string): string => {
    if (!timestamp || timestamp === '0') {
      return t('never')
    }

    try {
      const date = new Date(parseInt(timestamp))
      const formatter = new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })

      return formatter.format(date)
    } catch (error) {
      return 'Invalid date'
    }
  }

  const headCells = useMemo(() => [
    { id: 'customerName', label: t('customerName'), disablePadding: false, numeric: false },
    { id: 'customerUserName', label: t('userAccount'), disablePadding: false, numeric: false },
    { id: 'lastAccessedOn', label: t('lastAccessedOn'), disablePadding: false, numeric: false },
  ], [t])

  const tableData: UserAccountRow[] = useMemo(() => {
    if (!userList || !Array.isArray(userList)) {
      return []
    }
    
    const data = userList.map((user, index) => ({
      id: index,
      customerName: user.customerName || 'N/A',
      customerUserName: user.customerUserName || user.userName || 'N/A',
      lastAccessedOn: formatLastAccessedOn(user.lastLoginTimeInMillis || ''),
      userKey: user.userKey,
      customerKey: user.customerKey,
      isDisabled: user.reasonList && user.reasonList.length > 0,
    }))

    return data.sort((a, b) => a.customerName.localeCompare(b.customerName))
  }, [userList])

  const handleCloseDialog = () => {
    clearSessionCookies();
    router.push('/signin');
  }

  const handlePageChange = (newPage: number) => {
    setTableState((prev) => ({ ...prev, page: newPage }))
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setTableState((prev) => ({ ...prev, rowsPerPage: newRowsPerPage as 5 | 15 | 30 | 50 | 100, page: 1 }))
  }

  const handleUserSelected = async () => {
    const selectedIndex = tableState.selectedRows[0]
    const selectedUser = tableData[selectedIndex]

    if (selectedUser) {
      setUiState((prev) => ({ ...prev, isSubmitting: true }))
      dispatch(setSelectedCustomerKey(selectedUser.customerKey))
      await dispatch(fetchUserByKey(selectedUser.userKey))
      router.push('/setup-and-admin/beneficiary')
    }
  }

  const handleCheckboxClick = (row: any, index: number) => {
    if (row.isDisabled) {
      return
    }
    
    if (tableState.selectedRows.length > 0 && tableState.selectedRows[0] === index) {
      setTableState((prev) => ({ ...prev, selectedRows: [] }))
    } else {
      setTableState((prev) => ({ ...prev, selectedRows: [index] }))
    }
  }

  if (loading && (!userList || userList.length === 0)) {
    return (
      <div style={{ padding: '20px' }}>
        <Dialog
          name="user-selection-dialog"
          title={t('selectUserAccountLabel')}
          open={uiState.dialogOpen}
          maxWidth="917px"
          content={<div style={{ padding: '20px', textAlign: 'center' }}>{t('loading')}</div>}
          onSecondaryCTA={handleCloseDialog}
          secondaryCTALabel={t('cancelButton')}
        />
      </div>
    )
  }

  if (error && (!userList || userList.length === 0)) {
    return (
      <div style={{ padding: '20px' }}>
        <Dialog
          name="user-selection-dialog"
          title={t('selectUserAccountLabel')}
          open={uiState.dialogOpen}
          maxWidth="917px"
          content={<div style={{ padding: '20px', color: '#DC0A0A' }}>{t('userListError')}</div>}
          onSecondaryCTA={handleCloseDialog}
          secondaryCTALabel={t('cancelButton')}
        />
      </div>
    )
  }

  const paginatedData = tableData.slice((tableState.page - 1) * tableState.rowsPerPage, tableState.page * tableState.rowsPerPage)

  return (
    <div style={{ padding: '20px' }}>
      <Dialog
        name="user-selection-dialog"
        data-testid="user-account-dialog"
        title={t('selectUserAccountLabel')}
        open={uiState.dialogOpen}
        maxWidth="917px"
        content={
          <div style={{ marginTop: '-6px', paddingLeft: '10px', paddingRight: '10px', marginLeft: '-24px', marginRight: '-24px' }}>
            <div
              data-testid="user-accounts-table-container"
              style={{
                border:  '1px solid #d1d5db',
                borderRadius:  '8px',
                overflow:  'hidden',
                backgroundColor:  '#ffffff'
              }}
            >
              <DataTable
                data-testid="user-accounts-table"
                columns={columns}
                headCells={headCells}
                rows={tableData}
                page={tableState.page}
                rowsPerPage={tableState.rowsPerPage}
                onPageChange={handlePageChange}
                onPerPageChange={handleRowsPerPageChange}
                rowVariant="checkbox"
                onCheckboxClick={handleCheckboxClick}
                hideHeaderCheckbox={true}
                singleSelect={true}
              />
            </div>
          </div>
        }
        primaryCTALabel={t('useSelectedButton')}
        secondaryCTALabel={t('cancelButton')}
        onPrimaryCTA={handleUserSelected}
        onSecondaryCTA={handleCloseDialog}
        primaryCTALoading={uiState.isSubmitting}
        primaryCTADisabled={tableState.selectedRows.length === 0 || uiState.isSubmitting}
        secondaryCTADisabled={uiState.isSubmitting}
        primaryCTAWidth={154}
        primaryCTAHeight={48}
        secondaryCTAWidth={82}
        secondaryCTAHeight={48}
      />
    </div>
  )
}

export default UserAccount
