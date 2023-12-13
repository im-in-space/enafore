import { importShowComposeDialog } from '../_components/dialog/asyncDialogs/importShowComposeDialog.js'
import { store } from '../_store/store.js'

export async function quote (status) {
  const dialogPromise = importShowComposeDialog()
  store.clearComposeData('dialog')
  store.setComposeData('dialog', {
    contentWarningShown: !!status.spoiler_text,
    contentWarning: status.spoiler_text || '',
    postPrivacy: status.visibility,
    sensitive: !!status.sensitive,
    quoteId: status.id,
    quoteHandle: '@' + status.account.acct
  })
  const showComposeDialog = await dialogPromise
  showComposeDialog()
}
