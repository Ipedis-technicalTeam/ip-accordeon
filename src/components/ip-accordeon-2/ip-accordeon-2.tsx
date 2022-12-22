import { Component, h, Element, Prop, Watch, State, getAssetPath } from '@stencil/core';
import { AccordeonHeadersInterface } from './interface/accordeon-headers.interface';

@Component({
  tag: 'ip-accordeon-2',
  styleUrl: './ip-accordeon-2.scss',
  shadow: true,
  assetsDirs: ['assets'],
})
export class IpAccordeon2 {
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
  @State() accPanelContainer;
  @State() accPanels;

  @State() currentPanel;

  @Prop() isFirstPanelOpen: boolean;
  @Prop() isSingleOpen: boolean;

  @Prop() titleTag: string = 'h2';

  @Prop() gap: string = '20';

  componentWillLoad() {
    this.arrayDataWatcher(this.accordeonHeaders);

    setTimeout(() => {
      this.accHeaderButtons = this.el.shadowRoot.querySelector('#ip-accordeon').querySelectorAll('button');

      this.accPanelContainer = this.el.shadowRoot.querySelector('#ip-accordeon').querySelectorAll('.ip-acc-panel');

      this.accPanels = this.el.shadowRoot.querySelector('#ip-accordeon').querySelectorAll('.js-panel');

      this.setSlotId();

      this.openFirstPanel();

      this.computeButtonWidth();

      this.setTabIndex();
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

      firstPanel.setAttribute('style', `--width: ${firstButton.offsetWidth}px; left: ${firstButton.offsetWidth}px;`);

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

    const activePanel = this.el.querySelectorAll('[slot]')[index];
    const focusableElements = activePanel.querySelectorAll('a , button');

    if (selectedButton.getAttributeNode('aria-expanded').value === 'false') {
      focusableElements.forEach(focusableElement => {
        focusableElement.removeAttribute('tabindex');
      });

      this.accHeaderButtons.forEach(element => {
        if (element !== selectedButton) {
          element.setAttribute('tabindex', '-1');
        }
      });

      this.currentPanel = panel;
    } else {
      this.currentPanel = '';
      focusableElements.forEach(focusableElement => {
        focusableElement.setAttribute('tabindex', '-1');
      });

      this.accHeaderButtons.forEach(element => {
        if (element !== selectedButton) {
          element.removeAttribute('tabindex');
        }
      });
    }

    this.setAriaExpanded(selectedButton);

    this.isOpen(selectedButton);
  }

  isOpen(selectedButton: HTMLElement) {
    if (this.isSingleOpen) {
      this.accPanels.forEach(_panel => {
        // panel.style.blockSize = '0px';
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

  // set aria-expanded to true for selected button
  setAriaExpanded(selectedButton: HTMLElement) {
    if (selectedButton.getAttributeNode('aria-expanded').value === 'true') {
      selectedButton.setAttribute('aria-expanded', 'false');
    } else {
      selectedButton.setAttribute('aria-expanded', 'true');
    }
  }

  computeButtonWidth() {
    let buttonGap = parseInt(this.gap);

    const numButtons = this.accPanelContainer.length;
    const panelGap = buttonGap * (numButtons - 1);

    const panelWidth = this.el.shadowRoot.querySelector('.ip-accordeon').clientWidth - panelGap;

    const buttonWidth = panelWidth / numButtons;

    this.accPanelContainer.forEach((accPanels, index) => {
      accPanels.style.width = buttonWidth + 'px';
      accPanels.style.left = buttonWidth * index + buttonGap * index + 'px';
    });

    this.accPanels.forEach(panel => {
      panel.setAttribute('style', `--width: ${panelWidth + panelGap - buttonWidth}px; left: ${buttonWidth}px`);
    });
  }

  setTabIndex() {
    const slottedElems = this.el.querySelectorAll('[slot]');

    slottedElems.forEach(slotElem => {
      const focusableElements = slotElem.querySelectorAll('a, button');

      focusableElements.forEach(focusableElement => {
        focusableElement.setAttribute('tabindex', '-1');
      });
    });
  }

  render() {
    return [
      <div part="ip-accordeon" class="ip-accordeon" id="ip-accordeon">
        {this._accordeonHeaders ? (
          this._accordeonHeaders.map((tabHeader, index) => (
            <div
              part={
                this.currentPanel === 'panel-' + (index + 1)
                  ? `acc-panel acc-panel-active acc-panel-${index + 1}`
                  : `acc-panel acc-panel-${index + 1}`
              }
              class={this.currentPanel === 'panel-' + (index + 1) ? 'ip-acc-panel ip-acc-panel-active' : 'ip-acc-panel'}
            >
              {tabHeader.title ? (
                tabHeader.iconPath ? (
                  <this.titleTag part="acc-header" class="js-acc-button">
                    <button
                      part={this.currentPanel === 'panel-' + (index + 1) ? 'acc-btn acc-btn-active' : 'acc-btn'}
                      onClick={this.onSelectPanel.bind(this, index, 'panel-' + (index + 1))}
                      aria-expanded="false"
                      aria-controls={`sect-${index + 1}`}
                      id={`accordeon-${index + 1}`}
                    >
                      <span
                        part={
                          this.currentPanel === 'panel-' + (index + 1)
                            ? `acc-btn-image acc-${index + 1}-btn-image acc-btn-image-active`
                            : `acc-btn-image acc-${index + 1}-btn-image`
                        }
                      ></span>

                      <div
                        part={
                          this.currentPanel === 'panel-' + (index + 1)
                            ? 'acc-btn-wrapper acc-btn-wrapper-active'
                            : 'acc-btn-wrapper'
                        }
                      >
                        <img
                          part={this.currentPanel === 'panel-' + (index + 1) ? 'acc-icon acc-icon-active' : 'acc-icon'}
                          class="accordion-icon"
                          src={
                            this.currentPanel === 'panel-' + (index + 1)
                              ? tabHeader.iconActivePath
                                ? tabHeader.iconActivePath
                                : tabHeader.iconPath
                              : tabHeader.iconPath
                          }
                          alt=""
                        />
                        <span
                          part={
                            this.currentPanel === 'panel-' + (index + 1) ? 'acc-title acc-title-active' : 'acc-title'
                          }
                          class="accordion-title"
                        >
                          {tabHeader.title}
                        </span>
                        {tabHeader.subtitle ? (
                          <span
                            part={
                              this.currentPanel === 'panel-' + (index + 1)
                                ? 'acc-subtitle acc-subtitle-active'
                                : 'acc-subtitle'
                            }
                            class="accordion-subtitle"
                          >
                            {tabHeader.subtitle}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  </this.titleTag>
                ) : (
                  <this.titleTag part="acc-header" class="js-acc-button">
                    <button
                      part={this.currentPanel === 'panel-' + (index + 1) ? 'acc-btn acc-btn-active' : 'acc-btn'}
                      onClick={this.onSelectPanel.bind(this, index, 'panel-' + (index + 1))}
                      aria-expanded="false"
                      aria-controls={`sect-${index + 1}`}
                      id={`accordeon-${index + 1}`}
                    >
                      <span
                        part={
                          this.currentPanel === 'panel-' + (index + 1)
                            ? `acc-btn-image acc-${index + 1}-btn-image acc-btn-image-active`
                            : `acc-btn-image acc-${index + 1}-btn-image`
                        }
                      ></span>

                      <div
                        part={
                          this.currentPanel === 'panel-' + (index + 1)
                            ? 'acc-btn-wrapper acc-btn-wrapper-active'
                            : 'acc-btn-wrapper'
                        }
                      >
                        <span
                          part={
                            this.currentPanel === 'panel-' + (index + 1) ? 'acc-title acc-title-active' : 'acc-title'
                          }
                          class="accordion-title"
                        >
                          {tabHeader.title}
                        </span>
                        {tabHeader.subtitle ? (
                          <span
                            part={
                              this.currentPanel === 'panel-' + (index + 1)
                                ? 'acc-subtitle acc-subtitle-active'
                                : 'acc-subtitle'
                            }
                            class="accordion-subtitle"
                          >
                            {tabHeader.subtitle}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  </this.titleTag>
                )
              ) : (
                <div part="acc-header" class="js-acc-button">
                  <button
                    part={this.currentPanel === 'panel-' + (index + 1) ? 'acc-btn acc-btn-active' : 'acc-btn'}
                    onClick={this.onSelectPanel.bind(this, index, 'panel-' + (index + 1))}
                    aria-expanded="false"
                    aria-controls={`sect-${index + 1}`}
                    id={`accordeon-${index + 1}`}
                  >
                    <span
                      part={
                        this.currentPanel === 'panel-' + (index + 1)
                          ? `acc-btn-image acc-${index + 1}-btn-image acc-btn-image-active`
                          : `acc-btn-image acc-${index + 1}-btn-image`
                      }
                    ></span>

                    <div
                      part={
                        this.currentPanel === 'panel-' + (index + 1)
                          ? 'acc-btn-wrapper acc-btn-wrapper-active'
                          : 'acc-btn-wrapper'
                      }
                    >
                      <img
                        part={this.currentPanel === 'panel-' + (index + 1) ? 'acc-icon acc-icon-active' : 'acc-icon'}
                        class="accordion-icon"
                        src={
                          this.currentPanel === 'panel-' + (index + 1) ? tabHeader.iconActivePath : tabHeader.iconPath
                        }
                        alt=""
                      />
                    </div>
                  </button>
                </div>
              )}

              <div
                part={this.currentPanel === 'panel-' + (index + 1) ? 'acc-content acc-content-active' : 'acc-content'}
                id={`sect-${index + 1}`}
                role="region"
                aria-labelledby={`accordeon-${index + 1}`}
                class={this.currentPanel === 'panel-' + (index + 1) ? 'js-panel js-panel-active' : 'js-panel'}
              >
                <slot name={'accordeon-' + (index + 1)}></slot>
              </div>
            </div>
          ))
        ) : (
          <div part="acc-panel acc-panel-1" class="ip-acc-panel">
            <h2 part="acc-header" class="js-acc-button">
              <button
                part={this.currentPanel === 'panel-' + 1 ? 'acc-btn acc-btn-active' : 'acc-btn'}
                onClick={this.onSelectPanel.bind(this, 0)}
                aria-expanded="false"
                aria-controls="sect-1"
                id="accordeon-1"
              >
                <span
                  part={
                    this.currentPanel === 'panel-' + 1
                      ? `acc-btn-image acc-1-btn-image acc-btn-image-active`
                      : `acc-btn-image acc-1-btn-image`
                  }
                ></span>

                <div
                  part={
                    this.currentPanel === 'panel-' + 1 ? 'acc-btn-wrapper acc-btn-wrapper-active' : 'acc-btn-wrapper'
                  }
                >
                  <span
                    part={this.currentPanel === 'panel-' + 1 ? 'acc-title acc-title-active' : 'acc-title'}
                    class="accordion-title"
                  >
                    Accessibilité
                  </span>
                </div>
              </button>
            </h2>
            <div part="acc-content" id="sect-1" role="region" aria-labelledby="accordeon-1" class="js-panel">
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
