import {
  textMatches,
  textEquals,
  matchesSearchText,
  TAB_STATUS_MAP,
  STATUS_TAB_KEYS,
  bopThirdPartiesUrl,
  getBreadcrumbLinks,
} from '../../../app/[locale]/setup-and-admin/bop-third-parties/bopThirdPartyHelper';


describe('BopThirdPartyHelper', () => {
  describe('textMatches', () => {
    it('returns true for case-insensitive partial match', () => {
      expect(textMatches('Test Company', 'test')).toBe(true);
      expect(textMatches('Test Company', 'COMPANY')).toBe(true);
      expect(textMatches('Test Company', 'comp')).toBe(true);
    });

    it('returns false when text does not contain filter', () => {
      expect(textMatches('Test Company', 'individual')).toBe(false);
      expect(textMatches('John Doe', 'smith')).toBe(false);
    });

    it('returns false when text is undefined', () => {
      expect(textMatches(undefined, 'test')).toBe(false);
    });

    it('returns false when text is empty string', () => {
      expect(textMatches('', 'test')).toBe(false);
    });

    it('handles special characters correctly', () => {
      expect(textMatches('Company & Co.', '&')).toBe(true);
      expect(textMatches('Test-Company', '-')).toBe(true);
    });

    it('is case-insensitive for both text and filter', () => {
      expect(textMatches('ABC Company', 'abc company')).toBe(true);
      expect(textMatches('abc company', 'ABC COMPANY')).toBe(true);
    });
  });

  describe('textEquals', () => {
    it('returns true for exact case-insensitive match', () => {
      expect(textEquals('Company', 'company')).toBe(true);
      expect(textEquals('COMPANY', 'company')).toBe(true);
      expect(textEquals('Company', 'COMPANY')).toBe(true);
    });

    it('returns false for partial matches', () => {
      expect(textEquals('Test Company', 'test')).toBe(false);
      expect(textEquals('Company', 'comp')).toBe(false);
    });

    it('returns false when text does not match', () => {
      expect(textEquals('Company', 'Individual')).toBe(false);
      expect(textEquals('Active', 'Inactive')).toBe(false);
    });

    it('returns false when text is undefined', () => {
      expect(textEquals(undefined, 'test')).toBe(false);
    });

    it('returns false when text is empty string', () => {
      expect(textEquals('', 'test')).toBe(false);
    });

    it('handles whitespace correctly', () => {
      expect(textEquals('Test', 'Test ')).toBe(false);
      expect(textEquals(' Test', 'Test')).toBe(false);
    });
  });

  describe('matchesSearchText', () => {
    const mockRow = {
      thirdPartyName: 'Test Company',
      bopThirdPartyID: 'BOP12345',
      status: { value: 'Active' },
    };

    it('returns true when search is empty', () => {
      expect(matchesSearchText(mockRow, '')).toBe(true);
    });

    it('returns true when third party name matches search', () => {
      expect(matchesSearchText(mockRow, 'test')).toBe(true);
      expect(matchesSearchText(mockRow, 'company')).toBe(true);
      expect(matchesSearchText(mockRow, 'test company')).toBe(true);
    });

    it('returns true when BOP ID matches search', () => {
      expect(matchesSearchText(mockRow, 'bop')).toBe(true);
      expect(matchesSearchText(mockRow, '12345')).toBe(true);
      // Note: searchLower parameter should already be lowercase
      expect(matchesSearchText(mockRow, 'bop12345')).toBe(true);
    });

    it('returns false when neither field matches', () => {
      expect(matchesSearchText(mockRow, 'nonexistent')).toBe(false);
      expect(matchesSearchText(mockRow, 'xyz')).toBe(false);
    });

    it('handles row with undefined thirdPartyName', () => {
      const rowWithoutName = { ...mockRow, thirdPartyName: undefined };
      expect(matchesSearchText(rowWithoutName, 'test')).toBe(false);
      expect(matchesSearchText(rowWithoutName, 'bop')).toBe(true);
    });

    it('handles row with undefined bopThirdPartyID', () => {
      const rowWithoutId = { ...mockRow, bopThirdPartyID: undefined };
      expect(matchesSearchText(rowWithoutId, 'bop')).toBe(undefined);
      expect(matchesSearchText(rowWithoutId, 'test')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(matchesSearchText(mockRow, 'test')).toBe(true);
      expect(matchesSearchText(mockRow, 'company')).toBe(true);
      expect(matchesSearchText(mockRow, 'bop12345')).toBe(true);
    });
  });

  describe('Constants', () => {
    it('STATUS_TAB_KEYS contains correct tab keys', () => {
      expect(STATUS_TAB_KEYS).toEqual([
        'allRecords',
        'needsAction',
        'awaitingApproval',
        'activeTab',
      ]);
    });

    it('TAB_STATUS_MAP maps tabs to status values', () => {
      expect(TAB_STATUS_MAP[0]).toBeUndefined(); // All records
      expect(TAB_STATUS_MAP[1]).toBe('Needs Action');
      expect(TAB_STATUS_MAP[2]).toBe('Awaiting Approval');
      expect(TAB_STATUS_MAP[3]).toBe('Active');
    });

    it('bopThirdPartiesUrl contains all required URLs', () => {
      expect(bopThirdPartiesUrl.dashboard).toBe('/');
      expect(bopThirdPartiesUrl.home).toBe('/setup-and-admin/bop-third-parties');
      expect(bopThirdPartiesUrl.create).toBe('/setup-and-admin/bop-third-parties/create');
      expect(bopThirdPartiesUrl.details).toBe('/setup-and-admin/bop-third-parties/details');
      expect(bopThirdPartiesUrl.manage).toBe('/setup-and-admin/bop-third-parties/manage');
    });
  });

  describe('getBreadcrumbLinks', () => {
    const mockTranslate = (key: string) => `translated_${key}`;

    it('returns correct links for home page', () => {
      const links = getBreadcrumbLinks('home', mockTranslate);
      
      expect(links).toHaveLength(2);
      expect(links[0]).toEqual({
        href: '/',
        label: 'translated_dashboard',
      });
      expect(links[1]).toEqual({
        href: '/setup-and-admin/bop-third-parties',
        label: 'translated_pageTitle',
      });
    });

    it('returns correct links for create page', () => {
      const links = getBreadcrumbLinks('create', mockTranslate);
      
      expect(links).toHaveLength(3);
      expect(links[2]).toEqual({
        href: '/setup-and-admin/bop-third-parties/create',
        label: 'translated_createPageTitle',
      });
    });

    it('returns correct links for details page', () => {
      const links = getBreadcrumbLinks('details', mockTranslate);
      
      expect(links).toHaveLength(3);
      expect(links[2]).toEqual({
        href: '/setup-and-admin/bop-third-parties/details',
        label: 'translated_createPageTitle',
      });
    });

    it('returns correct links for manage page with params', () => {
      const params = { id: '123', type: 'Company', postal: true };
      const links = getBreadcrumbLinks('manage', mockTranslate, params);
      
      expect(links).toHaveLength(3);
      expect(links[2].href).toContain('/setup-and-admin/bop-third-parties/manage');
      expect(links[2].href).toContain('id=123');
      expect(links[2].href).toContain('type=Company');
      expect(links[2].href).toContain('postal=true');
    });

    it('returns base links for manage page without params', () => {
      const links = getBreadcrumbLinks('manage', mockTranslate);
      
      expect(links).toHaveLength(2);
    });

    it('uses translation function correctly', () => {
      const mockT = jest.fn((key: string) => key);
      getBreadcrumbLinks('home', mockT);
      
      expect(mockT).toHaveBeenCalledWith('dashboard');
      expect(mockT).toHaveBeenCalledWith('pageTitle');
    });
  });

  describe('Integration - Filtering Logic', () => {
    const mockRows = [
      {
        id: '1',
        thirdPartyName: 'ABC Company',
        bopThirdPartyID: 'BOP001',
        entityType: 'Company',
        countryRegion: 'South Africa',
        status: { value: 'Active' },
      },
      {
        id: '2',
        thirdPartyName: 'XYZ Corp',
        bopThirdPartyID: 'BOP002',
        entityType: 'Company',
        countryRegion: 'Kenya',
        status: { value: 'Needs Action' },
      },
      {
        id: '3',
        thirdPartyName: 'John Doe',
        bopThirdPartyID: 'BOP003',
        entityType: 'Individual',
        countryRegion: 'Nigeria',
        status: { value: 'Awaiting Approval' },
      },
    ];

    it('filters by entity type correctly', () => {
      const filtered = mockRows.filter(row => 
        textEquals(row.entityType, 'Company')
      );
      
      expect(filtered).toHaveLength(2);
      expect(filtered[0].entityType).toBe('Company');
      expect(filtered[1].entityType).toBe('Company');
    });

    it('filters by partial name match', () => {
      const filtered = mockRows.filter(row => 
        textMatches(row.thirdPartyName, 'company')
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].thirdPartyName).toBe('ABC Company');
    });

    it('filters by search text across multiple fields', () => {
      const searchTerm = 'bop002';
      const filtered = mockRows.filter(row => 
        matchesSearchText(row, searchTerm.toLowerCase())
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].bopThirdPartyID).toBe('BOP002');
    });

    it('combines multiple filters correctly', () => {
      const filtered = mockRows.filter(row => {
        const passesEntityFilter = textEquals(row.entityType, 'Company');
        const passesCountryFilter = textMatches(row.countryRegion, 'Kenya');
        return passesEntityFilter && passesCountryFilter;
      });
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });

    it('handles no filters applied (all pass)', () => {
      const filterValue = '';
      const filtered = mockRows.filter(row => {
        if (!filterValue) return true;
        return textEquals(row.entityType, filterValue);
      });
      
      expect(filtered).toHaveLength(3);
    });
  });
});
