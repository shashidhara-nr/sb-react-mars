import { Icon } from '@atoms/index';
import SuccessCard from '@organisms/SuccessCard/SuccessCard';
import FormActionButtons from 'components/common/formActionButtons';
import { Button } from 'dist/standard-bank-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ColIcnLeft, ColIcnPlus, IcnAccountTile, IcnAccTile } from 'public/icons';
import { buildTestId } from 'src/utils/testIds';

type Props = {
  testIdPrefix: string;
  isCreateMode: boolean;
};

const CreateUpdateUserSuccess = ({ testIdPrefix, isCreateMode }: Props) => {
  const t = useTranslations('userDetails');
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleCancel = () => {
    if (isCreateMode) {
      router.push('user-details');
    } else {
      router.push(`/user-details/manage-user?userId=${searchParams?.get('userId')}`);
    }
  };
  const handelNext = () => {
    if (isCreateMode) {
      router.push('/user-details/manage-user?mode=create');
    }
  };
  return (
    <>
      <SuccessCard
        title={t('success')}
        message={t('newUserCreatedAndSubmitted')}
        note={t('optionalContextualFootnote')}
      />
      <FormActionButtons
        testIdPrefix={testIdPrefix}
        nextText={isCreateMode ? t('createAnotherUser') : ''}
        cancelText={isCreateMode ? t('goToUserDetails') : t('cancel')}
        cancelIcon={ColIcnLeft}
        onCancel={handleCancel}
        nextIcon={isCreateMode && ColIcnPlus}
        onNext={handelNext}
        showNext={isCreateMode}
      >
        {isCreateMode && (
          <Button
            buttonVariant={'secondary-on-colour'}
            data-testid={buildTestId(testIdPrefix, 'assign-account-to-user')}
            sx={{
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
            }}
            onClick={() => {}}
            startIcon={
              <Image
                src={ColIcnPlus}
                alt={t('next').toLowerCase()}
                width={24}
                height={24}
                style={{ color: 'blue' }}
              />
            }
            style={{
              height: '48px',
              minHeight: '48px',
              width: 'auto',
              marginRight: '16px',
            }}
          >
            {t('assignAnAccountToThisUser')}
          </Button>
        )}
      </FormActionButtons>
    </>
  );
};

export default CreateUpdateUserSuccess;
