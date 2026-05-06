'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { Box, Typography, Grid, Card, CardHeader, CardContent, Stack } from '@mui/material';
import { Breadcrumb, Button } from 'dist/standard-bank-react';
import { RootState } from '@store/index';
import { fetchUnpaidOptionById } from '@store/slices/createUnpaidOptionSlice';
import Image from 'next/image';
import IconFormFill from 'public/icons/icn_form_fill.svg';
import IconAccountTile from 'public/icons/icn_account_tile.svg';
import IconBranch from 'public/icons/icn_branch.svg';

interface DetailsRowProps {
  label: string;
  value: string | number | undefined;
}

function DetailsRow({ label, value }: DetailsRowProps) {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      <Typography
        sx={{ minWidth: '180px', fontSize: '0.875rem', fontWeight: 500, color: '#697786' }}
      >
        {label}:
      </Typography>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 400, color: '#3B4451' }}>
        {value || '-'}
      </Typography>
    </Stack>
  );
}

export default function UnpaidOptionDetailsPage({ params }: { params?: { id?: string } }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const managedUnpaidOption = useAppSelector(
    (state) => state.createUnpaidOption?.managedUnpaidOption,
  );

  React.useEffect(() => {
    // Fetch unpaid option by id on mount
    const id = params?.id || '123';
    dispatch(fetchUnpaidOptionById(id) as any);
  }, [dispatch, params?.id]);

  const handleEdit = () => {
    const id = String(managedUnpaidOption?.entityKey ?? params?.id ?? '123');
    router.push(`/setup-and-admin/unpaid-options/manage?id=${id}` as any);
  };

  const handleBack = () => {
    router.push('/setup-and-admin/unpaid-options' as any);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Breadcrumb
            links={[
              { href: '/', label: 'Dashboard' },
              { href: '/setup-and-admin/unpaid-options', label: 'Unpaid options' },
              { href: '#', label: 'Details' },
            ]}
          />
        </Grid>
        <Grid size={12}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 2, mb: 2 }}
          >
            <Typography variant="h5" fontWeight={400} fontSize={28}>
              Unpaid Option Details
            </Typography>
            <Button variant="outlined" onClick={handleEdit} sx={{ height: '40px' }}>
              Edit
            </Button>
          </Stack>
        </Grid>

        {/* Unpaid Option Details Card */}
        <Grid size={12}>
          <Card variant="outlined" sx={{ borderColor: '#e5e7eb', backgroundColor: '#FFFFFF' }}>
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Image src={IconFormFill} alt="form icon" width={24} height={24} />
                  <Typography variant="subtitle1" sx={{ fontSize: '1.25rem', fontWeight: 400 }}>
                    Unpaid option details
                  </Typography>
                </Stack>
              }
              sx={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#F4F5F7', py: 2 }}
            />
            <CardContent sx={{ p: 3 }}>
              <DetailsRow label="Option Name" value={managedUnpaidOption?.optionName} />
              <DetailsRow label="Option Reference" value={managedUnpaidOption?.optionReference} />
              <DetailsRow label="Processing Type" value={managedUnpaidOption?.processingType} />
              <DetailsRow label="Country/Region" value={managedUnpaidOption?.countryRegion} />
              <DetailsRow label="Status" value={managedUnpaidOption?.status} />
            </CardContent>
          </Card>
        </Grid>

        {/* Bank Details Card */}
        <Grid size={12}>
          <Card variant="outlined" sx={{ borderColor: '#e5e7eb', backgroundColor: '#FFFFFF' }}>
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Image src={IconBranch} alt="branch icon" width={24} height={24} />
                  <Typography variant="subtitle1" sx={{ fontSize: '1.25rem', fontWeight: 400 }}>
                    Bank details
                  </Typography>
                </Stack>
              }
              sx={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#F4F5F7', py: 2 }}
            />
            <CardContent sx={{ p: 3 }}>
              <DetailsRow label="Bank Name" value={managedUnpaidOption?.bankName} />
              <DetailsRow label="BIC/SWIFT" value={managedUnpaidOption?.bicSwift} />
              <DetailsRow label="Branch Name" value={managedUnpaidOption?.branchName} />
              <DetailsRow label="Branch Code" value={managedUnpaidOption?.branchCode} />
              <DetailsRow label="Country/Region" value={managedUnpaidOption?.bankCountryRegion} />
            </CardContent>
          </Card>
        </Grid>

        {/* Account Details Card */}
        <Grid size={12}>
          <Card variant="outlined" sx={{ borderColor: '#e5e7eb', backgroundColor: '#FFFFFF' }}>
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Image src={IconAccountTile} alt="account icon" width={24} height={24} />
                  <Typography variant="subtitle1" sx={{ fontSize: '1.25rem', fontWeight: 400 }}>
                    Account details
                  </Typography>
                </Stack>
              }
              sx={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#F4F5F7', py: 2 }}
            />
            <CardContent sx={{ p: 3 }}>
              <DetailsRow label="Account Number" value={managedUnpaidOption?.accountNumber} />
              <DetailsRow label="IBAN" value={managedUnpaidOption?.iban} />
              <DetailsRow label="Account Type" value={managedUnpaidOption?.accountType} />
              <DetailsRow label="Currency" value={managedUnpaidOption?.currency} />
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid size={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={handleBack} sx={{ height: '48px', width: '120px' }}>
              Back
            </Button>
            <Button variant="contained" onClick={handleEdit} sx={{ height: '48px', width: '120px' }}>
              Edit
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
