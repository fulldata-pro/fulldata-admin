/**
 * Report Types - Consolidated from site-v2
 * Types for all report data structures
 */

// ===========================================
// Utility Types
// ===========================================

export type Kick<T, K extends keyof T> = Omit<T, K>

// ===========================================
// PEOPLE Types
// ===========================================

export enum PeopleDataTypes {
  summary = 'summary',
  addressData = 'addressData',
  contactData = 'contactData',
  laborData = 'laborData',
  bonds = 'bonds',
  personalProperty = 'personalProperty',
  taxes = 'taxes',
  financialSituation = 'financialSituation',
  officialBulletin = 'officialBulletin',
  isBanked = 'isBanked',
  nicDomains = 'nicDomains',
}

export interface PeopleData {
  summary: PeopleSummaryData
  addressData: PeopleAddressData[]
  contactData: PeopleContactData
  laborData: LaborData
  bonds: BondsData
  personalProperty: PersonalPropertyData
  taxes: TaxData
  financialSituation: FinancialSituationData
  officialBulletin: OfficialBulletinData
  isBanked: boolean
  nicDomains: NicDomains[]
  corporateRelations?: CorporateRelation[]
  reportingEntity?: ReportingEntity
}

export interface NicDomains {
  domain: string
  status: 'VERIFIED' | 'NOT_VERIFIED'
}

export interface PeopleSummaryData {
  firstName: string
  lastName: string
  taxId: number | string
  nationalId: number | string
  nationalIdVersion: string
  nationality: string
  birthDate: number
  deathDate: number
  age: number
  sex: string
  maritalStatus: MaritalStatus | string
  score: Score[]
  socioeconomicLevel: SocioeconomicLevel | string
  nsePercentile?: number
  nseAverageIncome?: number
  scoreService?: number
  scoreAlternative?: number
  ratingAlternative?: number
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWER = 'WIDOWER',
}

export interface Score {
  period: string
  value: string
}

export enum SocioeconomicLevel {
  'A' = 'A',
  'B' = 'B',
  'C1' = 'C1',
  'C2' = 'C2',
  'C3' = 'C3',
  'D1' = 'D1',
  'D2' = 'D2',
  'E' = 'E',
}

export interface PeopleAddressData {
  address: string
  addressNumber: string
  floor: string | null
  appartment: string | null
  addressPhone: string | null
  postalCode: string
  city: string
  province: string
  country: string | null
}

export interface PeopleContactData {
  emails: string[]
  phones: PeoplePhoneData[]
}

export interface PeoplePhoneData {
  code: string
  phoneNumber: string
  operator?: string
  wsp?: boolean
}

export interface CreditSummaryByPeriod {
  last6Months?: PeriodSummary
  last12Months?: PeriodSummary
  last24Months?: PeriodSummary
}

export interface PeriodSummary {
  worstSituation: string
  totalBanks: number
  totalAmount: number
}

export interface ContributionStats {
  employersLast3Months?: number
  employeePaymentsLast12Months?: PaymentStats
  employerPaymentsLast12Months?: PaymentStats
}

export interface PaymentStats {
  unpaid: number
  paid: number
  partialPaid: number
}

export interface CurrentHealthInsurance {
  name: string
  code: string
  registrationDate?: number
  holderCondition?: string
  relationship?: string
}

export interface ClanaeCodes {
  level3?: {
    code: string
    description: string
  }
  level5?: {
    code: string
    description: string
  }
}

export interface WorkersCompensationInsurance {
  insuranceCompany?: string | null
  contractNumber?: string | null
  startDate?: number | null
  endDate?: number | null
  hasPaymentDefault?: boolean
}

export interface LaborData {
  activities: ActivityData[]
  taxRegistrationWeeks: string
  autonomus: string | null
  laborSituation: string[]
  aportHistory: {
    employerContributions: number | null
    autonomousContributions: number | null
  } | null
  employer: boolean
  employerHistory: EmployeeData[]
  inSociety: boolean
  retired: boolean
  osCondition: string | null
  osDate: number | null
  osCode: string | null
  osName: string | null
  osRelationship: string | null
  socialSecurity: string[] | null
  salary?: SalaryData[]
  contributionStats?: ContributionStats
  workersCompensationInsurance?: WorkersCompensationInsurance
}

export interface ActivityData {
  type?: string
  description: string
  startDate?: number
  sector?: string
  category?: string
  ciiu?: number
  clanaeCodes?: ClanaeCodes
}

export interface ContributionData {
  taxId: number
  period: number
  payed: boolean
}

export interface ContributionsEmployerData {
  period: string
  employees: { name: string; taxId: number }[]
  employeesNumber: number
}

export interface EmployeeData {
  name: string
  state?: 'Activo' | 'Inactivo'
  salaryCategory?: string
  startDate: number
  finishDate: number
  activity?: string
  address: PeopleAddressData
  employeeCount: number
  taxId: number
}

export interface MonotributeData {
  type: string
  category: string
  gcia: string
  iva: string
  inSociety: boolean
  startDate: number
  finishDate: number
  code: string | null
}

export interface SalaryData {
  period: string
  amount: number
}

export interface BondsData {
  main: BondData[]
  others?: BondData[]
}

export interface BondData {
  taxId: number
  name: string
  birthDate: number
  relation: string
  sex: string
  age: number | null
}

export interface PersonalPropertyData {
  buildings: BuildingData[]
  cars: CarData[]
  carsEmbargoes: CarDebtData[]
  registeredTrademarks: RegisteredTrademarks[]
  registeredTrademarksCount?: number
}

export interface RegisteredTrademarks {
  designatedTerritory: string
  country: string
  name: string
  applicationNumber: string
  status: string
  niceClass: string
  applicantName: string
  type: string
  applicationDate: string
  registrationDate: string
  registrationNumber: string
  image: string
}

export interface BuildingData {
  landSurface: number
  buildingSurface: number
  address: string
}

export interface CarData {
  licensePlate: string
  buyed: number
  model: string
  brand: string
  origin: string
  year: number
  type: string
  manufactured: number
  inPossession: boolean
}

export interface CarDebtData {
  licensePlate: string
  debt: string
  valuation: string
  brand: string
  province: string
}

export interface TaxData {
  contributions: ContributionData[]
  contributionsEmployer: ContributionsEmployerData[]
  gciaInscription: boolean
  gciaInscriptionCondition: string
  gciaInscriptionDate: number
  ivaInscription: boolean
  ivaInscriptionCondition: string
  ivaInscriptionDate: number
  history: HistoryContributionData[]
  autonomousDate: number
  autonomous: number
  autonomousAct: string
  monotribute: MonotributeData
  taxAuthorityDetails?: TaxAuthorityDetails
}

export interface HistoryContributionData {
  category: string
  code: string
  finishDate: number
  gcia: string
  inSociety: boolean
  iva: string
  startDate: number
  type: string
}

export interface FinancialSituationData {
  veraz: Veraz | null
  operativeBanks: BankInfoData[]
  bcraInfo: BankInfoData[]
  bouncedChecks: CheckData[]
  bankDebtors: string[]
  bankruptcy24m: string | null
  banks: string
  banksAmount: string
  checks24m: string | null
  lawsuits24m: string | null
  monthlyComparison: string | null
  nonPaid6m: string
  nonPaid6mAmount: string
  worstSituation: string
  worstSituationPercentage: string
  ansesBenefits: string | null
  historicalDebt: HistoricalDebt[]
  creditMetrics?: CreditMetrics
  bcraAntiquityMonths?: number
  creditSummaryByPeriod?: CreditSummaryByPeriod
}

export interface Veraz {
  banksObligations24m: number
  category: string
  incomePredictor: string
  incomePredictorRange: string
  incomePredictorText: string
  message: string
  amountObligations24m: number
  activeObsBa: ActiveObsBa[]
  ok: boolean
  scoreRange: number
  scoreSegment: string
  scoreText: string
  tokenCA: string
}

export interface BankInfoData {
  name: string
  situation: string
  amount?: string
  period?: number
  loan?: number
  type?: BankDataType
  bankCode?: string
}

export enum BankDataType {
  BANKING_ENTITY = 'BANKING_ENTITY',
  FINANCIAL = 'FINANCIAL',
  UNKNOWN = 'UNKNOWN',
}

export interface CheckData {
  number: string
  rejectedDate: number
  amount: string
  payedDate: number
  condition: string
  liftingDate: number
  penalty: string
}

export interface HistoricalDebt {
  period: number
  amount: number | string
}

export interface ActiveObsBa {
  entity: string
  amount: number
  date: number
}

export interface OfficialBulletinData {
  bulletin: BulletinData[]
  embargoes: EmbargoData[]
  participationSocietal: ParticipationData[]
  trialsActor: TrialData[]
  trialsDefendant: TrialData[]
}

export interface BulletinData {
  source: string
  rz: string
  date: number
  report: string
}

export interface EmbargoData {
  date: number
  jobNumber: number
  proceedings: string
  liftingDate: number
  jobDate: number
  cover: string
  court: string
  address: string
  phone: string
}

export interface ParticipationData {
  source: string
  publishDate: number
  constitutionDate: number
  charge: string
  file: string
  rz: string
  bulletinId: number
}

export interface TrialData {
  defendant: string
  rol: string
  proceedings: string
  text: string
  date: number
  actor: string
  province: string
  peoples: string
  object: string
  court: string
}

export interface CreditMetrics {
  debtToIncomeRatio?: number
  monthlyCommitmentToIncomeRatio?: number
  currentDebtVs3MonthAvg?: number
  currentDebtVs6MonthAvg?: number
  lendingCapacity?: number
}

export interface CorporateRelation {
  companyTaxId: string
  companyName: string
  position: string
  startDate: number
  endDate?: number
  active: boolean
}

export interface TaxAuthorityDetails {
  agencyCode?: number
  fiscalYearEndMonth?: string
  incomeWithholdingExempt?: boolean | null
  vatWithholdingExempt?: boolean | null
}

export interface ReportingEntity {
  status?: string | null
  creationDate?: number
  enabled?: boolean | null
  entityType?: string | null
}

// ===========================================
// COMPANIES Types
// ===========================================

export enum CompaniesDataTypes {
  summary = 'summary',
  addressData = 'addressData',
  contactData = 'contactData',
  assets = 'assets',
  taxes = 'taxes',
  financialSituation = 'financialSituation',
  corporateRelations = 'corporateRelations',
}

export interface CompaniesData {
  [CompaniesDataTypes.summary]: CompanySummaryData
  [CompaniesDataTypes.addressData]: CompanyAddressData[]
  [CompaniesDataTypes.contactData]: CompanyContactData
  [CompaniesDataTypes.assets]: CompanyAssetsData
  [CompaniesDataTypes.taxes]: CompanyTaxData
  [CompaniesDataTypes.financialSituation]: CompanyFinancialSituationData
  [CompaniesDataTypes.corporateRelations]?: ICorporateRelation[]
}

export interface CompanyAddressData {
  address: string
  addressNumber?: string
  floor?: string
  appartment?: string
  postalCode: string
  city: string
  province: string
  country: string
  type?: string
  alternative?: boolean
}

export interface CompanyContactData {
  email: string[]
  phones: CompanyPhoneData[]
}

export interface CompanyPhoneData {
  code: string
  phoneNumber: string
  operator?: string
  wsp?: boolean
}

export interface CompanySummaryData {
  activity: string
  activity2: string
  cessation: string
  taxId: number
  wageBill: string
  ciiu: string
  employees: number
  subCategory: string
  rz: string
  category: string
  city: string
  cp: number
  province: string
  constitutionDate: number
  state: string
  stateSupplier: string
  isExporter: string
  societyType: string
  isBanked: boolean
  age: string
  webs: CompanyWebs[]
  startDate: number
  score: CompanyScore[]
}

export interface CompanyWebs {
  url: string
  checked: boolean
}

export interface CompanyAssetsData {
  cars: CarData[]
  carsEmbargoes: CarDebtData[]
  buildings: BuildingData[]
}

export interface CompanyTaxData {
  incomeTaxExcluded: boolean
  incomeTax: 'Activo' | 'Inactivo'
  incomeTaxRegistrationDate: number
  taxRegistrationDate: number
  retirementContributions24m: RetirementContributions24m[]
  taxesDetail: TaxesDetail[]
}

export interface BalanceSheetData {
  currentAssets?: number
  nonCurrentAssets?: number
  totalAssets?: number
  currentLiabilities?: number
  nonCurrentLiabilities?: number
  totalLiabilities?: number
  netEquity?: number
  netSales?: number
  exerciseResult?: number
  lastUpdateDate?: number
}

export interface CompanyFinancialSituationData {
  operativeBanks: BankInfoData[]
  bcraInfo: BankInfoData[]
  bouncedChecks: CheckData[]
  bankDebtors: string[]
  insurer: string
  worstSituation: string
  estimatedBilling: string
  monthlyCommitment: string
  hasApocryphalInvoices: boolean
  hasFiscalDebt: string
  interestOnRevolvingLoans: string
  entitiesInArrears: string
  entitiesInArrearsCount?: number
  isLatePayment: boolean
  debtorComplianceProfile: string
  judments3m: string
  judments12m: string
  judments24m: string
  contestAndBankruptcies3m: string
  contestAndBankruptcies12m: string
  contestAndBankruptcies24m: string
  historicalDebt: CompanyHistoricalDebt[]
  creditCardPaymentAmount: string
  bcraWorstSituation12m: string
  cne: CompanyCne[]
  balanceSheet?: BalanceSheetData
}

export interface CompanyHistoricalDebt {
  period: number
  amount: number
}

export interface CompanyScore {
  period: string
  value: string
}

export interface CompanyCne {
  period: string
  value: boolean
}

export interface RetirementContributions24m {
  period: number
  payed: boolean
}

export interface TaxesDetail {
  description: number
  registrationDate: number
}

export interface ICorporateRelation {
  taxId: string
  name: string
  positions: { position: string; date: number }[]
}

// ===========================================
// VEHICLES Types
// ===========================================

export enum VehicleDataTypes {
  summary = 'summary',
  vehicleRefDetails = 'vehicleRefDetails',
  owners = 'owners',
  ownersHistory = 'ownersHistory',
}

export interface VehicleData {
  [VehicleDataTypes.summary]: VehicleSummaryData
  [VehicleDataTypes.vehicleRefDetails]: VehicleRefDetails
  [VehicleDataTypes.owners]: VehicleOwnerData[]
  [VehicleDataTypes.ownersHistory]: { taxId: string; fullName: string; type: PersonType }[]
}

export interface VehicleSummaryData {
  buyed: number
  type: string
  licensePlate: string
  manufactured: number
  year: number
  model: string
  brand: string
  origin: string
  image: string
}

export enum PersonType {
  PERSON = 'PERSON',
  COMPANY = 'COMPANY',
}

export interface VehicleOwnerData {
  taxId: number
  type: PersonType
  province: string
  city: string
  cp: string
  address: string
  phones: VehiclePhoneData[]
  emails: string[]
  percentage: number
  nationalId?: number
  firstName?: string
  lastName?: string
  birthDate?: number
  sex?: string
  nationality?: string
  rz?: string
  constitutionDate?: number
  employees?: number
}

export interface VehiclePhoneData {
  phoneNumber: string
  operator: string
  location: string
  wsp: boolean
}

export interface VehicleRefDetails {
  brand: string
  model: string
  version: string
  fullName: string
  brandId: number
  modelId: number
  imageUrl: string
  vehicleType: 'car' | 'truck' | 'motorcycle' | string
  hasListPrice: boolean
  years: number[]
  yearMin: number
  yearMax: number
  hasNewPrice: boolean
  hasUsedPrice: boolean
  features: VehicleFeatures | any
  featuresText: string[]
  yearScore: number
  popularityScore: number
  createdAt: string
  updatedAt: string
  objectID: string
  magazinePrice: Record<string, string>
}

export interface VehicleFeatures {
  Confort?: Record<string, string>
  'Datos tecnicos'?: Record<string, string>
  'Motor y transmision'?: Record<string, string>
  Seguridad?: Record<string, string>
}

// ===========================================
// PHONES Types
// ===========================================

export enum PhoneDataTypes {
  owners = 'owners',
}

export interface PhoneData {
  [PhoneDataTypes.owners]: PhoneOwnerData[]
}

export interface PhoneOwnerData {
  taxId: number
  name: string
  personType: PhoneOwnerType
}

export enum PhoneOwnerType {
  PERSON = 'PERSON',
  COMPANY = 'COMPANY',
}

// ===========================================
// BANKS Types
// ===========================================

export interface BankOwner {
  id: string
  idType: string
  displayName: string
  isPhysicalPerson: boolean
}

export interface AccountRouting {
  scheme: string
  value: string
}

export interface BankRouting {
  bankNameDisplay: string
  bankCode: string
}

export interface BankReportData {
  label: string
  type: string
  isActive: boolean
  currency: string[]
  owners: BankOwner[]
  accountRouting: AccountRouting[]
  bankRouting: BankRouting
}

export interface BankMetadata {
  id: string
  bankCurrency: string[]
  taxId: string
  fullName: string
  bankAccount: AccountRouting[]
  bankName: string
}

export interface BankReport {
  id: string
  version: string
  vendorId: string
  feature: string
  status: string
  data: BankReportData
  metadata: BankMetadata
  totalResponseTime: number
  timestamp: string
}

// ===========================================
// IDENTITY Types
// ===========================================

export interface DiditAuth {
  iss: string
  iat: number
  sub: string
  client_id: string
  organization_id: string
  expires_in: number
  exp: number
  access_token: string
}

export interface DiditResponse {
  status: string
  session_id?: string
  session_url?: string
  vendor_data?: string
  data?: any
}

export interface DiditSession {
  session_id: string
  session_number: number
  session_token: string
  url?: string
  session_url?: string
  status: DiditSessionStatus
  metadata: any
  nfc: any
  phone: any
  poa: any
  aml: AMLScreening | null
  id_verification: DiditIDVerification
  face_match: DiditFaceMatch | null
  liveness: DiditLiveness
  ip_analysis: DiditIPAnalysis
  features: DiditFeatureType[]
  reviews: DiditReview[]
  contact_details: any
  expected_details: any
  vendor_data: string
  workflow_id: string
  callback: string | null
  created_at: string
}

export interface AMLScreening {
  status: 'Approved' | 'Rejected' | 'In Review' | 'Not Started'
  total_hits: number
  score: number
  hits: AMLHit[]
  screened_data: {
    full_name: string
    nationality: string
    date_of_birth: string
    document_number: string
  }
  warnings: {
    risk: string
    additional_data: string | null
    log_type: 'information' | 'warning' | 'error'
    short_description: string
    long_description: string
  }[]
}

export interface AMLHit {
  id?: string
  url?: string
  match?: boolean
  score?: number
  match_score?: number
  target?: boolean
  caption?: string
  datasets?: string[]
  features?: Record<string, any>
  properties?: AMLProperties
  rca_name?: string
  pep_matches: PepMatch[]
  sanction_matches: SanctionMatch[]
  warning_matches: WarningMatch[]
  adverse_media_matches: AdverseMediaMatch[]
  first_seen?: string
  last_seen?: string
  linked_entities: LinkedEntity[]
  risk_view?: RiskView
  additional_information?: Record<string, any>
  adverse_media_details?: AdverseMediaDetails
}

export interface AMLProperties {
  wikidataId?: string[]
  country?: string[]
  name?: string[]
  topics?: string[]
  gender?: string[]
  modifiedAt?: string[]
  alias?: string[]
  nationality?: string[]
  keywords?: string[]
  position?: string[]
  notes?: string[]
  birthPlace?: string[]
  education?: string[]
  birthDate?: string[]
  firstName?: string[]
  lastName?: string[]
  weakAlias?: string[]
  address?: string[]
}

export interface LinkedEntity {
  name?: string[]
  relation?: string[]
  details?: string[]
  active?: string[]
  status?: string[]
}

export interface RiskViewCategory {
  risk_level?: string
  risk_scores: Record<string, number>
  score?: number
  weightage?: number
}

export interface RiskView {
  categories?: RiskViewCategory
  countries?: RiskViewCategory
  crimes?: RiskViewCategory
  custom_list: Record<string, any>
}

export interface AdverseMediaDetails {
  sentiment_score?: number
  adverse_keywords: Record<string, number>
  entity_type?: string
  sentiment?: string
}

export interface AdverseMediaMatch {
  sentiment_score: number
  headline?: string
  summary?: string
  source_url?: string
  other_sources: string[]
  publication_date?: string
  adverse_keywords: string[]
  thumbnail?: string
  author_name?: string
  country?: string
  sentiment?: string
}

export interface WarningMatch {
  list_name?: string
  matched_name?: string
  description?: string
  publisher?: string
  source_url?: string
  other_sources: string[]
  countries?: string[]
  created_at?: string
  updated_at?: string
  additional_data: Record<string, any>
}

export interface SanctionMatch {
  list_name?: string[]
  matched_name?: string
  description?: string
  reason?: string
  source_url?: string
  other_sources: string[]
  details?: string[]
  legal_basis?: string[]
  listed_on?: string[]
  sanction_list?: string[]
  sanction_program?: string[]
  sanctioning_authority?: string[]
  updated_on?: string[]
  additional_data: Record<string, any>
}

export interface PepMatch {
  list_name?: string
  matched_name?: string
  description?: string
  publisher?: string
  pep_position?: string
  source_url?: string
  other_sources: string[]
  date_of_birth?: string
  place_of_birth?: string
  aliases: string[]
  education: string[]
}

export enum DiditSessionStatus {
  NOT_STARTED = 'NOT STARTED',
  IN_PROGRESS = 'IN PROGRESS',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  KYC_EXPIRED = 'KYC EXPIRED',
  IN_REVIEW = 'IN REVIEW',
  EXPIRED = 'EXPIRED',
  ABANDONED = 'ABANDONED',
}

export interface DiditFaceMatch {
  score: number
  source_image: string
  source_image_session_id: string | null
  status: string
  target_image: string
  warnings: DiditWarning[]
}

export interface DiditIDVerification {
  address: string
  age: number
  back_image: string
  back_video: string
  date_of_birth: string
  date_of_issue: string | null
  document_number: string
  document_type: string
  expiration_date: string
  extra_fields: Record<string, any>
  extra_files: any[]
  first_name: string
  formatted_address: string
  front_image: string
  front_video: string
  full_back_image: string
  full_front_image: string
  full_name: string
  gender: string
  issuing_state: string
  issuing_state_name: string
  last_name: string
  marital_status: string
  nationality: string
  parsed_address: DiditParsedAddress
  personal_number: string
  place_of_birth: string
  portrait_image: string
  status: string
  warnings: DiditWarning[]
}

export interface DiditParsedAddress {
  address_type: string | null
  category: string
  city: string
  country: string
  document_location: {
    latitude: number
    longitude: number
  }
  formatted_address: string
  id: string
  is_verified: boolean
  label: string
  postal_code: string
  raw_results: any
  region: string
  street_1: string
  street_2: string | null
}

export interface DiditIPAnalysis {
  browser_family: string
  device_brand: string
  device_model: string
  ip_address: string
  ip_city: string
  ip_country: string
  ip_country_code: string
  ip_state: string
  is_data_center: boolean
  is_vpn_or_tor: boolean
  isp: string
  latitude: number
  locations_info: DiditLocationsInfo
  longitude: number
  organization: string
  os_family: string
  platform: string
  status: string
  time_zone: string
  time_zone_offset: string
  warnings: DiditWarning[]
}

export interface DiditLiveness {
  age_estimation: number
  method: string
  reference_image: string
  score: number
  status: string
  video_url: string
  warnings: DiditWarning[]
}

export interface DiditWarning {
  additional_data: any
  feature?: string
  log_type: string
  long_description: string
  risk: string
  short_description: string
}

export interface DiditReview {
  user: string
  new_status: string
  comment: string
  created_at: string
}

export interface DiditLocationsInfo {
  id_document: {
    distance_from_ip: {
      direction: string
      distance: number
    }
    distance_from_poa_document: null
  }
  ip: {
    distance_from_id_document: {
      direction: string
      distance: number
    }
    distance_from_poa_document: any
    location: {
      latitude: number
      longitude: number
    }
  }
  poa_document: {
    distance_from_id_document: null
    distance_from_ip: null
    location: null
  }
}

export type DiditFeatureType =
  | 'ID_VERIFICATION'
  | 'LIVENESS'
  | 'FACE_MATCH'
  | 'AML'
  | 'IP_ANALYSIS'
  | string

// ===========================================
// OSINT Types
// ===========================================

export type OsintProps<T extends object = any> = {
  module: OsintData<T>
}

export type OsintData<T extends object = any> = {
  module: string
  query: string
  data: T
  from: string
  front_schemas: OsintFrontSchema[]
  reliable_source: boolean
  spec_format: OsintSpectFormat[]
  status: 'found'
}

export type OsintFrontSchema = {
  module: string
  body: unknown
  image?: string
  map?: OsintFrontMap[]
  tags: OsintFrontTag[]
  timeline: OsintFrontTimeline[]
}

export type OsintFrontMap = {
  type: 'lat_lng'
  lat_lng: [number, number]
  popup: { title: string; subtitle: string; address: string; date: string }
  icon: {
    awesome_marker: 'True'
    extra_classes: string
    icon_color: string
    location_type: string
    marker_color: string
    prefix: string
  }
}

export type OsintFrontTag = {
  tag: string
  url?: string
}

export type OsintFrontTimeline = {
  registered: boolean
  registered_date: null
  last_seen: boolean
  last_seen_date: null
  groups: unknown
  group_years: unknown
  group_items: unknown
}

export type OsintSpectFormat = {
  [key: string]: SpectFormat | SpectFormat[]
}

export type SpectFormat = ValueOfType & {
  key?: string
  proper_key: string
}

export type ValueOfType =
  | { type: 'bool'; value: boolean }
  | { type: 'str'; value: string }
  | { type: 'datetime'; value: string }
  | { type: 'dict'; value: any }
  | { type: 'list'; value: any[] }
  | { type: 'int'; value: number }

// ===========================================
// Metadata Types
// ===========================================

export type Metadata = MPersonalData &
  MContactData &
  MDocumentData &
  MLocationData &
  MVehicleData &
  MBankMetadata &
  MOtherData &
  MSessionIdentity &
  MTokenData

export interface MPersonalData {
  fullName?: string
  firstName?: string
  lastName?: string
  legalName?: string
  avatar?: string
}

export interface MContactData {
  emails?: string[]
  phones?: string[]
  phoneNumber?: string
  operator?: string
}

export interface MDocumentData {
  licensePlate?: string
  taxId?: string
  nationalId?: string
}

export interface MLocationData {
  country?: string
  province?: string
  city?: string
  address?: string
  addressNumber?: string
  floor?: string
  appartment?: string
  postalCode?: string
  location?: { lat: number; lng: number }
}

export interface MBankMetadata {
  bankName?: string
  bankCurrencies?: string[]
  bankCurrency?: string
  bankAccount?: { scheme?: 'CVU' | 'CBU' | 'ALIAS'; value?: string }[]
  cbu?: string
  alias?: string
}

export interface MVehicleData {
  vehicleBrand?: string
  vehicleModel?: string
}

export interface MOtherData {
  birthDate?: number
  searchQuery?: string
}

export interface MSessionIdentity {
  session_url?: string
  session_id?: string
}

export interface MTokenData {
  tokensConsumed?: number
  isTokenSystem?: boolean
}

// ===========================================
// Report Response Type
// ===========================================

export interface ReportResponse {
  _id?: string
  id: any
  uid?: string
  status: string
  responseId: string
  type?: string
  createdAt?: string
  metadata?: Metadata
  countryCode: string
  webhook?: {
    url: string
    events: any[]
  }
  data: PeopleData | CompaniesData | VehicleData | PhoneData | BankReportData | { decision: DiditSession } | any
  // Admin-specific fields
  accountId?: any
  userId?: any
  version?: string
}
