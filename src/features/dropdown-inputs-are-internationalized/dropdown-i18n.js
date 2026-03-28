import { okButtonEl, cancelButtonEl, isDynamicSelect } from '../../utils/dynamic-select-dom.js'
import { getLanguageFromElement } from '../../utils/get-lang-from-element.util.js'
/** @import {DynamicSelect} from '../../utils/dynamic-select-dom' */

export const i18nButtonLabels = Object.freeze({
  ok: {
    default: 'OK',
    es: 'Aceptar',
    ar: 'موافق',
    hi: 'ठीक है',
    tr: 'Tamam',
    zh: '确定',
    ko: '확인',

  },

  cancel: {
    default: 'Cancel',
    es: 'Cancelar',
    zh: '取消',
    hi: 'रद्द करें',
    ar: 'إلغاء',
    tr: 'İptal',
    fr: 'Annuler',
    pt: 'Cancelar',
    ru: 'Отмена',
    id: 'Batal',
    de: 'Abbrechen',
    ja: 'キャンセル',
    vi: 'Hủy',
    ko: '취소',
    it: 'Annulla',
    pl: 'Anuluj',
    uk: 'Скасувати',
  },
})

const mutationObserver = new MutationObserver(records => {
  for (const record of records) {
    const { target } = record
    if (!isDynamicSelect(target) || !target.open) {
      continue
    }

    const lang = getLanguageFromElement(target)
    const locale = new Intl.Locale(lang)
    const language = locale.language
    const okButton = okButtonEl(target)
    const { ok, cancel } = i18nButtonLabels
    okButton.textContent = Object.hasOwn(ok, language) ? ok[language] : ok.default
    const cancelButton = cancelButtonEl(target)
    cancelButton.textContent = Object.hasOwn(cancel, language) ? cancel[language] : cancel.default
  }
})

const mutationObserverInit = { attributeFilter: ['open'] }

/**
 * @param {DynamicSelect} select - target select
 */
export function applyI18nOnSelectInputs (select) {
  mutationObserver.observe(select, mutationObserverInit)
}
