export interface LocationTypes {
  id: string
  name: string
}

export interface SectionTypes {
  id: string
  location_id: string
  name: string
}

export interface TenantTypes {
  id: string
  section_id: string
  name: string
  status: string
}

export interface CollectionTypes {
  id: string
  tenant_id: string
  amount: string
  payment_mode: string
  payment_date: string
}

