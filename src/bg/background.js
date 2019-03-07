
const FIXER_IO_API_ACCESS_KEY = '__YOUR_API_KEY_HERE__';

let _last_updated_currency_info = undefined
const getFixerCurrencyInfo = async () => {
  if (_last_updated_currency_info) return _last_updated_currency_info;
  const response = await fetch(
    `http://data.fixer.io/api/latest?access_key=${FIXER_IO_API_ACCESS_KEY}&format=1&symbols=USD`
  );
  const jsonResponse = await response.json();
  _last_updated_currency_info = jsonResponse;
  return jsonResponse;
}

const USDToEUR = async (usdAmount) => {
  const info = await getFixerCurrencyInfo();
  return usdAmount / info.rates.USD;
}

const updateTextOnActiveElement = (text, tabId, frameId = 0) => {
  chrome.tabs.executeScript(tab.id, {
    frameId,
    matchAboutBlank: true,
    code: `document.execCommand('insertText', false, '${text}')`,
  });
}

const contextMenuCallback = async ({selectionText, frameId}, tab) => {
  if (!selectionText || isNaN(selectionText)) {
    return alert(`Can't convert to EUR a non-numeric value`);
  }
  const amountInUSD = parseFloat(selectionText);
  const amountInEuros = await USDToEUR(amountInUSD);
  updateTextOnActiveElement(amountInEuros, tab.id, frameId);
}

const contextMenuConfig = {
  'title': 'Convert from USD to EUR',
  'contexts': ['editable'],
  onclick: contextMenuCallback,
};

chrome.contextMenus.removeAll();
chrome.contextMenus.create(contextMenuConfig);
