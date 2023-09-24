var fiat_currency = 'usd';
var fiat_currency_symbol = "$";
var dogecoinValue = 0.0774;
var updateSpeed = 500;

var runDogMoneyMode = false;
var updateViewInterval = null;

var comicMode = false;


function convertToDogecoin(currencyStr, regexToMatch, conversionRate) {
    
    //if we don't clone the regex we can have issues
    const match = new RegExp(regexToMatch.source, regexToMatch.flags).exec(currencyStr);
    
    if (!match) {
        return null; // not a valid currency string
    }

    // Remove the currency symbol, spaces, and commas, then parse as a float
    const valueInCurrency = parseFloat(match[2].replace(/[, ]/g, ''));


    // Convert to Dogecoin
    return valueInCurrency / conversionRate;
}

function createCurrencyRegex(currencySymbol) {
    // Escape the currency symbol to handle special characters in regex
    const escapedSymbol = currencySymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create the regex pattern
    const regexPattern = `(${escapedSymbol}\\s*)(\\d{1,3}(?:,\\d{3})*(?:\\.\\d+)?|\\d*(?:\\.\\d+)?)`;

    // Return the regex object
    return new RegExp(regexPattern);
}


function processMatches(text, regexToMatch) {

    replaced = false;

    while (true) {
        var matches = text.match(regexToMatch);
        if (!matches) break; // exit the loop if no more matches
    
        // find the longest match
        var longestMatch = matches.reduce(function(a, b) { return a.length > b.length ? a : b; });
        

        if(longestMatch.length === 1){
            break;
        }

        // process the longest match
        var dogecoinAmount = convertToDogecoin(longestMatch, regexToMatch, dogecoinValue);
        if (dogecoinAmount !== null) {
            var fractionDigitsOptions = {};

            if (dogecoinAmount < 1) {
                //dogecoin did a thing, show 3 decimal points
                fractionDigitsOptions.minimumFractionDigits = 3;
                fractionDigitsOptions.maximumFractionDigits = 3;
            }
            else if (dogecoinAmount < 100) {
                //only show decimal points if we have less than 100
                fractionDigitsOptions.minimumFractionDigits = 2;
                fractionDigitsOptions.maximumFractionDigits = 2;
            }
            else {
                fractionDigitsOptions.minimumFractionDigits = 0;
                fractionDigitsOptions.maximumFractionDigits = 0;
            }
            text = text.replace(longestMatch, `Ð${dogecoinAmount.toLocaleString('en-US', fractionDigitsOptions)}`);
            replaced = true;
        }

    }

    return {text, replaced};
}


/*

This logic replaces most fiat prices on the web.

*/

function processNodesRecursively(node, regexToMatch) {

    // If this node is an input field or contenteditable, skip processing
    if (node.tagName && node.tagName.toLowerCase() === 'input') return;
    if (node.isContentEditable) return;


    // If this node has children, recursively process the children first
    if (node.childNodes.length > 0) {
        Array.from(node.childNodes).forEach(child => processNodesRecursively(child, regexToMatch));
    }
    else {
        let result = processMatches(node.textContent, regexToMatch);
        if (result.replaced) {
            node.textContent = result.text;
        }
    }
}
  
function convertPrices() {
    var regex = createCurrencyRegex(fiat_currency_symbol);

    /*
        Amazon breaks prices up into many elements, it gets some custom logic.
    */
    if (/^(www\.)?amazon\.[a-z\.]{2,5}$/.test(window.location.hostname)) {
       var priceElements = document.querySelectorAll('.a-price');
        priceElements.forEach(function(priceElement) {
            if(!priceElement.textContent.includes('Ð')){
                var offscreenElement = priceElement.querySelector('.a-offscreen');
                var visiblePriceElements = priceElement.querySelectorAll('.a-price-whole, .a-price-fraction');
                var currencySymbolElement = priceElement.querySelector('.a-price-symbol');

                if (offscreenElement && visiblePriceElements.length > 0) {
                    // Remove currency symbol and commas before conversion to float
                    var fiat = offscreenElement.textContent.replace(fiat_currency_symbol, '').replace(/,/g, '');
                    var dogefy = (parseFloat(fiat) / parseFloat(dogecoinValue)).toLocaleString('en', {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2
                                                                });

                    offscreenElement.textContent = 'Ð' + dogefy;

                    if (currencySymbolElement) {
                        currencySymbolElement.textContent = 'Ð';
                    }

                    var [whole, fraction] = dogefy.split('.');
                    visiblePriceElements[0].textContent = whole + visiblePriceElements[0].querySelector('.a-price-decimal').textContent;
                    visiblePriceElements[1].textContent = fraction;
                }
            }
        });

    }

    /* 
        Newegg also breaks up prices into many elements, it also gets custom logic.
    */
   if (/^(www\.)?newegg\.[a-z\.]{2,5}$/.test(window.location.hostname)) {
        var priceElements = document.querySelectorAll('.price-current');
        var goodsPriceElements = document.querySelectorAll('.goods-price-current');
    
        priceElements.forEach(function(priceElement) {
            if(!priceElement.textContent.includes('Ð')){
                var strongElement = priceElement.querySelector('strong');
                var supElement = priceElement.querySelector('sup');
                var dollarSymbolIndex = Array.from(priceElement.childNodes).findIndex(node => node.nodeType === 3 && node.nodeValue.includes('$'));
        
                if (strongElement && supElement && dollarSymbolIndex > -1) {
                    var fiat = strongElement.textContent.replace(/,/g, '') + '.' + supElement.textContent.replace(/,/g, '');
                    var dogefy = (parseFloat(fiat) / parseFloat(dogecoinValue)).toLocaleString('en', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
        
                    var [whole, fraction] = dogefy.split('.');
                    strongElement.textContent = whole;
                    supElement.textContent = fraction;
                    
                    var textNode = priceElement.childNodes[dollarSymbolIndex];
                    textNode.nodeValue = textNode.nodeValue.replace(fiat_currency_symbol, 'Ð');
                }
            }
        });


        goodsPriceElements.forEach(function(priceElement) {
            if(!priceElement.textContent.includes('Ð')){
                var strongElement = priceElement.querySelector('.goods-price-value strong');
                var supElement = priceElement.querySelector('.goods-price-value sup');
                var currencySymbolElement = priceElement.querySelector('.goods-price-symbol');

                if (strongElement && supElement) {
                    var fiat = strongElement.textContent.replace(/,/g, '') + '.' + supElement.textContent.replace(/,/g, '');
                    var dogefy = (parseFloat(fiat) / parseFloat(dogecoinValue)).toLocaleString('en', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });

                    var [whole, fraction] = dogefy.split('.');
                    strongElement.textContent = whole;
                    supElement.textContent = fraction;

                    if (currencySymbolElement) {
                        currencySymbolElement.textContent = 'Ð';
                    }
                }            
            }
        });
    }
    

    // Start processing at the body tag
    processNodesRecursively(document.body, regex);
}









function updateView() {
    clearInterval(updateViewInterval);

    if(runDogMoneyMode) {
        convertPrices();
    }
    
    if (comicMode) {
        if (!document.documentElement.classList.contains("dogmoneymode-comic-sans")) {
            document.documentElement.classList.add("dogmoneymode-comic-sans");
        }
    }
    else {
        if (document.documentElement.classList.contains("dogmoneymode-comic-sans")) {
            document.documentElement.classList.remove("dogmoneymode-comic-sans");
        }
    }
    
    
    updateViewInterval = setInterval(updateView, updateSpeed);
}

function updateState(firstRun) {
    chrome.runtime.sendMessage({command: "updatePrice"}).then(response => {
        if(response.error) {
          console.log("An error occurred: " + response.error);
          return;
        }
      
        dogecoinValue = response.dogecoinValue;
        fiat_currency = response.fiat_currency ?? 'usd';
        fiat_currency_symbol = response.fiat_currency_symbol ?? '$';
        
        return chrome.storage.sync.get(['dogeAutoRefresh', 'dogeComicSans']);
      }).then(result => {
        runDogMoneyMode = result.dogeAutoRefresh || false;
        comicMode = result.dogeComicSans || false;

        if(comicMode) {
            document.getElementsByTagName("html")[0].classList.add("dogmoneymode-comic-sans");
        }

        if(!firstRun && !runDogMoneyMode)
        {
            clearInterval(updateViewInterval);
            window.location.reload();
        }
        updateView();
      }).catch(error => console.log('An error occurred:', error));
      
  }

  
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "convertPrices") {
      // Use incoming message data
      fiat_currency_symbol = request.currencySymbol;
      dogecoinValue = request.conversionPrice;
      fiat_currency = request.currencyCode;
  
      convertPrices();
    }
    if(request.action == "autoChanged") {
        updateState(false);
    };
  });


  updateState(true);