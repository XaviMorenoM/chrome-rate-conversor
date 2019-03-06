
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


const contextMenuCallback = async ({selectionText, ...otherProps}, tab) => {
  if (!selectionText || isNaN(selectionText)) {
    return alert(`Can't convert to EUR a non-numeric value`);
  }
  const amountInUSD = parseFloat(selectionText);
  const amountInEuros = await USDToEUR(amountInUSD);
  alert(`USD$ ${amountInUSD.toFixed(2)} is ${amountInEuros.toFixed(2)}€`);
}

const contextMenuConfig = {
  'title': 'Convert from USD to EUR',
  'contexts': ['editable'],
  onclick: contextMenuCallback,
};

chrome.contextMenus.removeAll();
chrome.contextMenus.create(contextMenuConfig);