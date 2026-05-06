"use client";

import { Box } from '@mui/material';
import BreadcrumbList from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page/Heading';

export default function TransactionalPage({ params }: { params: { locale: string } }) {
	return (
		<Box sx={{ p: 2 }}>
			<BreadcrumbList
				links={[
					{ href: '/', label: 'Dashboard' },
					{ href: '/audit-and-approve', label: 'Audit & Approve' },
					{ href: '/audit-and-approve/transactional', label: 'Transactional' },
				]}
			/>
			<Heading as="h4" fontSize="28px" style={{ marginBottom: '24px', marginTop: '24px' }}>
				Transactional Approvals
			</Heading>
			<p>Review and approve transactional activities.</p>
		</Box>
	);
}
