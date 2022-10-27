import { Component, h, Element, Prop, Watch, State, getAssetPath } from '@stencil/core';
import { AccordeonHeadersInterface } from './interface/accordeon-headers.interface';

@Component({
  tag: 'ip-accordeon',
  styleUrl: './ip-accordeon.scss',
  shadow: true,
  assetsDirs: ['assets'],
})
export class IpAccordeon {
  @Element() el: HTMLElement;

  private _accordeonHeaders: AccordeonHeadersInterface[];
  @Prop() accordeonHeaders: AccordeonHeadersInterface[] | string;

  @Watch('accordeonHeaders')
  arrayDataWatcher(newValue: AccordeonHeadersInterface[] | string) {
    if (typeof newValue === 'string') {
      this._accordeonHeaders = JSON.parse(newValue);
    } else {
      this._accordeonHeaders = newValue;
    }
  }

  @State() accHeaderButtons;
  @State() accPanels;

  @Prop() isFirstPanelOpen: boolean;
  @Prop() isSingleOpen: boolean;

  componentWillLoad() {
    this.arrayDataWatcher(this.accordeonHeaders);

    setTimeout(() => {
      this.accHeaderButtons = this.el.shadowRoot.querySelector('#ip-accordeon').querySelectorAll('button');
      this.accPanels = this.el.shadowRoot.querySelector('#ip-accordeon').querySelectorAll('.js-panel');

      this.setSlotId();

      this.openFirstPanel();

    }, 0)
  }

  // keep first panel open or not depending on prop 'isFirstPanelOpen'
  openFirstPanel() {
    if (this.isFirstPanelOpen) {
      (this.accHeaderButtons[0] as HTMLElement).setAttribute('aria-expanded', 'true');
      const firstPanel = this.accPanels[0];
      firstPanel.style.transition = 'none';
      firstPanel.style.height = firstPanel.scrollHeight + 'px';
      setTimeout(() => {
        firstPanel.style.transition = 'all 0.3s ease-in';
      }, 500)
    }
  }

  // For accessibility - set an id on the slotted elements
  setSlotId() {
    const slottedElems = this.el.querySelectorAll('[slot]');
    slottedElems.forEach((slotElem, index) => {
      slotElem.setAttribute('id', 'sect-' + (index + 1));
    });
  }

  onSelectPanel(index: number) {
    const selectedButton = this.accHeaderButtons[index];
    const selectedPanel = this.accPanels[index];

    if (this.isSingleOpen) {
      this.accPanels.forEach((panel) => {
        panel.style.height =  '0px';
      });

      this.accHeaderButtons.forEach((accButton) => {
        accButton.setAttribute('aria-expanded', 'false');
      })

    }

    this.setHeight(selectedPanel);

    this.setAriaExpanded(selectedButton);
  }

  setHeight(selectedPanel: HTMLElement) {
    if (selectedPanel.offsetHeight === 0) {
      selectedPanel.style.height = selectedPanel.scrollHeight + 'px';
    } else {
      selectedPanel.style.height = '0px';
    }
  }

  // set aria-expanded to true for selected button
  setAriaExpanded(selectedButton: HTMLElement) {
    if (selectedButton.getAttributeNode('aria-expanded').value === 'true') {
      selectedButton.setAttribute('aria-expanded', 'false');
    } else {
      selectedButton.setAttribute('aria-expanded', 'true');
    }
  }

  render() {
    // const accPanel = (
    //   <div>
    //     {this._accordeonHeaders.map((tabHeader, index) => [
    //       <h3 class="js-acc-button">
    //         <button
    //           onClick={this.onSelectPanel.bind(this, index)}
    //           aria-expanded="false"
    //           aria-controls={`sect-${index + 1}`}
    //           id={`accordeon-${index + 1}`}
    //         >
    //           <span class="accordion-title">{tabHeader.title}</span>
    //         </button>
    //       </h3>,
    //       <div
    //         id={`sect-${index + 1}`}
    //         role="region"
    //         aria-labelledby={`accordeon-${index + 1}`}
    //         class="js-panel"
    //       >
    //         <slot name={'accordeon-' + (index + 1)}></slot>
    //       </div>,
    //     ])}
    //   </div>
    // );

    return [
      <div class="ip-accordeon" id="ip-accordeon">
        {this._accordeonHeaders ? (
          this._accordeonHeaders.map((tabHeader, index) => (
            <div class="ip-acc-panel">
              <h3 part="acc-header" class="js-acc-button">
                <button
                  part="acc-btn"
                  onClick={this.onSelectPanel.bind(this, index)}
                  aria-expanded="false"
                  aria-controls={`sect-${index + 1}`}
                  id={`accordeon-${index + 1}`}
                >
                  <span part="acc-title" class="accordion-title">
                    {tabHeader.title}
                  </span>
                </button>
              </h3>
              <div
                id={`sect-${index + 1}`}
                role="region"
                aria-labelledby={`accordeon-${index + 1}`}
                class="js-panel"
              >
                <slot name={'accordeon-' + (index + 1)}></slot>
              </div>
            </div>
          ))
        ) : (
          <div class="ip-acc-panel">
            <h3 class="js-acc-button">
              <button
                onClick={this.onSelectPanel.bind(this, 0)}
                aria-expanded="false"
                aria-controls="sect-1"
                id="accordeon-1"
              >
                <span class="accordion-title">Non consectetur a erat nam at lectus urna duis?</span>
              </button>
            </h3>
            <div id="sect-1" role="region" aria-labelledby="accordeon-1" class="js-panel">
              <div class="acc-content">
                <img
                  class="acc-content__image"
                  src={getAssetPath('assets/images/tab-img-1.png')}
                  alt=""
                />

                <div class="acc-content__desc-wrapper">
                  <h4 class="acc-content__title">Lorem ipsum dolor sit amet, a ac leo.</h4>
                  <p class="acc-content__desc">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis
                    condimentum nunc, eu gravida risus. Sed a consequat velit. Sed non elit tortor.
                    Nulla vestibulum, libero sed fringilla tempus, augue erat dictum quam, vehicula
                    consectetur leo massa ac leo. Nunc nibh magna, porta et volutpat eget, consequat
                    at risus.
                  </p>
                  <a class="acc-content__btn" href="#">
                    En savoir plus
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>,
    ];
  }
}
