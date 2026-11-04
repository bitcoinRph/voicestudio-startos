import { sdk } from '../sdk'
import { analytics } from './analytics'
import { apiKey } from './apiKey'
import { connectAgents } from './connectAgents'

export const actions = sdk.Actions.of()
  .addAction(apiKey)
  .addAction(connectAgents)
  .addAction(analytics)
