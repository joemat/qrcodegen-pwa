const VCARD_TEMPLATE = `BEGIN:VCARD
VERSION:4.0
FN:<Formatted name string>
N:<Lastname>;<Firstname>;;<Title>;
ADR;TYPE=<Purpose, e.g. home>:;;<Street and No.>;<City>;<State>;<Postcode>;<Country>
TEL;TYPE=<cell|voice|fax>,<Purpose, e.g. home>:<number>
EMAIL;TYPE=<Purpose, e.g. home>:<email>
END:VCARD
`

const PAYMENT_TEMPLATE = `BCD
001
1
SCT
<BIC target bank>
<Name of recipient>
<IBAN recipient>
<Currency, e.g. EUR><Amount, format #.##>


<Reason>

`
const WIFI_TEMPLATE = `WIFI:S:<SSID>;T:<WEP|WPA|blank>;P:<PASSWORD>;H:<Hidden? true|false|blank>;;`
const DEFAULT_CONTENT = "https://joemat.codeberg.page/qrcodegen-pwa/@main/"

var qrcode = undefined;
var recent = "";

function domContentLoaded() {
  
  url = new URL(window.location);

  const sharedTitle = url.searchParams.get('title');
  const sharedText = url.searchParams.get('text');
  const sharedUrl = url.searchParams.get('url');
  const view = url.searchParams.get('view');

  text = ""
  if (sharedTitle != undefined) {
    text += sharedTitle
  }
  if (sharedText != undefined) {
    if (text.length != 0) {
      text += "\n\n"
    }
    text += sharedText
  }
  if (sharedUrl != undefined) {
    if (text.length != 0) {
      text += "\n\n"
    }
    text += sharedUrl + "\n"
  }

  if (text.length != 0) {
    replaceTextWith(text)
  }

  if (view === "qr") {
    showQrCodeOnlyView();
  }
}


function replaceTextWith(newText) {
  recent = document.getElementById('fileContent').value
  document.getElementById('fileContent').value = newText;
  updateQrCode();
}

function loadFile(event) {
  const filename = event.target.files[0];

  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    replaceTextWith(event.target.result);
  });
  reader.readAsText(filename)
}

function loadVcardTemplate() {
  replaceTextWith(VCARD_TEMPLATE);
}

function loadPaymentTemplate() {
  replaceTextWith(PAYMENT_TEMPLATE);
}

function loadWifiTemplate() {
  replaceTextWith(WIFI_TEMPLATE);
}

function loadRecent() {
  replaceTextWith(recent);
}

function updateQrCode() {
  if (qrcode != undefined) {
    qrcode.clear();
    document.getElementById("qrcode").textContent = ""
  }
  textToEncode = document.getElementById('fileContent').value;
  qrCodeDiv = document.getElementById("qrcode");
  qrcode = new QRCode(qrCodeDiv, {
    text: textToEncode
  });
  registerImageObserver();
}

function registerImageObserver() {
  imagesSelector = document.querySelector("img");
  observer = new MutationObserver(() => {
    updateDownloadUrl()
    updateQrCodeOnlyDiv()
  });
  observer.observe(imagesSelector, {
    attributes: true,
    attributeList: ['src']
  });
}

function updateDownloadUrl() {
  qrCodeImage = document.querySelector("div.qrCode > img");
  downloadLink = document.createElement("a");
  downloadLink.setAttribute('id', "imgDownloadLink")
  downloadLink.setAttribute('href', qrCodeImage.getAttribute('src'));
  downloadLink.text = "Download";
  downloadLink.download = "qrcode.png";
  document.getElementById("downloadLinkDiv").replaceChildren(downloadLink)
}

function updateQrCodeOnlyDiv() {


  qrCodeOnlyDiv = document.getElementById("qrcodeOnlyDiv");
  qrcodeOnlyDiv.textContent = "";

  qrCodeImage = document.querySelector("div.qrCode > img");

  qrCodeCopy = document.createElement("img");
  qrCodeCopy.setAttribute("style", qrCodeImage.getAttribute("style"))
  qrCodeCopy.setAttribute("alt", qrCodeImage.getAttribute("alt"))
  qrCodeCopy.setAttribute("src", qrCodeImage.getAttribute("src"))
  qrcodeOnlyDiv.replaceChildren(qrCodeCopy)

}

function showAboutView() {
  document.getElementById("mainView").style.display = "none";
  document.getElementById("qrCodeOnlyView").style.display = "none";
  document.getElementById("aboutView").style.display = "inherit";
}

function showMainView() {
  document.getElementById("mainView").style.display = "inherit";
  document.getElementById("qrCodeOnlyView").style.display = "none";
  document.getElementById("aboutView").style.display = "none";
}

function showQrCodeOnlyView() {
  document.getElementById("mainView").style.display = "none";
  document.getElementById("qrCodeOnlyView").style.display = "inherit";
  document.getElementById("aboutView").style.display = "none";
}

function shareQrCode() {
  const title = "QR Code";
  const text = document.getElementById("qrcode").textContent
  const data = {title, text};

  const url = fetch(qrCodeImage = document.querySelector("div.qrCode > img").getAttribute('src'))
    .then(res => res.blob())
    .then(blob => {
      qrCodeFile = new File([blob], "qrcode.png",{ type: "image/png" })
      const images = [ qrCodeFile ]
      if (navigator.canShare && navigator.canShare({ files: images })) {
          data.files = images;
      }

      try {
          navigator.share(data);
      } catch (e) {
          console.log('Error sharing this tip', e);
      }
    })
}

function registerServiceWorker() {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./sw.js');
  }
}

window.onload = () => registerServiceWorker()

replaceTextWith(DEFAULT_CONTENT);
updateQrCode();
showMainView();

window.addEventListener('DOMContentLoaded', domContentLoaded());
