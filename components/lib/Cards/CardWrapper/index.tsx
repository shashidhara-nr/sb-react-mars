import Grid from '@mui/material/Grid';
import { RowLayout, GridGap, Columns } from 'components/lib/config';

interface CardWrapperProps {
  cardVariant?: 'direction' | 'image';
  cards: React.ReactNode[];
  desktopCardsPerRow: 2 | 3 | 4;
}

export default function CardWrapper({
  cards,
  cardVariant,
  desktopCardsPerRow,
}: CardWrapperProps) {
  let mobileRowLayout: number;
  let tabletRowLayout: number;
  let desktopRowLayout: number;
  let gridGapLargeScreen;
  let gridGapSmallScreen;
  let rowGap;

  switch (cardVariant) {
    case 'direction':
      gridGapLargeScreen = GridGap.none;
      gridGapSmallScreen = GridGap.none;
      mobileRowLayout = RowLayout.four;
      tabletRowLayout = RowLayout.eight;
      desktopRowLayout =
        cards.length > 4 ? RowLayout.three : RowLayout.twelve / cards.length;
      rowGap = GridGap.none;
      break;
    case 'image':
    default:
      gridGapLargeScreen = GridGap.small;
      gridGapSmallScreen = GridGap.medium;
      switch (desktopCardsPerRow) {
        case 2:
          mobileRowLayout = RowLayout.four;
          tabletRowLayout = RowLayout.four;
          desktopRowLayout = RowLayout.six;
          break;
        case 3:
          mobileRowLayout = RowLayout.four;
          desktopRowLayout = RowLayout.four;
          tabletRowLayout = RowLayout.four;
          break;
        default:
          mobileRowLayout = RowLayout.four;
          tabletRowLayout = RowLayout.four;
          desktopRowLayout = RowLayout.three;
          break;
      }
  }
  return (
    <Grid
      container
      alignItems="stretch"
      spacing={{ xs: gridGapSmallScreen || rowGap, md: gridGapLargeScreen }}
      columns={{ xs: Columns.mobile, md: Columns.tablet, lg: Columns.desktop }}
      sx={{
        rowGap: rowGap,
      }}
    >
      {cards?.map((card, index) => (
        <Grid
          key={index}
          size={{
            xs: mobileRowLayout,
            md: tabletRowLayout,
            lg: desktopRowLayout,
          }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {card}
        </Grid>
      ))}
    </Grid>
  );
}
