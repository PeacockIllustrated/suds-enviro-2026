/**
 * Registers all product configurations with the registry.
 * Import this file once at app startup to populate the registry.
 */

import { registerProduct } from './registry'
import { chamberConfig } from './chamber'
import { catchpitConfig } from './catchpit'
import { rhinoceptorConfig } from './rhinoceptor'
import { flowControlConfig } from './flow-control'
import { pumpStationConfig } from './pump-station'
import { greaseTrapConfig } from './grease-trap'
import { greaseSeparatorConfig } from './grease-separator'
import { rhinopodConfig } from './rhinopod'
import { rainwaterConfig } from './rainwater'
import { septicTankConfig } from './septic-tank'
import { drawpitConfig } from './drawpit'

registerProduct(chamberConfig)
registerProduct(catchpitConfig)
registerProduct(rhinoceptorConfig)
registerProduct(flowControlConfig)
registerProduct(pumpStationConfig)
registerProduct(greaseTrapConfig)
registerProduct(greaseSeparatorConfig)
registerProduct(rhinopodConfig)
registerProduct(rainwaterConfig)
registerProduct(septicTankConfig)
registerProduct(drawpitConfig)
