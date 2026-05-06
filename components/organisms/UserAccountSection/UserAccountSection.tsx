'use client'
import { Grid } from "@mui/material";
import { Button } from 'components/lib/Forms';
import TableContainer from "@molecules/TableContainer/TableContainer";
import { useRouter } from 'next/navigation';
import { mockUserAccount } from "@lib/mock/mockUserAccount";
import BreadcrumbList from "components/lib/Page/Breadcrumb";
import { Heading } from "components/lib/Page";

const UserAccountSection = () => {
    const router = useRouter();
    return (
        <>
            <Grid container spacing={2} padding={2} style={{ marginBottom: '20px' }}>
                <Grid size={12}>
                    <BreadcrumbList
                        links={[
                            {
                                href: '/',
                                label: 'Dashboard'
                            },
                            {
                                href: '/setup-and-admin',
                                label: 'Setup and Admin'
                            },
                            {
                                href: '/user-account-hub',
                                label: 'User Account Hub'
                            }
                        ]} />

                </Grid>
                <Grid size={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Heading as="h4" fontSize="28px">User Account Hub</Heading>
                    <Button
                        buttonVariant="secondary"
                        iconPosition="start"
                        imageSrc='/icons/col-icon-left.svg'
                        style={{ height: 48 }}
                        onClick={() => router.push('/create-a-user-account')}
                    >
                        CREATE A USER ACCOUNT
                    </Button>
                </Grid>
                <TableContainer tableData={mockUserAccount} />
            </Grid>
        </>
    );

}
export default UserAccountSection;