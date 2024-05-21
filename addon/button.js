/* exported initButton */
/* global showStdPageDetails */
"use strict";

// sfdcBody = normal Salesforce page
// ApexCSIPage = Developer Console
// auraLoadingBox = Lightning / Salesforce1
if (document.querySelector("body.sfdcBody, body.ApexCSIPage, #auraLoadingBox") || location.host.endsWith("visualforce.com")) {
  // We are in a Salesforce org
  chrome.runtime.sendMessage({message: "getSfHost", url: location.href}, sfHost => {
    if (sfHost) {
      initButton(sfHost, false);
    }
  });
}

function initButton(sfHost, inInspector) {
  let rootEl = document.createElement("div");
  rootEl.id = "insext";
  let btn = document.createElement("div");
  let iFrameLocalStorage = {};
  btn.className = "insext-btn";
  btn.tabIndex = 0;
  btn.accessKey = "i";
  btn.title = "Show Salesforce details (Alt+I / Shift+Alt+I)";
  rootEl.appendChild(btn);
  loadPopup();
  document.body.appendChild(rootEl);

  addFlowScrollability();

  function addFlowScrollability(popupEl) {
    const currentUrl = window.location.href;
    // Check the current URL for the string "builder_platform_interaction"
    if (currentUrl.includes("builder_platform_interaction")) {
      // Create a new checkbox element
      const headerFlow = document.querySelector("builder_platform_interaction-container-common");
      const overflowCheckbox = document.createElement("input");
      overflowCheckbox.type = "checkbox";
      overflowCheckbox.id = "overflow-checkbox";
      const checkboxState = iFrameLocalStorage.scrollOnFlowBuilder;
      // Check local storage for the checkbox state
      (checkboxState != null) ? (overflowCheckbox.checked = checkboxState) : (overflowCheckbox.checked = true);
      // Create a new label element for the checkbox
      const overflowLabel = document.createElement("label");
      overflowLabel.textContent = "Enable flow scrollability";
      overflowLabel.htmlFor = "overflow-checkbox";
      if (currentUrl.includes("sandbox")){
        overflowCheckbox.className = "checkboxScrollSandbox";
        overflowLabel.className = "labelCheckboxScrollSandbox";
      } else {
        overflowCheckbox.className = "checkboxScrollProd";
        overflowLabel.className = "labeCheckboxScrollProd";
      }
      // Get a reference to the <head> element
      const head = document.head;
      // Create a new <style> element
      const style = document.createElement("style");
      // Set the initial text content of the <style> element
      style.textContent = ".canvas {overflow : auto!important ; }";
      // Append the <style> element to the <head> element
      head.appendChild(style);
      // Append the checkbox and label elements to the body of the document
      headerFlow.appendChild(overflowCheckbox);
      headerFlow.appendChild(overflowLabel);
      // Set the overflow property to "auto"
      overflowCheckbox.checked ? style.textContent = ".canvas {overflow : auto!important ; }" : style.textContent = ".canvas {overflow : hidden!important ; }";
      // Listen for changes to the checkbox state
      overflowCheckbox.addEventListener("change", function() {
        // Check if the checkbox is currently checked
        // Save the checkbox state to local storage
        popupEl.contentWindow.postMessage({
          updateLocalStorage: true,
          key: "scrollOnFlowBuilder",
          value: JSON.stringify(this.checked)
        }, "*");
        // Set the overflow property to "auto"
        this.checked ? style.textContent = ".canvas {overflow : auto!important ; }" : style.textContent = ".canvas {overflow : hidden!important ; }";
      });
    }
  }

  // Calulates default position, left to right for horizontal, and adds boundaries to keep it on screen
  function calcPopup({popupArrowOrientation: o, popupArrowPosition: pos}) {
    o = o || "vertical"; // Default to vertical
    const isVertical = o === "vertical";
    pos = pos ? Math.min(95, pos) + "%" : "122px";
    const [posStyle, oStyle] = isVertical ? ["top", "right"] : ["left", "bottom"];
    const imgSrc = isVertical
      ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAPCAYAAADd/14OAAAA40lEQVQoz2P4//8/AzpWzGj6L59U/V8urgxMg/g4FUn6J/+X9E38LxWc8V8htR67IpCkuGfMfxCQjSpENRFFkXvk/1+/foGxQloDSD0DVkVfvnyBY7hCdEVv3rxBwXCFIIdKh2WDFT1+/BgDo1qd2fL/1q1bWDFcoW5xz3/Xppn/oycu/X/x4kUMDFeoWdD136R8wn+f9rlgxSdOnEDBKFajK96/fz8coyjEpnj79u1gjKEQXXFE/+L/Gzdu/G9WMfG/am4HZlzDFAf3LPwfOWEJWBPIwwzYUg9MsXXNFDAN4gMAmASShdkS4AcAAAAASUVORK5CYII="
      : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAKCAYAAABrGwT5AAAAAXNSR0IArs4c6QAAAFBlWElmTU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAD6ADAAQAAAABAAAACgAAAADdC3pnAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgoZXuEHAAABKElEQVQoFWNgwAI0C7r+6xb3/AdJKaTW/1fMaAKz0ZUyoguANHKzszEIcnMy3Hn+muHX2+cMLDwCDExs7Az3Z9ShqGdC1gzTKCHAyyDGz8OwszCM4c/Hdwy/P75l+PfrJwO6C+CakTXyc3EwlDnogM09M6eL4e+Xj1gNAGtG15hrrozsIIarSydjNYARXWOKnhQDJycnBubg4GBQDk5lYObhZ2DlFwaHARMocORFBRl4ONgYYtSEUGxE5zzevJDh77cvwEB8AQ4DJnZWFgY2FmaGSCU+dLVY+S+2LWZg+PeP4f+f3wwsP3//Yfj8/SdD6/G3DK/evceqAVkQFHiMwGhjZGFlYPn68xfDwzfvGX78+sPwYFYDSjwia4KxQdHF/JePgZGZmQEASqV1t0W3n+oAAAAASUVORK5CYII=";
    const btnClass = `insext-btn-${o}`;
    return {pos, posStyle, oStyle, imgSrc, btnClass};
  }

  function setRootCSSProperties(rootElement, buttonElement) {
    const p = calcPopup(iFrameLocalStorage);
    let img = document.createElement("img");
    img.src = p.imgSrc;
    rootElement.style[p.posStyle] = p.pos;
    rootElement.style[p.oStyle] = 0;
    buttonElement.classList.add(p.btnClass);
    buttonElement.appendChild(img);
  }

  function setFavicon(sfHost){
    let fav = iFrameLocalStorage[sfHost + "_customFavicon"];
    if (fav){
      let link = document.createElement("link");
      link.setAttribute("rel", "icon");
      link.orgType = "image/x-icon";
      if (fav.indexOf("http") == -1){
        fav = chrome.runtime.getURL("images/favicons/" + fav + ".png");
      }
      link.href = fav;
      document.head.appendChild(link);
    }
  }

  function loadPopup() {
    btn.addEventListener("click", () => {
      const isInactive = !rootEl.classList.contains("insext-active");
      togglePopup(isInactive);
    });

    let popupSrc = chrome.runtime.getURL("popup.html");
    let popupEl = document.createElement("iframe");
    function getOrientation(source) {
      const o = (source === "localStorage")
        ? localStorage.getItem("popupArrowOrientation")
        : iFrameLocalStorage.popupArrowOrientation;
      return o || "vertical";
    }
    // return a value for direction popup will expand, based on position and orientation
    function calcDirection(pos, o) {
      if (o === "horizontal") {
        return pos < 8 ? "right" : pos >= 90 ? "left" : "centered";
      }
      return pos >= 55 ? "up" : null;
    }
    function resetPopupClass(o) {
      popupEl.className = "insext-popup";
      popupEl.classList.add(`insext-popup-${o}`);
    }
    resetPopupClass(getOrientation("localStorage"));
    popupEl.src = popupSrc;
    addEventListener("message", e => {
      if (e.source != popupEl.contentWindow) {
        return;
      }
      if (e.data.insextInitRequest) {
        // Set CSS classes for arrow button position
        iFrameLocalStorage = e.data.iFrameLocalStorage;
        const {popupArrowPosition: pos} = iFrameLocalStorage;
        const o = getOrientation("iframe");
        const dir = calcDirection(pos, o);
        resetPopupClass(o);
        if (dir) {
          popupEl.classList.add(`insext-popup-${o}-${dir}`);
        }
        setRootCSSProperties(rootEl, btn);
        addFlowScrollability(popupEl);
        setFavicon(sfHost);
        popupEl.contentWindow.postMessage({
          insextInitResponse: true,
          sfHost,
          inDevConsole: !!document.querySelector("body.ApexCSIPage"),
          inLightning: !!document.querySelector("#auraLoadingBox"),
          inInspector,
        }, "*");
      }

      togglePopup(e.data.insextOpenPopup, e.data.insextClosePopup);
      if (e.data.insextShowStdPageDetails) {
        showStdPageDetails(e.data.insextData, e.data.insextAllFieldSetupLinks);
      }
      if (e.data.insextShowApiName) {
        let apiNamesClass = "field-api-name";
        if (e.data.btnLabel.startsWith("Show")){
          document.querySelectorAll("record_flexipage-record-field > div, records-record-layout-item > div, div .forcePageBlockItemView").forEach(field => {
            let label = field.querySelector("span");
            if (field.dataset.targetSelectionName && label.querySelector("mark") == null){
              label.innerText = label.innerText + " ";
              const fieldApiName = document.createElement("mark");
              fieldApiName.className = apiNamesClass;
              fieldApiName.style.cursor = "copy";
              fieldApiName.innerText = field.dataset.targetSelectionName.split(".")[2];
              label.appendChild(fieldApiName);
              label.addEventListener("click", copy);
            }
          });
        } else {
          document.querySelectorAll("." + apiNamesClass).forEach(e => e.remove());
        }
      }
    });
    rootEl.appendChild(popupEl);
    // Function to handle copy action
    function copy(e) {
      // Retrieve the text content of the target element triggered by the event
      const originalText = e.target.innerText; // Save the original text
      // Attempt to copy the text to the clipboard
      navigator.clipboard.writeText(originalText).then(() => {
        // Create a new span element to show the copy success indicator
        const copiedIndicator = document.createElement("span");
        copiedIndicator.textContent = "Copied ✓"; // Set the text content to indicate success
        copiedIndicator.className = "copiedText"; // Assign a class for styling purposes

        // Add the newly created span right after the clicked element in the DOM
        if (e.target.nextSibling) {
          // If the target has a sibling, insert the indicator before the sibling
          e.target.parentNode.insertBefore(copiedIndicator, e.target.nextSibling);
        } else {
          // If no sibling, append the indicator as the last child of the parent
          e.target.parentNode.appendChild(copiedIndicator);
        }

        // Remove the indicator span after 2 seconds
        setTimeout(() => {
          if (copiedIndicator.parentNode) {
            // Ensure the element still has a parent before removing
            copiedIndicator.parentNode.removeChild(copiedIndicator);
          }
        }, 2000); // Set timeout for 2 seconds
      }).catch(err => {
        // Log an error message if the copy action fails
        console.error("Copy failed: ", err);
      });
    }
    function openPopup() {
      let activeContentElem = document.querySelector("div.windowViewMode-normal.active, section.oneConsoleTab div.windowViewMode-maximized.active.lafPageHost");
      let isFieldsPresent = activeContentElem ? !!activeContentElem.querySelector("record_flexipage-record-field > div, records-record-layout-item > div, div .forcePageBlockItemView") : false;
      popupEl.contentWindow.postMessage({insextUpdateRecordId: true,
        locationHref: location.href,
        isFieldsPresent
      }, "*");
      rootEl.classList.add("insext-active");
      // These event listeners are only enabled when the popup is active to avoid interfering with Salesforce when not using the inspector
      addEventListener("click", outsidePopupClick);
      popupEl.focus();
    }
    function closePopup() {
      rootEl.classList.remove("insext-active");
      removeEventListener("click", outsidePopupClick);
      popupEl.blur();
    }
    function togglePopup(openCondition, closeCondition = !openCondition) {
      if (openCondition) {
        openPopup();
      } else if (closeCondition) {
        closePopup();
      }
    }
    function outsidePopupClick(e) {
      // Close the popup when clicking outside it
      if (!rootEl.contains(e.target)) {
        closePopup();
      }
    }
  }
}
