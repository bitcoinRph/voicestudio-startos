import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  analyticsAllowed: Value.toggle({
    name: i18n('Allow the analytics consent prompt'),
    description: i18n(
      'Off: VoiceStudio sends no usage analytics. On: the web UI asks for consent on first run and sends content-free usage data only if you answer yes.',
    ),
    default: false,
  }),
})

export const analytics = sdk.Action.withInput(
  'analytics',

  async ({ effects }) => ({
    name: i18n('Usage Analytics'),
    description: i18n(
      'Choose whether VoiceStudio may ask for consent to send anonymous usage analytics. Off by default.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => ({
    analyticsAllowed:
      (await storeJson.read((s) => s.analyticsAllowed).once()) ?? false,
  }),

  async ({ effects, input }) =>
    storeJson.merge(effects, { analyticsAllowed: input.analyticsAllowed }),
)
