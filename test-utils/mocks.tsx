import React from 'react';

export const getMockComponents = () => ({

  Button: ({ children, onClick, startIcon, buttonVariant, style, ...props }: any) => (
    <button onClick={onClick} style={style} data-testid="mock-button" {...props}>
      {startIcon}
      {children}
    </button>
  ),

  Breadcrumb: ({ links }: any) => (
    <nav data-testid="breadcrumb" data-links-count={links?.length}>
      {links?.map((link: any) => (
        <span key={link.href}>{link.label}</span>
      ))}
    </nav>
  ),

  Heading: ({ children, as, fontSize, style, ...props }: any) => {
    const Tag = as || 'h1';
    return React.createElement(Tag, { 'data-testid': 'heading', style, ...props }, children);
  },

  ListPageWrapper: ({
    children,
    action,
    onSearchChange,
    searchValue,
    title,
    searchPlaceholder,
    searchIcon,
    breadcrumbLinks,
    contentRef,
  }: any) => (
    <div data-testid="list-page-wrapper">
      <h1>{title}</h1>
      {action}
      <input
        data-testid="search-input"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
      />
      {children}
    </div>
  ),

  TableWrapper: ({
    dataSets,
    onCheckboxClick,
    selectedRows,
    onTabChange,
    selectedTab,
    onPageChange,
    onPerPageChange,
    onQuickLinkClick,
    filterButtons,
    rightPanelContent,
    tableIndex = 0,
    isFilterApplied,
    emptyStateContent,
    sx,
  }: any) => {
    const dataset = dataSets?.[tableIndex];
    const rows = dataset?.rows || [];
    const headCells = dataset?.headCells || [];

    return (
      <div data-testid="table-wrapper" data-table-index={tableIndex} data-filter-applied={isFilterApplied}>
        <div data-testid="table-head-cells" data-cell-count={headCells?.length}>
          {headCells?.map((cell: any) => (
            <span key={cell.id} data-testid={`head-cell-${cell.id}`}>{cell.label}</span>
          ))}
        </div>
        
        <div data-testid="table-rows" data-row-count={rows?.length}>
          {rows?.length > 0 ? (
            rows.map((row: any, idx: number) => (
              <div key={row.id || idx} data-testid={`table-row-${idx}`} data-row-id={row.id}>
                <input
                  type="checkbox"
                  data-testid={`row-checkbox-${idx}`}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    if (isChecked) {
                      onCheckboxClick?.([...(selectedRows || []), row]);
                    } else {
                      onCheckboxClick?.(selectedRows?.filter((r: any) => r.id !== row.id));
                    }
                  }}
                  checked={selectedRows?.some((r: any) => r.id === row.id)}
                />
                <span>{row.id}</span>
                <span>{row.debtorName || row.collection_id}</span>
                {row.links?.href && (
                  <button
                    data-testid={`quick-link-${idx}`}
                    onClick={() => onQuickLinkClick?.(row)}
                  >
                    {row.links.text}
                  </button>
                )}
              </div>
            ))
          ) : (
            emptyStateContent && <div data-testid="empty-state-wrapper">{emptyStateContent}</div>
          )}
        </div>

        <div data-testid="filter-buttons" data-button-count={filterButtons?.length}>
          {filterButtons?.map((btn: any, idx: number) => (
            <button
              key={idx}
              data-testid={`filter-button-${idx}`}
              onClick={btn.onClick}
              className={btn.buttonVariant}
            >
              {btn.children}
            </button>
          ))}
        </div>

        {rightPanelContent && (
          <div data-testid="right-panel-content">{rightPanelContent}</div>
        )}

        <div data-testid="selected-rows-info" data-selected-count={selectedRows?.length}>
          Selected: {selectedRows?.length || 0}
        </div>
      </div>
    );
  },

  TableContainer: ({
    tableData,
    onCheckboxClick,
    selectedRows,
    onTabChange,
    selectedTab,
    onPageChange,
    onPerPageChange,
    onQuickLinkClick,
    filterButtons,
    leftPanelContent,
    rightPanelContent,
    tabs,
    showTabs,
    emptyStateContent,
  }: any) => (
    <div data-testid="table-container">
      <div data-testid="row-count">{tableData?.rows?.length || 0}</div>
      <div data-testid="selected-count">{selectedRows?.length || 0}</div>
      {leftPanelContent}
      {rightPanelContent}
      <button data-testid="tab-all" onClick={() => onTabChange?.(0)}>All</button>
      <button data-testid="tab-needs-action" onClick={() => onTabChange?.(1)}>Needs Action</button>
      <button
        data-testid="filter-btn"
        disabled={Boolean(filterButtons?.[0]?.disabled)}
        onClick={filterButtons?.[0]?.onClick}
      >
        Filter
      </button>

      {/* Render all filter buttons with their provided test ids (if any). */}
      <div data-testid="filter-buttons">
        {(filterButtons || []).map((b: any, idx: number) => (
          <button
            key={idx}
            data-testid={b?.buttonProps?.['data-testid'] || `filter-button-${idx}`}
            disabled={Boolean(b?.disabled)}
            onClick={b?.onClick}
          >
            {b?.children ?? `FilterButton ${idx}`}
          </button>
        ))}
      </div>

      <button data-testid="select-row-1" onClick={() => onCheckboxClick?.([tableData?.rows?.[0]])}>
        Select Row 1
      </button>
      <button data-testid="clear-selection" onClick={() => onCheckboxClick?.([])}>Clear</button>
      <button data-testid="page-change" onClick={() => onPageChange?.(2)}>Next Page</button>
      <button data-testid="per-page-change" onClick={() => onPerPageChange?.(20)}>Change Per Page</button>
      <button data-testid="quick-link" onClick={() => onQuickLinkClick?.(tableData?.rows?.[0])}>
        Quick Link
      </button>

      <div data-testid="empty-state-slot">{emptyStateContent}</div>
    </div>
  ),

  ListRightPanelActions: ({
    selectedCount,
    hasFilters,
    onRemoveFilters,
    onDownloadClick,
    onDeleteClick
  }: any) => (
    <div data-testid="right-panel-actions">
      <span data-testid="selected-count-display">{selectedCount}</span>
      {hasFilters && (
        <button data-testid="remove-filters" onClick={onRemoveFilters}>
          Remove Filters
        </button>
      )}
      <button data-testid="download-btn" onClick={onDownloadClick}>Download</button>
      <button data-testid="delete-btn" onClick={onDeleteClick} disabled={selectedCount === 0}>
        Delete
      </button>
    </div>
  ),

  DeleteConfirmationDialog: ({
    open,
    onClose,
    onPrimaryCTA,
    onSecondaryCTA,
    testIdPrefix = 'delete-dialog',
  }: any) =>
    open ? (
      <div data-testid={`${testIdPrefix}-dialog`}>
        <button data-testid={`${testIdPrefix}-dialog-cancel`} onClick={onClose || onSecondaryCTA}>Cancel</button>
        <button data-testid={`${testIdPrefix}-dialog-confirm`} onClick={onPrimaryCTA}>Confirm</button>
      </div>
    ) : null,

  CommonSnackbar: ({ open, message, severity }: any) =>
    open ? (
      <div data-testid="snackbar" data-severity={severity}>
        {message}
      </div>
    ) : null,

  Dialog: ({
    open,
    name,
    title,
    content,
    onClose,
    onPrimaryCTA,
    onSecondaryCTA,
    onTertiaryCTA,
    primaryCTALabel,
    secondaryCTALabel,
    tertiaryCTALabel,
    ...props
  }: any) => {
    const domProps: Record<string, any> = {};
    for (const [key, value] of Object.entries(props ?? {})) {
      if (
        key === 'role' ||
        key === 'id' ||
        key === 'className' ||
        key === 'style' ||
        key.startsWith('data-') ||
        key.startsWith('aria-')
      ) {
        domProps[key] = value;
      }
    }

    return open ? (
      <div data-testid="dialog" data-name={name} {...domProps}>
        <div data-testid="dialog-title">{title}</div>
        <div data-testid="dialog-content">{content}</div>
        {primaryCTALabel && (
          <button data-testid="dialog-primary-cta" onClick={onPrimaryCTA}>
            {primaryCTALabel}
          </button>
        )}
        {secondaryCTALabel && (
          <button data-testid="dialog-secondary-cta" onClick={onSecondaryCTA}>
            {secondaryCTALabel}
          </button>
        )}
        {tertiaryCTALabel && (
          <button data-testid="dialog-tertiary-cta" onClick={onTertiaryCTA}>
            {tertiaryCTALabel}
          </button>
        )}
        {onClose && !tertiaryCTALabel && !secondaryCTALabel && !primaryCTALabel && (
          <button data-testid="dialog-close" onClick={onClose}>
            Close
          </button>
        )}
      </div>
    ) : null;
  },

  CreateJournyForm: ({ onChange, sections, mode, onSubmit }: any) => (
    <div data-testid="create-journey-form" data-mode={mode}>
      <div data-testid="form-mode">{mode}</div>
      <button
        data-testid="trigger-change"
        onClick={() => onChange('testField', 'testValue')}
      >
        Trigger Change
      </button>
      <button
        data-testid="trigger-postal-checkbox"
        onClick={() => onChange('postalAddressCheckbox', true)}
      >
        Toggle Postal
      </button>
      {onSubmit && (
        <button data-testid="trigger-submit" onClick={() => onSubmit({ testField: 'value' })}>
          Submit Form
        </button>
      )}
      <div data-testid="sections-count">{sections?.length || 0}</div>
    </div>
  ),
});
