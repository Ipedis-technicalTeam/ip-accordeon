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

  @State() currentPanel;

  @Prop() isFirstPanelOpen: boolean;
  @Prop() isSingleOpen: boolean;

  @Prop() titleTag: string = 'h2';

  componentWillLoad() {
    this.arrayDataWatcher(this.accordeonHeaders);

    setTimeout(() => {
      this.accHeaderButtons = this.el.shadowRoot.querySelector('#ip-accordeon').querySelectorAll('button');

      this.accPanels = this.el.shadowRoot.querySelector('#ip-accordeon').querySelectorAll('.js-panel');

      this.setSlotId();

      this.openFirstPanel();
    }, 0);
  }

  // keep first panel open or not depending on prop 'isFirstPanelOpen'
  openFirstPanel() {
    if (this.isFirstPanelOpen) {
      const firstPanel = this.accPanels[0];
      const firstButton = this.accHeaderButtons[0];

      (this.accHeaderButtons[0] as HTMLElement).setAttribute('aria-expanded', 'true');
      this.currentPanel = 'panel-1';

      firstPanel.style.transition = 'none';
      firstPanel.style.height = firstPanel.scrollHeight + 'px';

      setTimeout(() => {
        firstPanel.style.transition = 'all 0.3s ease-in';
      }, 500);

      firstButton.style.transition = 'none';
      setTimeout(() => {
        firstButton.style.transition = 'all 0.3s ease-in-out';
      }, 500);
    }
  }

  // For accessibility - set an id on the slotted elements
  setSlotId() {
    const slottedElems = this.el.querySelectorAll('[slot]');

    slottedElems.forEach((slotElem, index) => {
      slotElem.setAttribute('id', 'sect-' + (index + 1));
    });
  }

  onSelectPanel(index: number, panel: string) {
    const selectedButton = this.accHeaderButtons[index];
    const selectedPanel = this.accPanels[index];

    if (selectedButton.getAttributeNode('aria-expanded').value === 'false') {
      this.currentPanel = panel;
    } else {
      this.currentPanel = '';
    }

    this.setAriaExpanded(selectedButton);

    this.isOpen(selectedButton);

    this.setHeight(selectedPanel);
  }

  isOpen(selectedButton: HTMLElement) {
    if (this.isSingleOpen) {
      this.accPanels.forEach(panel => {
        panel.style.height = '0px';
      });

      this.accHeaderButtons.forEach(accButton => {
        if (selectedButton === accButton && selectedButton.getAttributeNode('aria-expanded').value === 'true') {
          selectedButton.setAttribute('aria-expanded', 'true');
        } else {
          accButton.setAttribute('aria-expanded', 'false');
        }
      });
    }
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
    return [
      <div class="ip-accordeon" id="ip-accordeon">
        {this._accordeonHeaders ? (
          this._accordeonHeaders.map((tabHeader, index) => (
            <div part="acc-panel" class="ip-acc-panel">
              {tabHeader.title ? (
                tabHeader.iconPath ? (
                  <this.titleTag part="acc-header" class="js-acc-button">
                    <button
                      part="acc-btn"
                      onClick={this.onSelectPanel.bind(this, index, 'panel-' + (index + 1))}
                      aria-expanded="false"
                      aria-controls={`sect-${index + 1}`}
                      id={`accordeon-${index + 1}`}
                    >
                      <img
                        part="acc-icon"
                        class="accordion-icon"
                        src={
                          this.currentPanel === 'panel-' + (index + 1) ? tabHeader.iconActivePath : tabHeader.iconPath
                        }
                        alt=""
                      />
                      <span part="acc-title" class="accordion-title">
                        {tabHeader.title}
                      </span>
                    </button>
                  </this.titleTag>
                ) : (
                  <this.titleTag part="acc-header" class="js-acc-button">
                    <button
                      part="acc-btn"
                      onClick={this.onSelectPanel.bind(this, index, 'panel-' + (index + 1))}
                      aria-expanded="false"
                      aria-controls={`sect-${index + 1}`}
                      id={`accordeon-${index + 1}`}
                    >
                      <span part="acc-title" class="accordion-title">
                        {tabHeader.title}
                      </span>
                    </button>
                  </this.titleTag>
                )
              ) : (
                <div part="acc-header" class="js-acc-button">
                  <button
                    part="acc-btn"
                    onClick={this.onSelectPanel.bind(this, index, 'panel-' + (index + 1))}
                    aria-expanded="false"
                    aria-controls={`sect-${index + 1}`}
                    id={`accordeon-${index + 1}`}
                  >
                    <img
                      part="acc-icon"
                      class="accordion-icon"
                      src={this.currentPanel === 'panel-' + (index + 1) ? tabHeader.iconActivePath : tabHeader.iconPath}
                      alt=""
                    />
                  </button>
                </div>
              )}

              <div id={`sect-${index + 1}`} role="region" aria-labelledby={`accordeon-${index + 1}`} class="js-panel">
                <slot name={'accordeon-' + (index + 1)}></slot>
              </div>
            </div>
          ))
        ) : (
          <div part="acc-panel" class="ip-acc-panel">
            <h2 part="acc-header" class="js-acc-button">
              <button
                part="acc-btn"
                onClick={this.onSelectPanel.bind(this, 0)}
                aria-expanded="false"
                aria-controls="sect-1"
                id="accordeon-1"
              >
                <span part="acc-title" class="accordion-title">
                  Accessibilité
                </span>
              </button>
            </h2>
            <div id="sect-1" role="region" aria-labelledby="accordeon-1" class="js-panel">
              <div class="acc-content">
                <img class="acc-content__image" src={getAssetPath('assets/images/tab-img-1.png')} alt="" />

                <div class="acc-content__desc-wrapper">
                  <h4 class="acc-content__title">6 Bonnes Pratiques pour être en Conformité</h4>
                  <p class="acc-content__desc">
                    Aujourd&apos;hui, encore beaucoup de sites Web et d&apos;applications mobiles sont conçus sans
                    penser à la navigation des personnes en situation de handicap. Pourtant, pour ces personnes,
                    l&apos;outil digital représente un véritable levier d&apos;intégration, et leur apporte bien souvent
                    un surcroît d&apos;indépendance. Selon les différents types de handicaps, les manquements les plus
                    couramment relevés sur le Web ne sont pas les mêmes.
                  </p>
                  <a
                    class="acc-content__btn"
                    aria-label="En savoir plus, 6 Bonnes Pratiques pour être en Conformité"
                    href="#"
                  >
                    En&nbsp;savoir&nbsp;plus
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
