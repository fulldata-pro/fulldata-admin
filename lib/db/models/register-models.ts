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
import './AccountTokenBalance'

// Financial models
import './DiscountCode'
import './BulkDiscount'
import './TokenPricing'
import './Currency'

// Other models that might be referenced
import './Proxy'
import './File'
import './Config'

export {}
