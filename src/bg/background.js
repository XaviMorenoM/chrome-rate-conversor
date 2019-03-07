
const FIXER_IO_API_ACCESS_KEY = '__YOUR_API_KEY_HERE__';

let _last_updated_currency_dict = {}
const getFixerCurrencyInfo = async (targetDate) => {
  if (_last_updated_currency_dict[targetDate]) return _last_updated_currency_dict[targetDate];
  const response = await fetch(
    `http://data.fixer.io/api/${targetDate}?access_key=${FIXER_IO_API_ACCESS_KEY}&format=1&symbols=USD`
  );
  const jsonResponse = await response.json();
  _last_updated_currency_info = jsonResponse;
  return jsonResponse;
}

const USDToEUR = async (usdAmount, targetDate) => {
  const info = await getFixerCurrencyInfo(targetDate);
  return usdAmount / info.rates.USD;
}

const updateTextOnActiveElement = (text, tabId, frameId = 0) => {
  chrome.tabs.executeScript(tabId, {
    frameId,
    matchAboutBlank: true,
    code: `document.execCommand('insertText', false, '${text}')`,
  });
}

const contextMenuCallback = async ({selectionText, frameId}, tab, askForDate) => {
  if (!selectionText || isNaN(selectionText)) {
    return alert(chrome.i18n.getMessage('notNumericInputErrorMessage'));
  }

  const targetDate = askForDate ? prompt(chrome.i18n.getMessage('dateInputPromptMessage')) : 'latest';
  if (targetDate) return;

  const amountInEuros = await USDToEUR(parseFloat(selectionText), targetDate);
  updateTextOnActiveElement(amountInEuros, tab.id, frameId);
}

const createContextMenu = (title, askForDate) => ({
  title,
  contexts: ['editable'],
  onclick: (info, tab) => contextMenuCallback(info, tab, askForDate),
})

chrome.contextMenus.removeAll();
chrome.contextMenus.create(createContextMenu(chrome.i18n.getMessage('contextMenuUSDToEUR'), false));
chrome.contextMenus.create(createContextMenu(chrome.i18n.getMessage('contextMenuUSDToEURWithDate'), true));
