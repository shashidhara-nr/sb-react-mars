import CollectionTypeLogic, { collectionTypeZodSchema } from './collectionTypeLogic'

describe('CollectionTypeLogic', () => {
  describe('collectionTypeZodSchema', () => {
    it('validates a valid collection type object', () => {
      const validData = {
        name: 'Test Collection',
        authorisationProfile: 'Profile A',
        allowAdHoc: true,
        hostToHostDefault: false,
        currency: 'USD',
        adHocLimit: '1000',
      }

      const result = collectionTypeZodSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects when name is missing', () => {
      const invalidData = {
        name: '',
        authorisationProfile: 'Profile A',
        allowAdHoc: true,
        hostToHostDefault: false,
        currency: 'USD',
      }

      const result = collectionTypeZodSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Collection type name is required')
      }
    })

    it('rejects when authorisation profile is missing', () => {
      const invalidData = {
        name: 'Test Collection',
        authorisationProfile: '',
        allowAdHoc: true,
        hostToHostDefault: false,
        currency: 'USD',
      }

      const result = collectionTypeZodSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Authorisation profile is required')
      }
    })

    it('rejects when currency is missing', () => {
      const invalidData = {
        name: 'Test Collection',
        authorisationProfile: 'Profile A',
        allowAdHoc: true,
        hostToHostDefault: false,
        currency: '',
      }

      const result = collectionTypeZodSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Currency is required')
      }
    })

    it('validates boolean fields correctly', () => {
      const data = {
        name: 'Test Collection',
        authorisationProfile: 'Profile A',
        allowAdHoc: false,
        hostToHostDefault: true,
        currency: 'EUR',
      }

      const result = collectionTypeZodSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.allowAdHoc).toBe(false)
        expect(result.data.hostToHostDefault).toBe(true)
      }
    })
  })

  it('exports the schema through the default object', () => {
    expect(CollectionTypeLogic.collectionTypeZodSchema).toBeDefined()
    expect(CollectionTypeLogic.collectionTypeZodSchema).toBe(collectionTypeZodSchema)
  })
})
