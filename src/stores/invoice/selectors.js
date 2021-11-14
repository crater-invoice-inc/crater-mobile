import {createSelector} from 'reselect';
import {capitalize, isEmpty} from '@/constants';
import {BADGE_STATUS_BG_COLOR, BADGE_STATUS_TEXT_COLOR} from '@/utils';

export const formatItems = (invoices, theme) => {
  if (isEmpty(invoices)) {
    return [];
  }

  return invoices.map(item => {
    const {
      invoice_number,
      user: {name, currency} = {},
      status,
      formatted_invoice_date,
      total
    } = item;

    return {
      title: name,
      subtitle: {
        title: invoice_number,
        labelTextColor: BADGE_STATUS_TEXT_COLOR?.[status]?.[theme.mode],
        ...(theme.mode === 'dark'
          ? {
              label: capitalize(status),
              labelOutlineColor: BADGE_STATUS_BG_COLOR?.[status]?.[theme.mode]
            }
          : {
              label: status,
              labelBgColor: BADGE_STATUS_BG_COLOR?.[status]?.[theme.mode]
            })
      },
      amount: total,
      currency,
      rightSubtitle: formatted_invoice_date,
      fullItem: item
    };
  });
};

export const invoicesSelector = createSelector(
  [state => state.invoice?.invoices, state => state.common?.theme],
  (invoices, theme) => formatItems(invoices, theme)
);

export const loadingSelector = createSelector(
  state => state?.invoice,
  store => ({
    isSaving: store?.isSaving,
    isDeleting: store?.isDeleting,
    isLoading: store?.isLoading
  })
);
