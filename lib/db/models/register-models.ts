/**
 * This file ensures all models are registered with Mongoose
 * Import this file before using populate() with referenced models
 */

// Core models
import './Account'
import './User'
import './Admin'
import './Receipt'
import './Invoice'
import './Movement'

// Financial models
import './PaymentMethod'
import './DiscountCode'
import './BulkDiscount'
import './TokenPricing'

// Other models that might be referenced
import './Benefit'
import './Proxy'
import './File'

export {}
